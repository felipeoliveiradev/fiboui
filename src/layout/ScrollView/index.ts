import React, { ReactElement, ReactNode, Ref } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { ScrollController } from './ScrollController';
import { PullToRefresh } from './PullToRefresh';

export { ScrollController } from './ScrollController';
export { ScrollViewReader } from './ScrollViewReader';
export type { ScrollViewProxy } from './ScrollViewReader';

type ScrollDirection = 'vertical' | 'horizontal' | 'both';
type ScrollbarVisibility = 'hidden' | 'visible' | 'auto';
type ScrollAnchor = 'start' | 'center' | 'end';

function snapTypeFor(direction: ScrollDirection): React.CSSProperties['scrollSnapType'] {
  if (direction === 'horizontal') return 'x mandatory';
  if (direction === 'both') return 'both mandatory';
  return 'y mandatory';
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
  const raw = source == null ? [] : Array.isArray(source) ? source : [source];
  return { nodes: raw.map(resolveInterpChild), rest };
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(value);
      else (ref as React.MutableRefObject<T>).current = value;
    }
  };
}

function isScrollDirection(value: unknown): value is ScrollDirection {
  return value === 'horizontal' || value === 'vertical' || value === 'both';
}

function isScrollbarVisibility(value: unknown): value is ScrollbarVisibility {
  return value === 'hidden' || value === 'visible' || value === 'auto';
}

/** Expand leftover `overflow` shorthand so longhands (direction) are not reset. */
function expandOverflow(style: React.CSSProperties): React.CSSProperties {
  const next = { ...style } as Record<string, unknown>;
  const raw = next.overflow;
  if (raw == null || raw === '') {
    delete next.overflow;
    return next as React.CSSProperties;
  }
  const parts = String(raw).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    delete next.overflow;
    return next as React.CSSProperties;
  }
  const x = parts[0];
  const y = parts[1] ?? parts[0];
  if (next.overflowX == null) next.overflowX = x;
  if (next.overflowY == null) next.overflowY = y;
  delete next.overflow;
  return next as React.CSSProperties;
}

