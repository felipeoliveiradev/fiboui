'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

interface TooltipInnerProps {
  text?: string;
  child?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function TooltipInner(props: TooltipInnerProps) {
  const { text = '', child, className, style } = props;
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return React.createElement(
    'span',
    {
      className,
      style,
      title: text,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
    child,
    React.createElement(
      'span',
      {
        role: 'tooltip',
        className: open ? 'fibo-tooltip-visible' : 'fibo-tooltip-hidden',
        'data-state': open ? 'visible' : 'hidden',
      },
      text
    )
  );
}

class TooltipBuilder extends FiboBuilder {
  private _text = '';
  private _child?: unknown;

  text(value: string): this {
    this._text = value;
    return this;
  }

  child(value: unknown): this {
    this._child = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass } = this._props;
    const className = ['fibo-tooltip', this.getClassName(), extraClass].filter(Boolean).join(' ');
    return React.createElement(TooltipInner, {
      text: this._text,
      child: buildChild(this._child),
      className,
      style: this.getStyle(),
    });
  }
}

export const Tooltip = createBuilder(TooltipBuilder);
