import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { normalizeFiboChildren } from '../../core/children';
import type { FiboChildren } from '../../core/types';
import { buildToolbarSlots } from '../AppBar/toolbarSlots';

/**
 * Flutter `BottomAppBar` — bottom chrome with the same three toolbar zones as
 * {@link AppBar} (`ToolbarItem().leading() / .principal() / .trailing()`).
 *
 * Put in `Scaffold().bottomAppBar(…)` (Flutter `Scaffold.bottomNavigationBar`).
 *
 * ```ts
 * BottomAppBar()
 *   .resetStyle()
 *   .floating()
 *   .material(Material.ultraThin)
 *   .items([
 *     ToolbarItem().principal().children(
 *       Row().children(ForEach(tabs).renderItem((t) => chip(t)))
 *     ),
 *   ])
 * ```
 */
class BottomAppBarBuilder extends FiboBuilder {
  private _items: FiboChildren = [];
  private _floating = false;

  /** Same contract as `AppBar().items` — zone via `ToolbarItem` place. */
  items(children: FiboChildren): this {
    this._items = children;
    return this;
  }

  /**
   * iOS-style floating capsule — inset from edges, rounded, shadow.
   * Pair with `.resetStyle().material(Material.ultraThin)` for glass.
   */
  floating(value = true): this {
    this._floating = value;
    return this;
  }

  build(): ReactElement {
    const nodes = normalizeFiboChildren(this._items);
    const { className: extraClass, style: propsStyle, children: _ignored, ...rest } = this._props;
    const className = ['fibo-bottom-app-bar', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');
    const style = {
      display: 'flex',
      alignItems: 'center',
      width: this._floating ? undefined : '100%',
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    return React.createElement(
      'footer',
      {
        ...rest,
        className,
        style,
        role: 'contentinfo',
        'data-bottom-app-bar': 'true',
        'data-floating': this._floating ? 'true' : undefined,
      },
      ...buildToolbarSlots(nodes, 'fibo-bottom-app-bar'),
    );
  }
}

export const BottomAppBar = createBuilder(BottomAppBarBuilder);
