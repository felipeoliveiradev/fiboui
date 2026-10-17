import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class PopoverBuilder extends FiboBuilder {
  private _open = false;
  private _text?: string;
  private _anchor?: FiboChild;

  open(value = true): this {
    this._open = value;
    return this;
  }

  /** Popup copy. Overrides the base color helper on this widget. */
  text(value: string): this {
    this._text = value;
    return this;
  }

  /** Trigger node. Overrides the base scroll-anchor helper on this widget. */
  anchor(node: FiboChild): this {
    this._anchor = node;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-popover', this.getClassName(), extraClass].filter(Boolean).join(' ');

    const popup = this._open
      ? React.createElement(
          'div',
          {
            ...rest,
            key: 'popup',
            role: 'dialog',
            className,
            style: {
              ...this.getStyle(),
              ...(extraStyle as object),
            },
          },
          this._text ?? null,
        )
      : null;

    return React.createElement(
      React.Fragment,
      null,
      slot(this._anchor),
      popup,
    );
  }
}

export const Popover = createBuilder(PopoverBuilder);

export interface PopoverProps extends BaseProps {
  open?: boolean;
  text?: string;
  anchor?: FiboChild;
}
