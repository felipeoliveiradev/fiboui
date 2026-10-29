import React, { ReactElement, ReactNode, CSSProperties } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { StackAlign, stackAlignFlex } from '../../core/tokens';
import { isFixedNumericFrame, type FrameSpec } from '../../core/frame';

/**
 * SwiftUI ZStack sizes from its children (max / ideal). When the base child
 * already has a fixed `.frame({ width, height })` (Image or any builder),
 * promote that box onto the ZStack host so outer `.clipShape` / `.contentShape`
 * / gestures always see a stable layout frame — even before an `<img>` paints.
 */
function readBaseFixedFrame(node: unknown): { width: number; height: number } | undefined {
  if (node == null || typeof node !== 'object') return undefined;
  const o = node as Record<string, unknown>;
  if (typeof o._frameWidth === 'number' && typeof o._frameHeight === 'number') {
    return { width: o._frameWidth as number, height: o._frameHeight as number };
  }
  const frames = o._frames as FrameSpec[] | undefined;
  if (!frames?.length) return undefined;
  const spec = frames[frames.length - 1];
  if (isFixedNumericFrame(spec)) {
    return { width: spec.width, height: spec.height };
  }
  return undefined;
}

function firstChildOf(children: FiboChildren | undefined): unknown {
  if (children == null) return undefined;
  const list = Array.isArray(children) ? children : [children];
  for (const item of list) {
    if (item != null && typeof item !== 'boolean') return item;
  }
  return undefined;
}

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function bindInterpTree(host: FiboBuilder, node: unknown): void {
  if (typeof node === 'function') {
    try {
      bindInterpTree(host, (node as () => unknown)());
    } catch {
      /* factory may need mount */
    }
    return;
  }
  if (typeof node === 'string') {
    bindInterp(host, node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) bindInterpTree(host, item);
  }
}

function resolveInterpChild(child: ReactNode): ReactNode {
  return typeof child === 'string' && hasInterpMarks(child)
    ? resolveInterpString(child)
    : child;
}

function hostNodes(
  fromBuilder: ReactNode[],
  props: Record<string, any>
): { nodes: ReactNode[]; rest: Record<string, any> } {
  const { children: propsChildren, ...rest } = props;
  const source = propsChildren !== undefined ? propsChildren : fromBuilder;
  const nodes = source == null ? [] : Array.isArray(source) ? source : [source];
  return { nodes, rest };
}

/**
 * ## ZStack — mental model (SwiftUI / Flutter)
 *
 * | FiboUI | SwiftUI | Flutter |
 * |---|---|---|
 * | `ZStack` | `ZStack` + `.overlay` | `Stack` |
 * | child 0 (base) | primary / `.background` host | non-positioned child |
 * | child 1…n | `.overlay(alignment:)` | `Positioned.fill` + `Align` |
 * | `.fit('content')` | ideal-size (default) | `StackFit.loose` |
 * | `.fit('expand')` | frame max / expand | `StackFit.expand` |
 * | `.alignment(...)` | `Alignment` | `Alignment` |
 *
 * **Size (SwiftUI):** the stack’s layout size comes from its children — FiboUI
 * uses the **base** (index 0) as the size driver (overlays are absolute and
 * cannot grow the stack). If the base has a fixed `.frame({ width, height })`,
 * that size is copied onto the ZStack host so chrome/gestures outside the
 * stack always wrap a real box (no “sometimes empty” hit target).
 *
 * You do **not** have to repeat `.frame` on the ZStack when the base is already
 * framed; an extra `.frame` on the stack still wins (wraps / clamps).
 * Host `.width(Size.full)` / `.height(n)` win over the promoted base frame on
 * that axis (full-bleed hero: wide image frame + `w-full` stack).
 *
 * **Hit-testing (SwiftUI):** taps on containers only hit drawn content unless
 * `.contentShape(Rectangle())` is set (or a gesture auto-defaults it).
 *
 * ```ts
 * ZStack()
 *   .alignment(StackAlign.bottom)
 *   .children([
 *     Image(url).scaledToFill().frame({ width: 300, height: 400 }),
 *     Text(title).width('100%').padding(12),
 *   ])
 *   .clipShape('8px')
 *   .contentShape('rectangle') // or rely on gesture default
 *   .onTapGesture(open)
 * ```
 */
/** @deprecated Prefer {@link StackAlign} / `StackAlign.topTrailing` — same values. */
export type ZStackAlignment = StackAlign | keyof typeof StackAlign;

/** `content` = size to base (SwiftUI default / StackFit.loose).
 *  `expand` = fill parent (StackFit.expand). */
export type ZStackFit = 'content' | 'expand';

