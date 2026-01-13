import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps } from '../../core/types';

class LineBuilder extends FiboBuilder {
  private _sizeHeight?: string;

  sizeHeight(value: string): this {
    this._sizeHeight = value;
    return this;
  }

  build(): ReactElement {
    const classes = ['fibo-line', 'flex', 'flex-row', ...this._classNames];
    const className = classes.filter(Boolean).join(' ');
    const style = this.getStyle();

    if (this._sizeHeight) {
      style.height = this._sizeHeight;
    }

    const children = this.processChildren();

    return React.createElement(
      'div',
      {
        className,
        style,
        ...this._props,
      },
      ...children
    );
  }
}

export const Line = createBuilder(LineBuilder);

export interface LineProps extends ChildrenProps {
  sizeHeight?: string;
}
