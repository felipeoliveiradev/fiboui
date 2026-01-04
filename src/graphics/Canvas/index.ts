import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface CanvasInnerProps {
  width: number;
  height: number;
  viewBox?: string;
  children: ReactNode[];
  className?: string;
  style?: React.CSSProperties;
}

const CanvasInner = React.memo((props: CanvasInnerProps) => {
  const { width, height, viewBox, children, className, style } = props;

  return React.createElement(
    'svg',
    {
      width,
      height,
      viewBox: viewBox || `0 0 ${width} ${height}`,
      className: `fibo-canvas ${className || ''}`,
      style,
      xmlns: 'http://www.w3.org/2000/svg'
    },
    ...children
  );
});

class CanvasBuilder extends FiboBuilder {
  private _width: number = 100;
  private _height: number = 100;
  private _viewBox?: string;

  width(value: number): this {
    this._width = value;
    return this;
  }

  height(value: number): this {
    this._height = value;
    return this;
  }

  size(width: number, height: number): this {
    this._width = width;
    this._height = height;
    return this;
  }

  viewBox(value: string): this {
    this._viewBox = value;
    return this;
  }

  build(): ReactElement {
    const children = this.processChildren();

    const props: CanvasInnerProps = {
      width: this._width,
      height: this._height,
      viewBox: this._viewBox,
      children,
      className: this.getClassName(),
      style: this.getStyle()
    };

    return React.createElement(CanvasInner, props);
  }
}

export const Canvas = createBuilder(CanvasBuilder);

export interface CanvasProps extends BaseProps {
  width?: number;
  height?: number;
  viewBox?: string;
}
