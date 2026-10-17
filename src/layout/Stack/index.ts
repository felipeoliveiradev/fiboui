import React, { ReactElement, ReactNode } from 'react';
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

function hostNodes(
  fromBuilder: ReactNode[],
  props: Record<string, any>
): { nodes: ReactNode[]; rest: Record<string, any> } {
  const { children: propsChildren, ...rest } = props;
  const source = propsChildren !== undefined ? propsChildren : fromBuilder;
  const nodes = source == null ? [] : Array.isArray(source) ? source : [source];
  return { nodes, rest };
}

class ZStackBuilder extends FiboBuilder {
  private _alignment: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' = 'center';

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

  alignment(align: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): this {
    this._alignment = align;
    return this;
  }

  build(): ReactElement {
    // Longhands only: place-items-* also sets justify-items and fights
    // justify-items-* depending on stylesheet order.
    const alignmentClasses: Record<string, string> = {
      center: 'items-center justify-items-center',
      top: 'items-start justify-items-center',
      bottom: 'items-end justify-items-center',
      left: 'justify-items-start items-center',
      right: 'justify-items-end items-center',
      topLeft: 'items-start justify-items-start',
      topRight: 'justify-items-end items-start',
      bottomLeft: 'justify-items-start items-end',
      bottomRight: 'items-end justify-items-end',
    };

    const classes = [
      'fibo-zstack',
      // Containing block + stacking context: abspos children pin here,
      // child z-index does not leak to the page.
      'relative',
      'isolate',
      'grid',
      'grid-cols-1',
      'grid-rows-1',
      '[&>*]:col-start-1',
      '[&>*]:row-start-1',
      // Layer isolate: z-index:-1 FX (::before) stay inside each sibling.
      // Do not force [&>*]:absolute — grid overlay, not inset-0 leftover.
      '[&>*]:isolate',
      this.isHug() ? 'w-auto self-auto' : 'w-full min-w-0 min-h-0 self-stretch',
      alignmentClasses[this._alignment] || 'items-center justify-items-center',
      ...this._classNames
    ];

    const style = this.getStyle();
    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const { className: extraClass, ...dom } = rest;
    const className = [...classes, extraClass].filter(Boolean).join(' ');
    const resolved = nodes.map(resolveInterpChild);

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

export const ZStack = createBuilder(ZStackBuilder);

export interface ZStackProps extends ChildrenProps {
  alignment?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}
