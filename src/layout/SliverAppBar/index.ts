import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

class SliverAppBarBuilder extends FiboBuilder {
  private _title = '';
  private _pinned = false;

  title(value: string): this {
    this._title = value;
    return this;
  }

  pinned(value = true): this {
    this._pinned = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: propsStyle, ...rest } = this._props;
    const style: CSSProperties = {
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' ? propsStyle : {}),
    };

    if (this._pinned) {
      style.position = 'sticky';
      style.top = 0;
    }

    const className = ['fibo-sliver-app-bar', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'header',
      {
        ...rest,
        className,
        style,
      },
      this._title
    );
  }
}

export const SliverAppBar = createBuilder(SliverAppBarBuilder);