function wrapZStackLayer(
  child: ReactNode,
  index: number,
  alignment: ZStackAlignment
): ReactNode {
  if (child == null || typeof child === 'boolean') return null;

  const isBase = index === 0;
  const flex = stackAlignFlex(alignment);

  if (isBase) {
    return React.createElement(
      'div',
      {
        key: `fibo-zstack-layer-${index}`,
        className: 'fibo-zstack-layer fibo-zstack-layer-base',
        style: {
          position: 'relative',
          zIndex: 0,
          isolation: 'isolate',
          // Shrink-wrap the base child (Image/Box). No overflow clip on the
          // base so shadows/glows on the poster are not cut — overlays clip.
          minWidth: 0,
          minHeight: 0,
          maxWidth: '100%',
          lineHeight: 0, // kill inline-img baseline gap if child is reset to inline
        } satisfies CSSProperties,
      },
      child
    );
  }

  // Overlay layer = SwiftUI overlay / Flutter Positioned.fill.
  // Inner slot is a full-size flex box so:
  //   - Text.width('100%') resolves to the stack width
  //   - badge without width hugs and sits on `.alignment(...)`
  //   - minWidth:0 prevents flex min-content from blowing past the poster
  return React.createElement(
    'div',
    {
      key: `fibo-zstack-layer-${index}`,
      className: 'fibo-zstack-layer fibo-zstack-layer-overlay',
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: index,
        isolation: 'isolate',
        overflow: 'hidden',
        boxSizing: 'border-box',
        minWidth: 0,
        minHeight: 0,
        maxWidth: '100%',
        maxHeight: '100%',
        pointerEvents: 'none',
      } satisfies CSSProperties,
    },
    React.createElement(
      'div',
      {
        className: 'fibo-zstack-overlay-content',
        style: {
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          display: 'flex',
          ...flex,
        } satisfies CSSProperties,
      },
      child
    )
  );
}

class ZStackBuilder extends FiboBuilder {
  private _alignment: ZStackAlignment = 'center';
  private _fit: ZStackFit = 'content';
  /** Copied from base child’s fixed frame, if any. */
  private _baseFixedFrame?: { width: number; height: number };

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    this._baseFixedFrame = readBaseFixedFrame(firstChildOf(children));
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
      this._baseFixedFrame = readBaseFixedFrame(firstChildOf(value.children));
    }
    return super.props(value);
  }

  alignment(align: ZStackAlignment): this {
    this._alignment = align;
    return this;
  }

  /**
   * How the stack sizes itself.
   * - `content` (default): hug the base child — SwiftUI ideal size / `StackFit.loose`
   * - `expand`: fill the parent — `StackFit.expand`
   *
   * `.hug()` still forces content; explicit `.width('100%')` still fills.
   */
  fit(value: ZStackFit): this {
    this._fit = value;
    return this;
  }

  build(): ReactElement {
    const hug = this.isHug() || this._fit === 'content';
    const classes = [
      'fibo-zstack',
      'relative',
      'isolate',
      'overflow-hidden',
      hug ? 'w-auto self-auto' : 'w-full min-w-0 min-h-0 self-stretch',
      ...this._classNames,
    ];

    const style = this.getStyle();
    if (style.overflow == null) style.overflow = 'hidden';
    // Promote base Image/builder `.frame({ width, height })` onto this host so
    // outer modifiers always wrap a definite box (SwiftUI child-driven size).
    // Skip an axis when the host already declared it — `.width(Size.full)` is
    // class-only (`w-full`), so `style.width == null` used to let a 1600px base
    // frame clobber full-bleed and push scaffold-body horizontal scroll.
    if (this._baseFixedFrame) {
      const hostWidth =
        style.width != null ||
        this._classNames.some(
          (c) => c === 'w-full' || c.startsWith('w-') || c.startsWith('fibo-width-'),
        );
      const hostHeight =
        style.height != null ||
        this._classNames.some(
          (c) => c === 'h-full' || c.startsWith('h-') || c.startsWith('fibo-height-'),
        );
      if (!hostWidth) style.width = `${this._baseFixedFrame.width}px`;
      if (!hostHeight) style.height = `${this._baseFixedFrame.height}px`;
    } else if (hug && style.height == null && style.minHeight == null) {
      // Content fit: height follows base too (not only width via w-auto).
      style.height = 'fit-content';
    }

    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const { className: extraClass, ...dom } = rest;
    const className = [...classes, extraClass].filter(Boolean).join(' ');
    const layers = nodes
      .map(resolveInterpChild)
      .map((child, index) => wrapZStackLayer(child, index, this._alignment));

    return React.createElement(
      'div',
      {
        style,
        ...dom,
        className,
      },
      ...layers
    );
  }
}

export const ZStack = createBuilder(ZStackBuilder);

export interface ZStackProps extends ChildrenProps {
  alignment?: ZStackAlignment;
  fit?: ZStackFit;
}
