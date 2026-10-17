import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

function toCssSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
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

class WrapBuilder extends FiboBuilder {
  private _direction: 'horizontal' | 'vertical' = 'horizontal';
  private _spacing?: string | number;
  private _runSpacing?: string | number;

  direction(value: 'horizontal' | 'vertical'): this {
    this._direction = value;
    return this;
  }

  spacing(value: string | number): this {
    this._spacing = value;
    return this;
  }

  runSpacing(value: string | number): this {
    this._runSpacing = value;
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
    style.display = 'flex';
    style.flexWrap = 'wrap';
    style.flexDirection = this._direction === 'vertical' ? 'column' : 'row';
    if (this._spacing != null) style.gap = toCssSize(this._spacing);
    if (this._runSpacing != null) style.rowGap = toCssSize(this._runSpacing);

    const { children: propsChildren, className: extraClass, ...rest } = this._props;
    const source = propsChildren !== undefined ? propsChildren : this.processChildren();
    const nodes = (source == null ? [] : Array.isArray(source) ? source : [source]).map(
      resolveInterpChild
    );
    const className = ['fibo-wrap', this.getClassName(), extraClass].filter(Boolean).join(' ');

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

export const Wrap = createBuilder(WrapBuilder);

export interface WrapProps extends ChildrenProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: string | number;
  runSpacing?: string | number;
}
