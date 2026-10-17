import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

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

function extraStyle(value: unknown): CSSProperties {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as CSSProperties)
    : {};
}

/** Inline flex + mx-auto so Center actually centers without Tailwind utilities. */
function paintCenter(style: CSSProperties): void {
  if (style.display !== 'none') {
    style.display = 'flex';
    if (style.alignItems == null || style.alignItems === '') style.alignItems = 'center';
    if (style.justifyContent == null || style.justifyContent === '') {
      style.justifyContent = 'center';
    }
  }
  if (style.margin == null) {
    if (style.marginLeft == null) style.marginLeft = 'auto';
    if (style.marginRight == null) style.marginRight = 'auto';
  }
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

class CenterBuilder extends FiboBuilder {
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

  build(): ReactElement {
    const classes = [
      'fibo-center',
      'flex',
      'items-center',
      'justify-center',
      // Fill the parent so centering is visible; min-* lets flex ancestors shrink
      // instead of clipping overflowing children.
      this.isHug() ? 'w-auto self-auto' : 'w-full min-w-0 min-h-0 self-stretch',
      ...this._classNames,
    ];

    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const { className: extraClass, style: propsStyle, ...dom } = rest;
    const className = [...classes, extraClass].filter(Boolean).join(' ');
    const resolved = nodes.map(resolveInterpChild);
    const style: CSSProperties = { ...this.getStyle(), ...extraStyle(propsStyle) };
    paintCenter(style);

    return React.createElement(
      'div',
      {
        style,
        ...dom,
        className,
      },
      ...resolved
    );
  }
}

export const Center = createBuilder(CenterBuilder);

export interface CenterProps extends ChildrenProps {}
