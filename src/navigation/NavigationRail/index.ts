import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { BottomBarItem } from '../BottomBar';

export type NavigationRailItem = BottomBarItem;

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class NavigationRailBuilder extends FiboBuilder {
  private _items: NavigationRailItem[] = [];
  private _value?: string;

  items(items: NavigationRailItem[]): this {
    this._items = items;
    return this;
  }

  value(value: string): this {
    this._value = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, ...rest } = this._props;
    const className = ['fibo-navigation-rail', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = {
      display: 'flex',
      flexDirection: 'column' as const,
      ...this.getStyle(),
      ...(extraStyle ?? {}),
    };

    return React.createElement(
      'nav',
      {
        ...rest,
        role: 'navigation',
        className,
        style,
      },
      ...this._items.map((item) =>
        React.createElement(
          'button',
          {
            key: item.value,
            type: 'button',
            'aria-current': item.value === this._value ? 'page' : undefined,
            onClick: item.onPress,
          },
          slot(item.label)
        )
      )
    );
  }
}

export const NavigationRail = createBuilder(NavigationRailBuilder);
