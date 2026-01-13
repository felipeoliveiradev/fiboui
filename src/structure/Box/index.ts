import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps } from '../../core/types';

const BoxInner = React.memo((props: any) => {
    const { className, style, children, ...rest } = props;
    return React.createElement(
      'div',
      {
        className,
        style,
        ...rest,
      },
      ...children
    );
});

class BoxBuilder extends FiboBuilder {

  build(): ReactElement {
    const classes = [
      'fibo-box',
      ...this._classNames,
    ];

    const className = classes.filter(Boolean).join(' ');
    const style = this.getStyle();

    const children = this.processChildren();

    const props = {
        className,
        style: style,
        children: children,
        ...this._props
    };

    return React.createElement(BoxInner, props);
  }
}

export const Box = createBuilder(BoxBuilder);

export interface BoxProps extends ChildrenProps {}
