import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { normalizeFiboChildren } from '../../core/children';
import type { FiboChildren } from '../../core/types';
import { buildToolbarSlots, type ToolbarPlace } from './toolbarSlots';

export type { ToolbarPlace } from './toolbarSlots';

class ToolbarItemBuilder extends FiboBuilder {
  private _place: ToolbarPlace = 'trailing';
  private _tooltip?: string;
  private _onPress?: () => void;
  private _drawer?: 'start' | 'end';
  private _disabled = false;

  /** SwiftUI `.topBarLeading` / `.bottomBar` leading. Flutter `AppBar.leading`. */
  leading(): this {
    this._place = 'leading';
    return this;
  }

  /** SwiftUI `.principal`. Flutter `AppBar.title` / center slot. */
  principal(): this {
    this._place = 'principal';
    return this;
  }

  /** SwiftUI `.topBarTrailing` / bottom trailing. Flutter `AppBar.actions`. */
  trailing(): this {
    this._place = 'trailing';
    return this;
  }

  at(place: ToolbarPlace): this {
    this._place = place;
    return this;
  }

  /** Hover label and accessible name. Flutter `tooltip`. */
  tooltip(value: string): this {
    this._tooltip = value;
    return this;
  }

  onPress(handler: () => void): this {
    this._onPress = handler;
    return this;
  }

  /** The Scaffold opens the start drawer. The page does not call `useScaffold()`. */
  openDrawer(): this {
    this._drawer = 'start';
    return this;
  }

  /** The Scaffold opens the end drawer. */
  openEndDrawer(): this {
    this._drawer = 'end';
    return this;
  }

  disabled(value = true): this {
    this._disabled = value;
    return this;
  }

  /**
   * Flutter `SizedBox`: `width` and `height` are independent.
   * Pass only the axis you want to lock. The other stays with the content.
   */
  size(box: { width?: number; height?: number }): this {
    if (box.width != null) {
      this.width(box.width);
      this.paint('min-width', `${box.width}px`);
    }
    if (box.height != null) {
      this.height(box.height);
      this.paint('min-height', `${box.height}px`);
    }
    this.paint('flex-shrink', '0');
    return this.layoutStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    });
  }

  build(): ReactElement {
    const press = this._onPress != null || this._drawer != null;
    const nodes = this.processChildren();
    const { className: extraClass, style: propsStyle, children: _ignored, ...rest } = this._props;
    const className = ['fibo-toolbar-item', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = {
      ...(press
        ? {
            background: 'transparent',
            border: 0,
            padding: 0,
            margin: 0,
            color: 'inherit',
            font: 'inherit',
            cursor: this._disabled ? 'default' : 'pointer',
          }
        : {}),
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };
    const shared = {
      ...rest,
      className,
      style,
      'data-toolbar-place': this._place,
      title: this._tooltip,
      'aria-label': this._tooltip,
    };

    if (!press) {
      return React.createElement('div', shared, ...nodes);
    }

    const action = this._drawer === 'start'
      ? 'open-drawer'
      : this._drawer === 'end'
        ? 'open-end-drawer'
        : undefined;

    return React.createElement(
      'button',
      {
        ...shared,
        type: 'button',
        disabled: this._disabled || undefined,
        'data-scaffold-action': action,
        onClick: this._onPress,
      },
      ...nodes,
    );
  }
}

class AppBarBuilder extends FiboBuilder {
  private _items: FiboChildren = [];

  /** Every `ToolbarItem`. Several `.trailing()` items share the actions slot. */
  items(children: FiboChildren): this {
    this._items = children;
    return this;
  }

  build(): ReactElement {
    const nodes = normalizeFiboChildren(this._items);
    const { className: extraClass, style: propsStyle, children: _ignored, ...rest } = this._props;
    const className = ['fibo-app-bar', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    return React.createElement(
      'header',
      { ...rest, className, style },
      ...buildToolbarSlots(nodes, 'fibo-app-bar'),
    );
  }
}

export const ToolbarItem = createBuilder(ToolbarItemBuilder);
export const AppBar = createBuilder(AppBarBuilder);
