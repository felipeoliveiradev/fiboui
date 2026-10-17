import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

type SafeEdge = 'top' | 'bottom' | 'left' | 'right';
type SafeEdges = SafeEdge | 'all' | Array<SafeEdge | 'all'>;

const ALL_EDGES: SafeEdge[] = ['top', 'bottom', 'left', 'right'];

const PADDING_PROP: Record<SafeEdge, keyof CSSProperties> = {
  top: 'paddingTop',
  bottom: 'paddingBottom',
  left: 'paddingLeft',
  right: 'paddingRight',
};

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

function normalizeEdges(value: SafeEdges): SafeEdge[] {
  const list = Array.isArray(value) ? value : [value];
  if (list.includes('all')) return ALL_EDGES;
  return list.filter((edge): edge is SafeEdge => edge !== 'all');
}

class SafeAreaBuilder extends FiboBuilder {
  private _edges: SafeEdge[] = ALL_EDGES;

  edges(value: SafeEdges): this {
    this._edges = normalizeEdges(value);
    return this;
  }

  /** SwiftUI `ignoresSafeArea`. Drops every inset. */
  ignoresSafeArea(): this {
    this._edges = [];
    return this;
  }

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
    const style = this.getStyle();
    for (const edge of this._edges) {
      (style as Record<string, string>)[PADDING_PROP[edge]] = `env(safe-area-inset-${edge})`;
    }

    const { children: propsChildren, className: extraClass, ...rest } = this._props;
    const source = propsChildren !== undefined ? propsChildren : this.processChildren();
    const nodes = (source == null ? [] : Array.isArray(source) ? source : [source]).map(
      resolveInterpChild
    );
    const className = ['fibo-safe-area', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'div',
      {
        style,
        ...rest,
        className,
      },
      ...nodes
    );
  }
}

export const SafeArea = createBuilder(SafeAreaBuilder);

export interface SafeAreaProps extends ChildrenProps {
  edges?: SafeEdges;
}
