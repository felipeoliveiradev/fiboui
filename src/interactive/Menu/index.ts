'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

export interface MenuItem {
  label: string;
  onPress?: () => void;
}

interface MenuInnerProps {
  label?: string;
  items: MenuItem[];
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function MenuInner(props: MenuInnerProps) {
  const { label, items, open: initialOpen = false, className, style } = props;
  const [open, setOpen] = useState(initialOpen);

  return React.createElement(
    'div',
    { className, style },
    React.createElement(
      'button',
      {
        type: 'button',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => setOpen((current) => !current),
      },
      label
    ),
    open
      ? React.createElement(
          'div',
          { role: 'menu' },
          items.map((item, index) =>
            React.createElement(
              'button',
              {
                key: `${item.label}-${index}`,
                type: 'button',
                role: 'menuitem',
                onClick: () => item.onPress?.(),
              },
              item.label
            )
          )
        )
      : null
  );
}

class MenuBuilder extends FiboBuilder {
  private _label?: string;
  private _items: MenuItem[] = [];
  private _open = false;

  label(value: string): this {
    this._label = value;
    return this;
  }

  items(value: MenuItem[]): this {
    this._items = value;
    return this;
  }

  open(value: boolean = true): this {
    this._open = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass } = this._props;
    const className = ['fibo-menu', this.getClassName(), extraClass].filter(Boolean).join(' ');
    return React.createElement(MenuInner, {
      label: this._label,
      items: this._items,
      open: this._open,
      className,
      style: this.getStyle(),
    });
  }
}

export const Menu = createBuilder(MenuBuilder);
