import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class FullScreenCoverBuilder extends FiboBuilder {
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
    const className = ['fibo-fullscreen-cover', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'div',
      {
        ...rest,
        role: 'dialog',
        'aria-modal': true,
        className,
        style: {
          ...this.getStyle(),
          ...(extraStyle as object),
          position: 'fixed',
          inset: 0,
          background: 'var(--fibo-background, #fff)',
        },
      },
      this._title ? React.createElement('h2', { key: 'title' }, this._title) : null,
      this._onClose
        ? React.createElement(
            'button',
            {
              key: 'close',
              type: 'button',
              'aria-label': 'Close',
              onClick: () => this._onClose?.(),
            },
            '×',
          )
        : null,
      slot(this._child),
    );
  }
}

export const FullScreenCover = createBuilder(FullScreenCoverBuilder);

export interface FullScreenCoverProps extends BaseProps {
  open?: boolean;
  title?: string;
  child?: FiboChild;
  onClose?: () => void;
}
