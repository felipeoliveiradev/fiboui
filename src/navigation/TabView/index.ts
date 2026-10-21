import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import {
  TabViewHost,
  type TabBarPosition,
  type TabViewTab,
} from './TabViewHost';

export type { TabViewTab, TabBarPosition } from './TabViewHost';

class TabViewBuilder extends FiboBuilder {
  private _tabs: TabViewTab[] = [];
  private _value?: string;
  private _onChange?: (value: string) => void;
  private _barPosition: TabBarPosition = 'bottom';
  private _swipe = true;
  private _keepAlive = true;

  tabs(items: TabViewTab[]): this {
    this._tabs = items;
    return this;
  }

  value(value: string): this {
    this._value = value;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  /**
   * Tablist placement. Default `bottom` (Material / pairs with `BottomAppBar`).
   * `none` — panels only; put your own bar in `BottomAppBar().items(…)`.
   */
  barPosition(position: TabBarPosition): this {
    this._barPosition = position;
    return this;
  }

  /** Horizontal drag between pages. Default true. CSS transform + snap. */
  swipe(enabled = true): this {
    this._swipe = enabled;
    return this;
  }

  /**
   * Keep neighboring / all panels mounted (React.memo + Activity).
   * Default true. `false` mounts only the active tab ±1.
   */
  keepAlive(enabled = true): this {
    this._keepAlive = enabled;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, ...rest } =
      this._props;
    const className = [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined;
    const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();

    return React.createElement(TabViewHost, {
      ...rest,
      tabs: this._tabs,
      value: this._value,
      onChange: this._onChange,
      barPosition: this._barPosition,
      swipe: this._swipe,
      keepAlive: this._keepAlive,
      className,
      style: Object.keys(style).length > 0 ? style : undefined,
    });
  }
}

export const TabView = createBuilder(TabViewBuilder);
