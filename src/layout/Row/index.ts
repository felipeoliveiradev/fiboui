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
  const raw = source == null ? [] : Array.isArray(source) ? source : [source];
  return { nodes: raw.map(resolveInterpChild), rest };
}

function mergeHostStyle(
  host: React.CSSProperties,
  extra: unknown
): React.CSSProperties {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return { ...host };
  return { ...host, ...(extra as React.CSSProperties) };
}

function rowDirectionClass(dir: unknown): string {
  if (dir === 'row-reverse') return 'flex-row-reverse';
  if (dir === 'column') return 'flex-col';
  if (dir === 'column-reverse') return 'flex-col-reverse';
  return 'flex-row';
}

function rowWrapClass(wrap: unknown): string {
  if (wrap === 'wrap') return 'flex-wrap';
  if (wrap === 'wrap-reverse') return 'flex-wrap-reverse';
  return '';
}

class RowBuilder extends FiboBuilder {
  private _mainAxisAlignment: MainAxisAlignment = 'start';
  private _crossAxisAlignment: CrossAxisAlignment = 'start';

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
    return this.alignItems(alignment);
  }

  spacing(value: string | number): this {
    if (typeof value === 'number') return this.gap(value);
    if (value !== '' && !isNaN(Number(value))) return this.gap(Number(value));
    return this.gap(value);
  }

  items(children: ReactElement[]): this {
    this.children(children);
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

    const { nodes, rest } = hostNodes(this.processChildren(), this._props);
    const {
      className: extraClass,
      style: extraStyle,
      dangerouslySetInnerHTML: _html,
      ...dom
    } = rest;
    void _html;

    const style = mergeHostStyle(this.getStyle(), extraStyle);

    const classes = [
      'fibo-row',
      'flex',
      rowDirectionClass(style.flexDirection),
      rowWrapClass(style.flexWrap),
      // min-w-0: flex item can shrink below content intrinsic width (grid/flex overflow)
      this.isHug() ? 'w-auto self-auto shrink-0' : 'w-full min-w-0 self-stretch',
      alignmentMap[this._mainAxisAlignment],
      crossAlignmentMap[this._crossAxisAlignment],
      ...this._classNames,
    ];
    const className = [...classes, extraClass].filter(Boolean).join(' ');

    return React.createElement(
      'div',
      {
        style,
        ...dom,
        className,
      },
      ...nodes
    );
  }
}

export const Row = createBuilder(RowBuilder);

export interface RowProps extends ChildrenProps {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  spacing?: string | number;
}
