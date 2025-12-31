import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps } from '../../core/types';

class ContainerBuilder extends FiboBuilder {
  build(): ReactElement {
    const className = this.getClassName();
    const style = this.getStyle();
    const children = this.processChildren();

    return React.createElement(
      'div',
      {
        className: `fibo-container ${className}`,
        style,
        ...this._props,
      },
      ...children
    );
  }
}


export const Container = createBuilder(ContainerBuilder);

export interface ContainerProps extends ChildrenProps {
  maxWidth?: string | number;
}
