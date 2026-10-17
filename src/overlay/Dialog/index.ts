import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

class DialogBuilder extends FiboBuilder {
  private _open = false;
  private _title?: string;
  private _message?: string;
  private _confirmLabel?: string;
  private _cancelLabel?: string;
  private _onConfirm?: () => void;
  private _onCancel?: () => void;

  open(value = true): this {
    this._open = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  message(value: string): this {
    this._message = value;
    return this;
  }

  confirmLabel(value: string): this {
    this._confirmLabel = value;
    return this;
  }

  cancelLabel(value: string): this {
    this._cancelLabel = value;
    return this;
  }

  onConfirm(handler: () => void): this {
    this._onConfirm = handler;
    return this;
  }

  onCancel(handler: () => void): this {
    this._onCancel = handler;
    return this;
  }

  build(): ReactElement {
    if (!this._open) return null as unknown as ReactElement;

    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-dialog', this.getClassName(), extraClass].filter(Boolean).join(' ');

    const actions: React.ReactNode[] = [];
    if (this._cancelLabel) {
      actions.push(
        React.createElement(
          'button',
          {
            key: 'cancel',
            type: 'button',
            onClick: () => this._onCancel?.(),
          },
          this._cancelLabel,
        ),
      );
    }
    if (this._confirmLabel) {
      actions.push(
        React.createElement(
          'button',
          {
            key: 'confirm',
            type: 'button',
            onClick: () => this._onConfirm?.(),
          },
          this._confirmLabel,
        ),
      );
    }

    return React.createElement(
      'div',
      {
        ...rest,
        role: 'alertdialog',
        'aria-modal': true,
        className,
        style: {
          ...this.getStyle(),
          ...(extraStyle as object),
        },
      },
      this._title ? React.createElement('h2', { key: 'title' }, this._title) : null,
      this._message ? React.createElement('p', { key: 'message' }, this._message) : null,
      actions.length > 0
        ? React.createElement('div', { key: 'actions' }, actions)
        : null,
    );
  }
}

export const Dialog = createBuilder(DialogBuilder);

export interface DialogProps extends BaseProps {
  open?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
