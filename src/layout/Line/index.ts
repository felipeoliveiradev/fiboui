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

function isDecorative(ariaHidden: unknown, role: unknown): boolean {
  if (ariaHidden === true || ariaHidden === 'true') return true;
  return role === 'none' || role === 'presentation';
}

function isVerticalFlex(style: CSSProperties): boolean {
  return style.flexDirection === 'column' || style.flexDirection === 'column-reverse';
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

class LineBuilder extends FiboBuilder {
  private _sizeHeight?: string;

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

  sizeHeight(value: string): this {
    this._sizeHeight = value;
    return this;
  }

  /** Separator axis. `vertical` paints a 1px column rule. */
  direction(value: 'horizontal' | 'vertical'): this {
    return this.flexDirection(value === 'vertical' ? 'column' : 'row');
  }

  build(): ReactElement {
    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const { className: extraClass, style: propsStyle, ...dom } = rest;
    const style: CSSProperties = { ...this.getStyle(), ...extraStyle(propsStyle) };
    if (this._sizeHeight) {
      style.height = this._sizeHeight;
    }
    const resolved = nodes.map(resolveInterpChild);
    const vertical = isVerticalFlex(style);
    const decorative = isDecorative(dom['aria-hidden'], dom.role);
    const className = ['fibo-line', ...this._classNames, extraClass]
      .filter(Boolean)
      .join(' ');

    if (vertical && resolved.length === 0) {
      style.width = style.width ?? '1px';
      style.alignSelf = style.alignSelf ?? 'stretch';
      if (style.height == null) style.height = '100%';
      if (decorative) {
        return React.createElement('div', {
          ...dom,
          role: 'none',
          'aria-hidden': true,
          'aria-orientation': undefined,
          style,
          className,
        });
      }
      return React.createElement('div', {
        ...dom,
        role: 'separator',
        'aria-orientation': 'vertical',
        style,
        className,
      });
    }

    if (resolved.length === 0) {
      if (decorative) {
        return React.createElement('hr', {
          ...dom,
          role: 'none',
          'aria-hidden': true,
          'aria-orientation': undefined,
          style,
          className,
        });
      }
      return React.createElement('hr', {
        ...dom,
        role: 'separator',
        'aria-orientation': 'horizontal',
        style,
        className,
      });
    }

    const rowClass = [
      'fibo-line',
      'flex',
      vertical ? 'flex-col' : 'flex-row',
      'min-w-0',
      ...this._classNames,
      extraClass,
    ]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'div',
      {
        ...dom,
        style,
        className: rowClass,
      },
      ...resolved
    );
  }
}

export const Line = createBuilder(LineBuilder);

export interface LineProps extends ChildrenProps {
  sizeHeight?: string;
}
