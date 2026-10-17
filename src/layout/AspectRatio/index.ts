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

class AspectRatioBuilder extends FiboBuilder {
  private _ratio: number;
  private _widthSet = false;

  constructor(ratio = 1) {
    super();
    this._ratio = ratio;
  }

  ratio(value: number): this {
    this._ratio = value;
    return this;
  }

  width(value: string | number): this {
    this._widthSet = true;
    return super.width(value);
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
    style.aspectRatio = String(this._ratio);
    if (!this._widthSet && style.width == null) {
      style.width = '100%';
    }

    const { children: propsChildren, className: extraClass, ...rest } = this._props;
    const source = propsChildren !== undefined ? propsChildren : this.processChildren();
    const nodes = (source == null ? [] : Array.isArray(source) ? source : [source]).map(
      resolveInterpChild
    );
    const className = ['fibo-aspect-ratio', this.getClassName(), extraClass]
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

export const AspectRatio = createBuilder(AspectRatioBuilder);

export interface AspectRatioProps extends ChildrenProps {
  ratio?: number;
}
