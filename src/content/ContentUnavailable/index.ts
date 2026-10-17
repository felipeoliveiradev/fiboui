import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface ContentUnavailableInnerProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const ContentUnavailableInner = React.memo((props: ContentUnavailableInnerProps) => {
  const { title, message, actionLabel, onAction, className, style, ...rest } = props;
  const nodes: React.ReactNode[] = [
    React.createElement(
      'h2',
      { key: 'title', className: 'fibo-content-unavailable-title text-lg font-semibold' },
      title,
    ),
  ];

  if (message) {
    nodes.push(
      React.createElement(
        'p',
        { key: 'message', className: 'fibo-content-unavailable-message text-sm opacity-80' },
        message,
      ),
    );
  }

  if (actionLabel && typeof onAction === 'function') {
    nodes.push(
      React.createElement(
        'button',
        {
          key: 'action',
          type: 'button',
          className: 'fibo-content-unavailable-action',
          onClick: () => onAction(),
        },
        actionLabel,
      ),
    );
  }

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-content-unavailable flex flex-col items-center gap-2 text-center', className]
        .filter(Boolean)
        .join(' '),
      style,
      role: 'status',
    },
    nodes,
  );
});

class ContentUnavailableBuilder extends FiboBuilder {
  private _title = '';
  private _message?: string;
  private _actionLabel?: string;
  private _onAction?: () => void;

  title(value: string): this {
    this._title = value;
    return this;
  }

  message(value: string): this {
    this._message = value;
    return this;
  }

  action(label: string, handler: () => void): this {
    this._actionLabel = label;
    this._onAction = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(ContentUnavailableInner, {
      title: this._title,
      message: this._message,
      actionLabel: this._actionLabel,
      onAction: this._onAction,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const ContentUnavailable = createBuilder(ContentUnavailableBuilder);

export interface ContentUnavailableProps extends BaseProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}
