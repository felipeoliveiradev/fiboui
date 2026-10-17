'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { MenuItem } from '../Menu';

interface ContextMenuInnerProps {
  items: MenuItem[];
  child?: ReactNode;
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function ContextMenuInner(props: ContextMenuInnerProps) {
  const { items, child, open: initialOpen = false, className, style } = props;
  const [open, setOpen] = useState(initialOpen);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPoint({ x: event.clientX, y: event.clientY });
    setOpen(true);
  };

  return React.createElement(
    'div',
    {
      className,
      style: { position: 'relative', ...style },
      onContextMenu: handleContextMenu,
    },
    child,
    open
      ? React.createElement(
          'div',
          {
            role: 'menu',
            className: 'fibo-context-menu',
            style: { position: 'absolute', left: point.x, top: point.y },
          },
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

class ContextMenuBuilder extends FiboBuilder {
  private _items: MenuItem[] = [];
  private _child?: unknown;
  private _open = false;

  items(value: MenuItem[]): this {
    this._items = value;
    return this;
  }

  child(value: unknown): this {
    this._child = value;
    return this;
  }

  open(value: boolean = true): this {
    this._open = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass } = this._props;
    const className = ['fibo-context-menu-host', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');
    return React.createElement(ContextMenuInner, {
      items: this._items,
      child: buildChild(this._child),
      open: this._open,
      className,
      style: this.getStyle(),
    });
  }
}

export const ContextMenu = createBuilder(ContextMenuBuilder);
