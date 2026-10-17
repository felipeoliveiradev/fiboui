import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChild, FiboChildren } from '../../core/types';
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

class OverlayBuilder extends FiboBuilder {
  private _back?: ReactNode;
  private _front?: ReactNode;
  private _paired = false;

  child(node: FiboChild): this {
    bindInterpTree(this, node);
    this._back = node as ReactNode;
    this._paired = true;
    return this;
  }

  overlay(node: FiboChild): this {
    bindInterpTree(this, node);
    this._front = node as ReactNode;
    this._paired = true;
    return this;
  }

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    this._paired = false;
    this._back = undefined;
    this._front = undefined;
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
    style.position = style.position ?? 'relative';

    const { children: propsChildren, className: extraClass, ...rest } = this._props;
    let nodes: ReactNode[];
    if (this._paired && propsChildren === undefined) {
      nodes = [this._back, this._front].filter((node) => node !== undefined);
    } else {
      const source = propsChildren !== undefined ? propsChildren : this.processChildren();
      nodes = source == null ? [] : Array.isArray(source) ? source : [source];
    }
    nodes = nodes.map(resolveInterpChild);

    const className = ['fibo-overlay', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    const rendered = nodes.map((node, index) => {
      if (index !== 1) return node;
      return React.createElement(
        'div',
        {
          key: 'fibo-overlay-front',
          className: 'fibo-overlay-front',
          style: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: style.alignItems,
            justifyContent: style.justifyContent,
          },
        },
        node
      );
    });

    return React.createElement(
      'div',
      {
        style,
        ...rest,
        className,
      },
      ...rendered
    );
  }
}

export const Overlay = createBuilder(OverlayBuilder);

export interface OverlayProps extends ChildrenProps {}
