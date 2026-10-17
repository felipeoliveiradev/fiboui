import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class SheetBuilder extends FiboBuilder {
  private _open = false;
  private _title?: string;
  private _child?: FiboChild;
  private _onClose?: () => void;

  open(value = true): this {
    this._open = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  onClose(handler: () => void): this {
    this._onClose = handler;
    return this;
  }

  build(): ReactElement {
    if (!this._open) return null as unknown as ReactElement;

    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-sheet', this.getClassName(), extraClass].filter(Boolean).join(' ');

    const close = () => {
      this._onClose?.();
    };

    return React.createElement(
      'div',
      {
        className: 'fibo-sheet-root',
        style: { position: 'fixed', inset: 0 },
      },
      React.createElement('div', {
        key: 'backdrop',
        className: 'fibo-sheet-backdrop',
        style: { position: 'fixed', inset: 0 },
        onClick: close,
      }),
      React.createElement(
        'div',
        {
          ...rest,
          key: 'panel',
          role: 'dialog',
          'aria-modal': true,
          className,
          style: {
            ...this.getStyle(),
            ...(extraStyle as object),
            position: 'fixed',
            top: 0,
            bottom: 0,
            insetInlineEnd: 0,
            background: 'var(--fibo-surface, #fff)',
          },
          onClick: (event: React.MouseEvent) => {
            event.stopPropagation();
          },
        },
        this._title
          ? React.createElement('h2', { key: 'title' }, this._title)
          : null,
        slot(this._child),
      ),
    );
  }
}

export const Sheet = createBuilder(SheetBuilder);

export interface SheetProps extends BaseProps {
  open?: boolean;
  title?: string;
  child?: FiboChild;
  onClose?: () => void;
}
