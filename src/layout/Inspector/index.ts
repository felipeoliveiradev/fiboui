'use client';

import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

function InspectorView(props: {
  open: boolean;
  title?: ReactNode;
  main?: ReactNode;
  panel?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { open, title, main, panel, className, style, ...rest } = props;
  const label = typeof title === 'string' ? title : undefined;

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-inspector', className].filter(Boolean).join(' '),
      style: { display: 'flex', minWidth: 0, width: '100%', ...style },
      'data-open': open ? 'true' : 'false',
    },
    React.createElement('div', { className: 'fibo-inspector-main' }, main),
    open
      ? React.createElement(
          'aside',
          {
            role: 'complementary',
            className: 'fibo-inspector-panel',
            'aria-label': label,
          },
          title != null
            ? React.createElement('h2', { className: 'fibo-inspector-title' }, title)
            : null,
          panel,
        )
      : null,
  );
}

class InspectorBuilder extends FiboBuilder {
  private _open = false;
  private _title?: FiboChild;
  private _child?: FiboChild;
  private _panel?: FiboChild;

  open(value: boolean): this {
    this._open = value;
    return this;
  }

  title(value: FiboChild): this {
    this._title = value;
    return this;
  }

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  panel(node: FiboChild): this {
    this._panel = node;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props as {
      className?: string;
      style?: React.CSSProperties;
      [key: string]: unknown;
    };
    return React.createElement(InspectorView, {
      ...rest,
      open: this._open,
      title: buildChild(this._title) as ReactNode,
      main: buildChild(this._child) as ReactNode,
      panel: buildChild(this._panel) as ReactNode,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle(),
    });
  }
}

export const Inspector = createBuilder(InspectorBuilder);
