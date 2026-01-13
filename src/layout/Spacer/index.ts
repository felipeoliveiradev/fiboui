import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

class SpacerBuilder extends FiboBuilder {
  private _height?: string | number;
  private _width?: string | number;
  private _direction?: 'vertical' | 'horizontal';

  height(value: string | number): this {
    this._height = value;
    return this;
  }

  width(value: string | number): this {
    this._width = value;
    return this;
  }

  vertical(): this {
    this._direction = 'vertical';
    return this;
  }

  horizontal(): this {
    this._direction = 'horizontal';
    return this;
  }

  build(): ReactElement {
    const style = this.getStyle();

    if (this._direction === 'vertical') {
      style.flex = '1';
      style.height = this._height ? (typeof this._height === 'number' ? `${this._height}px` : this._height) : 'auto';
    } else if (this._direction === 'horizontal') {
      style.flex = '1';
      style.width = this._width ? (typeof this._width === 'number' ? `${this._width}px` : this._width) : 'auto';
    } else {

      if (this._height) {
        style.height = typeof this._height === 'number' ? `${this._height}px` : this._height;
      }

      if (this._width) {
        style.width = typeof this._width === 'number' ? `${this._width}px` : this._width;
      }
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