class ScrollViewBuilder extends FiboBuilder {
  private _direction: ScrollDirection = 'vertical';
  private _scrollbar: ScrollbarVisibility = 'auto';
  private _controller?: ScrollController;
  private _anchor?: ScrollAnchor;
  private _refresh?: () => void;
  private _scrollTargetLayout = false;
  private _scrollPosition?: string;

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
    }
    return super.props(value);
  }

  direction(direction: ScrollDirection): this {
    this._direction = direction;
    return this;
  }

  horizontal(): this {
    this._direction = 'horizontal';
    return this;
  }

  vertical(): this {
    this._direction = 'vertical';
    return this;
  }

  scrollbar(visibility: ScrollbarVisibility): this {
    this._scrollbar = visibility;
    return this;
  }

  /** Attach a ScrollController for programmatic scroll (carousel prev/next). */
  controller(controller: ScrollController): this {
    this._controller = controller;
    return this;
  }

  scrollAnchor(anchor: ScrollAnchor): this {
    this._anchor = anchor;
    return this;
  }

  refreshable(handler: () => void): this {
    this._refresh = handler;
    return this;
  }

  /**
   * SwiftUI `scrollTargetLayout` — children participate as scroll targets
   * (snap + `data-scroll-target-layout`).
   */
  scrollTargetLayout(enabled: boolean = true): this {
    this._scrollTargetLayout = enabled;
    if (enabled && !this._anchor) this._anchor = 'start';
    return this;
  }

  /**
   * SwiftUI `scrollPosition(id:)` — initial / programmatic target id
   * (`data-scroll-position`). Pair with `.scrollTarget(id)` on children.
   */
  scrollPosition(id: string): this {
    this._scrollPosition = id;
    return this;
  }

  /**
   * Native scroll listener on the overflow host.
   * String presets still alias `.reveal()` from FiboBuilder.
   */
  onScroll(preset?: string): this;
  onScroll(handler: (event: React.UIEvent<HTMLDivElement>) => void): this;
  onScroll(
    preset: string | ((event: React.UIEvent<HTMLDivElement>) => void) = 'fadeIn',
  ): this {
    if (typeof preset === 'function') {
      this._props.onScroll = preset;
      return this;
    }
    return super.onScroll(preset);
  }

  build(): ReactElement {
    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const {
      ref: userRef,
      className: extraClass,
      style: extraStyle,
      controller: propsController,
      direction: propsDirection,
      scrollbar: propsScrollbar,
      onScroll,
      ...dom
    } = rest as Record<string, any>;

    const direction = isScrollDirection(propsDirection) ? propsDirection : this._direction;
    const scrollbar = isScrollbarVisibility(propsScrollbar) ? propsScrollbar : this._scrollbar;
    const controller =
      this._controller ??
      (propsController instanceof ScrollController ? propsController : undefined);

    const horizontal = direction === 'horizontal' || direction === 'both';
    const vertical = direction === 'vertical' || direction === 'both';
    const userStyle = this.getStyle();
    const { gap, rowGap, columnGap, ...restUser } = userStyle;

    const overflowX: React.CSSProperties['overflowX'] = horizontal ? 'auto' : 'hidden';
    const overflowY: React.CSSProperties['overflowY'] = vertical ? 'auto' : 'hidden';

    const innerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      flexWrap: 'nowrap',
      flex: '0 0 auto',
    };
    if (gap != null) innerStyle.gap = gap;
    if (rowGap != null) innerStyle.rowGap = rowGap;
    if (columnGap != null) innerStyle.columnGap = columnGap;
    if (direction === 'horizontal') {
      innerStyle.width = 'max-content';
      innerStyle.minHeight = '0px';
    } else if (direction === 'both') {
      innerStyle.width = 'max-content';
      innerStyle.height = 'max-content';
      innerStyle.minWidth = '0px';
      innerStyle.minHeight = '0px';
    } else {
      innerStyle.width = '100%';
      innerStyle.maxWidth = '100%';
      innerStyle.minWidth = '0px';
    }

    const classNames = [
      'fibo-scrollview',
      ...this.getClassName().split(' ').filter(Boolean),
      extraClass,
    ];

    const painted = expandOverflow({
      ...restUser,
      ...(extraStyle && typeof extraStyle === 'object' ? extraStyle : {}),
    });

    const scrollStyles: React.CSSProperties = {
      WebkitOverflowScrolling: 'touch',
      minWidth: '0px',
      minHeight: '0px',
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      ...painted,
      // Direction overflow must survive `.props({ style })` replacing the object.
      overflowX,
      overflowY,
    };

    if (scrollbar === 'hidden') {
      classNames.push('scrollbar-hide');
      scrollStyles.scrollbarWidth = 'none';
      scrollStyles.msOverflowStyle = 'none';
    }

    if (this._anchor) {
      scrollStyles.scrollSnapAlign = this._anchor;
      const existingSnap =
        scrollStyles.scrollSnapType ??
        (scrollStyles as React.CSSProperties & { 'scroll-snap-type'?: string })['scroll-snap-type'];
      if (existingSnap == null || existingSnap === '') {
        scrollStyles.scrollSnapType = snapTypeFor(direction);
      }
    }

    const scrollPositionId = this._scrollPosition;

    const attachRef = mergeRefs<HTMLDivElement>(
      (node) => {
        controller?.attach(node);
        if (node && scrollPositionId) {
          requestAnimationFrame(() => {
            const safe =
              typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
                ? CSS.escape(scrollPositionId)
                : scrollPositionId.replace(/"/g, '\\"');
            const target = node.querySelector(
              `[data-scroll-id="${safe}"]`
            ) as HTMLElement | null;
            target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          });
        }
      },
      userRef as Ref<HTMLDivElement> | undefined,
    );

    const refresh = this._refresh;

    const inner = React.createElement(
      'div',
      { className: 'fibo-scroll-inner', style: innerStyle },
      ...nodes,
    );

    if (this._scrollTargetLayout) {
      classNames.push('fibo-scroll-target-layout');
      if (scrollStyles.scrollSnapType == null) {
        scrollStyles.scrollSnapType = snapTypeFor(direction);
      }
    }

    const scrollHost = React.createElement(
      'div',
      {
        ...dom,
        ...(this._anchor ? { 'data-scroll-anchor': this._anchor } : {}),
        ...(this._scrollTargetLayout ? { 'data-scroll-target-layout': '1' } : {}),
        ...(scrollPositionId ? { 'data-scroll-position': scrollPositionId } : {}),
        'data-fibo-scroll-host': '',
        className: classNames.filter(Boolean).join(' '),
        style: scrollStyles,
        ref: attachRef,
        onScroll,
      },
      inner,
    );

    if (!refresh || direction === 'horizontal') {
      return scrollHost;
    }

    // Vertical / both: real pull-to-refresh (no stub button).
    return React.createElement(PullToRefresh, {
      onRefresh: refresh,
      children: scrollHost,
    });
  }
}

export const ScrollView = createBuilder(ScrollViewBuilder);

export interface ScrollViewProps extends BaseProps {
  direction?: ScrollDirection;
  scrollbar?: ScrollbarVisibility;
  controller?: ScrollController;
}
