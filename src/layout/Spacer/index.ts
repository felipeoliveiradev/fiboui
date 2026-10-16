import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

function toCssSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

class SpacerBuilder extends FiboBuilder {
  private _height?: string | number;
  private _width?: string | number;
  private _grow?: number;
  private _expand?: boolean;

  height(value: string | number): this {
    this._height = value;
    return this;
  }

  width(value: string | number): this {
    this._width = value;
    return this;
  }

  vertical(): this {
    this._expand = true;
    return this;
  }

  horizontal(): this {
    this._expand = true;
    return this;
  }

  /** Grow factor inside a Row or Column. Does not turn the spacer into a flex container. */
  flex(value: number | string = 1): this {
    const grow = typeof value === 'number' ? value : Number(value);
    this._grow = Number.isFinite(grow) ? grow : 1;
    this._expand = true;
    return this;
  }

  build(): ReactElement {
    const style = this.getStyle();
    const fixed = this._height != null || this._width != null;
    const expand = this._expand ?? !fixed;

    if (this._height != null) style.height = toCssSize(this._height);
    if (this._width != null) style.width = toCssSize(this._width);

    if (expand) {
      style.flex = `${this._grow ?? 1} 1 0%`;
      style.alignSelf = style.alignSelf ?? 'stretch';
      style.minWidth = 0;
      style.minHeight = 0;
    } else {
      style.flex = '0 0 auto';
    }

    const className = this.getClassName();

    return React.createElement('div', {
      className: `fibo-spacer ${className}`,
      style,
      ...this._props,
    });
  }
}

export const Spacer = createBuilder(SpacerBuilder);

export interface SpacerProps extends BaseProps {
  height?: string | number;
  width?: string | number;
}
