import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isBuildable } from '../../core/children';

class CustomScrollViewBuilder extends FiboBuilder {
  private _slivers: unknown[] = [];

  slivers(slivers: unknown[]): this {
    this._slivers = slivers;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: propsStyle, ...rest } = this._props;
    const style: CSSProperties = {
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    const className = ['fibo-custom-scroll-view', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    const nodes: ReactNode[] = this._slivers.map((sliver, index) => {
      const node: ReactNode = isBuildable(sliver) ? sliver.build() : (sliver as ReactNode);
      if (React.isValidElement(node) && (node.key == null || node.key === '')) {
        return React.cloneElement(node, { key: index });
      }
      return node;
    });

    return React.createElement(
      'div',
      {
        ...rest,
        className,
        style,
      },
      ...nodes
    );
  }
}

export const CustomScrollView = createBuilder(CustomScrollViewBuilder);
