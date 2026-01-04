import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const IconInner = React.memo((props: any) => {
  const {
    source: Source,
    color,
    size,
    className,
    style,
    ...rest
  } = props;

  if (!Source) return null;

  // If Source is a function/component, we render it
  // Lucide icons are components that accept size and color
  return React.createElement(Source, {
    color: color,
    size: size,
    className,
    style,
    ...rest,
  });
});

class IconBuilder extends FiboBuilder {
  private _source: any;
  private _color: string = 'currentColor';
  private _size: number = 24;

  constructor(source?: any) {
    super();
    this._source = source;
  }

  source(value: any): this {
    this._source = value;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  size(value: number): this {
    this._size = value;
    return this;
  }

  build(): ReactElement {
    const classes = ['fibo-icon', ...this._classNames];
    const className = classes.filter(Boolean).join(' ');

    const props = {
      source: this._source,
      color: this._color,
      size: this._size,
      className: className,
      style: this.getStyle(),
      ...this._props
    };

    return React.createElement(IconInner, props);
  }
}

export const Icon = createBuilder(IconBuilder);

export interface IconProps extends BaseProps {
  source: any;
  color?: string;
  size?: number;
}
