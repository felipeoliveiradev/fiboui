import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type IconSource = string | SVGAElement | any | React.ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}>;

interface IconInnerProps {
  source: IconSource;
  color: string;
  size: number;
  className: string;
  style: React.CSSProperties;
  [key: string]: unknown;
}

const IconInner = React.memo((props: IconInnerProps) => {
  const {
    source: Source,
    color,
    size,
    className,
    style,
    ...rest
  } = props;

  if (!Source) return null;

  if (typeof Source === 'string') {
    return React.createElement('img', {
      src: Source,
      alt: 'icon',
      width: size,
      height: size,
      className,
      style: { ...style, color },
      ...rest,
    });
  }

  return React.createElement(Source, {
    color: color,
    size: size,
    className,
    style,
    ...rest,
  });
});

class IconBuilder extends FiboBuilder {
  private _source?: IconSource;
  private _color: string = 'currentColor';
  private _size: number = 24;

  constructor(source?: IconSource) {
    super();
    this._source = source;
  }

  source(value: IconSource): this {
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

    const props: IconInnerProps = {
      source: this._source!,
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
  source: IconSource;
  color?: string;
  size?: number;
}
