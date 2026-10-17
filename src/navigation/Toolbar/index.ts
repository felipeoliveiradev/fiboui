import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class ToolbarBuilder extends FiboBuilder {
  private _title?: ReactNode;
  private _leading?: ReactNode;
  private _trailing?: ReactNode;

  title(value: ReactNode): this {
    this._title = value;
    return this;
  }

  leading(node: ReactNode): this {
    this._leading = node;
    return this;
  }

  trailing(node: ReactNode): this {
    this._trailing = node;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, ...rest } = this._props;
    const className = ['fibo-toolbar', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = {
      display: 'flex',
      alignItems: 'center' as const,
      ...this.getStyle(),
      ...(extraStyle ?? {}),
    };

    return React.createElement(
      'div',
      { ...rest, role: 'toolbar', className, style },
      slot(this._leading),
      this._title != null
        ? React.createElement('div', { className: 'fibo-toolbar-title' }, slot(this._title))
        : null,
      slot(this._trailing)
    );
  }
}

export const Toolbar = createBuilder(ToolbarBuilder);
