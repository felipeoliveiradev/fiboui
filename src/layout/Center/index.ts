import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps } from '../../core/types';

class CenterBuilder extends FiboBuilder {
  build(): ReactElement {
    const classes = [
      'fibo-center',
      'flex',
      'items-center',
      'justify-center',
      ...this._classNames,
    ];

    const className = classes.filter(Boolean).join(' ');
    const style = this.getStyle();
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


export const Center = createBuilder(CenterBuilder);

export interface CenterProps extends ChildrenProps {}
