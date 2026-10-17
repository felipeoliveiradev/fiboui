import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

class SliverListBuilder extends FiboBuilder {
  build(): ReactElement {
    const { className: extraClass, style: propsStyle, ...rest } = this._props;
    const style: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    const className = ['fibo-sliver-list', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'div',
      {
        ...rest,
        className,
        style,
      },
      ...this.processChildren()
    );
  }
}

export const SliverList = createBuilder(SliverListBuilder);
