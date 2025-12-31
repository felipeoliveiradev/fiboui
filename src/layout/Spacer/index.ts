import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

class SpacerBuilder extends FiboBuilder {
  private _height?: string | number;
  private _width?: string | number;

  height(value: string | number): this {
    this._height = value;
    return this;
  }

  width(value: string | number): this {
    this._width = value;
    return this;
  }

  build(): ReactElement {
    const style = this.getStyle();
    
    if (this._height) {
      style.height = typeof this._height === 'number' ? `${this._height}px` : this._height;
    }
    
    if (this._width) {
      style.width = typeof this._width === 'number' ? `${this._width}px` : this._width;
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
