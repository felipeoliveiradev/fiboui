import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren, MainAxisAlignment, CrossAxisAlignment } from '../../core/types';
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

class ColumnBuilder extends FiboBuilder {
  private _mainAxisAlignment: MainAxisAlignment = 'start';
  // Flutter Column / SwiftUI VStack default: center. Stretch is opt-in.
  private _crossAxisAlignment: CrossAxisAlignment = 'center';
  private _spacing?: string | number;
  private _size?: 'small' | 'medium' | 'large';

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

  mainAxisAlignment(alignment: MainAxisAlignment): this {
    this._mainAxisAlignment = alignment;
    return this;
  }

  crossAxisAlignment(alignment: CrossAxisAlignment): this {
    this._crossAxisAlignment = alignment;
    return this;
  }

  spacing(value: string | number): this {
    this._spacing = value;
    return this;
  }

  size(size: 'small' | 'medium' | 'large'): this {
    this._size = size;
    return this;
  }

  build(): ReactElement {
    const alignmentMap: Record<MainAxisAlignment, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      spaceBetween: 'justify-between',
      spaceAround: 'justify-around',
      spaceEvenly: 'justify-evenly',
    };

    const crossAlignmentMap: Record<CrossAxisAlignment, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const sizeMap = {
      small: 'flex-[0.3]',
      medium: 'flex-1',
      large: 'flex-[1.5]',
    };

    const classes = [
      'fibo-column',
      'flex',
      'flex-col',
      // min-w-0 / min-h-0: shrink inside flex/grid so nested overflow can scroll
      this.isHug() ? 'w-auto self-auto' : 'w-full min-w-0 min-h-0',
      alignmentMap[this._mainAxisAlignment],
      crossAlignmentMap[this._crossAxisAlignment],
      this._size ? sizeMap[this._size] : '',
      ...this._classNames,
    ];

    const style = this.getStyle();

    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const { className: extraClass, style: propsStyle, ...dom } = rest;
    const className = [...classes, extraClass].filter(Boolean).join(' ');
    const resolved = nodes.map(resolveInterpChild);
    const merged = {
      ...style,
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    if (this._spacing != null && this._spacing !== '') {
      if (typeof this._spacing === 'number') {
        merged.gap = `${this._spacing}px`;
      } else if (!isNaN(Number(this._spacing))) {
        merged.gap = `${Number(this._spacing) * 4}px`;
      } else {
        merged.gap = this._spacing;
      }
    }

    return React.createElement(
      'div',
      {
        style: merged,
        ...dom,
        className,
      },
      ...resolved
    );
  }
}

export const Column = createBuilder(ColumnBuilder);

export interface ColumnProps extends ChildrenProps {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  spacing?: string | number;
  size?: 'small' | 'medium' | 'large';
}
