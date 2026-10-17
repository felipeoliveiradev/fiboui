import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

class SnackBarBuilder extends FiboBuilder {
  private _open = false;
  private _message?: string;
  private _actionLabel?: string;
  private _action?: () => void;
  private _onClose?: () => void;

  open(value = true): this {
    this._open = value;
    return this;
  }

  message(value: string): this {
    this._message = value;
    return this;
  }

  action(label: string, handler: () => void): this {
    this._actionLabel = label;
    this._action = handler;
    return this;
  }

  onClose(handler: () => void): this {
    this._onClose = handler;
    return this;
  }

  build(): ReactElement {
    if (!this._open) return null as unknown as ReactElement;

    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-snackbar', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(
      'div',
      {
        ...rest,
        role: 'status',
        className,
        style: {
          ...this.getStyle(),
          ...(extraStyle as object),
        },
      },
      this._message ? React.createElement('span', { key: 'message' }, this._message) : null,
      this._actionLabel
        ? React.createElement(
            'button',
            {
              key: 'action',
              type: 'button',
              onClick: () => this._action?.(),
            },
            this._actionLabel,
          )
        : null,
      this._onClose
        ? React.createElement(
            'button',
            {
              key: 'close',
              type: 'button',
              'aria-label': 'Dismiss',
              onClick: () => this._onClose?.(),
            },
            '×',
          )
        : null,
    );
  }
}

export const SnackBar = createBuilder(SnackBarBuilder);

export interface SnackBarProps extends BaseProps {
  open?: boolean;
  message?: string;
  onClose?: () => void;
}
