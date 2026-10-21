import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

/**
 * Flutter Material `Divider` — thin horizontal rule for lists and sections.
 *
 * ```ts
 * Divider()
 * Divider().thickness(1).color('#E5E7EB')
 * Divider().height(16).thickness(1).indent(16).endIndent(16)
 * ```
 *
 * Pair with `List().separator(Divider())` or `List().separator((i) => …)`
 * (Flutter `ListView.separated`).
 */
class DividerBuilder extends FiboBuilder {
  private _thickness = 1;
  private _indent = 0;
  private _endIndent = 0;
  private _color = '#E5E7EB';
  private _height?: number;

  /** Flutter `Divider.thickness` — painted line width in px. */
  thickness(value: number): this {
    this._thickness = value;
    return this;
  }

  /** Flutter `Divider.height` — outer box height (line is centered when taller). */
  height(value: number | string): this {
    if (typeof value === 'number') {
      this._height = value;
      return this;
    }
    return super.height(value);
  }

  /** Flutter `Divider.indent` — leading inset. */
  indent(value: number): this {
    this._indent = value;
    return this;
  }

  /** Flutter `Divider.endIndent` — trailing inset. */
  endIndent(value: number): this {
    this._endIndent = value;
    return this;
  }

  /** Flutter `Divider.color`. */
  color(value: string): this {
    this._color = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: propsStyle, children: _ignored, ...rest } = this._props;
    const boxHeight = this._height ?? this._thickness;
    const pad = Math.max(0, (boxHeight - this._thickness) / 2);
    const style: CSSProperties = {
      display: 'block',
      border: 0,
      borderTop: `${this._thickness}px solid ${this._color}`,
      height: 0,
      margin: 0,
      marginTop: pad,
      marginBottom: pad,
      marginLeft: this._indent,
      marginRight: this._endIndent,
      padding: 0,
      width: 'auto',
      alignSelf: 'stretch',
      flexShrink: 0,
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };
    const className = ['fibo-divider', this.getClassName(), extraClass].filter(Boolean).join(' ');
    return React.createElement('hr', {
      ...rest,
      role: 'separator',
      'aria-orientation': 'horizontal',
      className,
      style,
    });
  }
}

export const Divider = createBuilder(DividerBuilder);

/** SwiftUI / common alias — same builder as {@link Divider}. */
export const Separator = Divider;
