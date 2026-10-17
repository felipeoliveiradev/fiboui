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
  preserveAspectRatio?: string;
  overflow?: string;
  [key: string]: unknown;
}

function finitePx(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

const CanvasInner = React.memo((props: CanvasInnerProps) => {
  const {
    width: rawWidth,
    height: rawHeight,
    viewBox,
    children,
    className,
    style,
    dangerouslySetInnerHTML: _html,
    ...rest
  } = props;
  const { key: _key, ...host } = rest as Record<string, unknown> & { key?: unknown };
  const width = finitePx(rawWidth, 100);
  const height = finitePx(rawHeight, 100);
  const box =
    typeof viewBox === 'string' && viewBox.trim() && !/NaN|Infinity/i.test(viewBox)
      ? viewBox
      : `0 0 ${width} ${height}`;

  return React.createElement(
    'svg',
    {
      width,
      height,
      viewBox: box,
      className: `fibo-canvas ${className || ''}`.trim(),
      style,
      xmlns: 'http://www.w3.org/2000/svg',
      overflow: 'visible',
      ...host,
    },
    ...(Array.isArray(children) ? children : children != null ? [children] : [])
  );
});

class CanvasBuilder extends FiboBuilder {
  private _width: number = 100;
  private _height: number = 100;
  private _viewBox?: string;
  private _preserveAspectRatio?: string;
  private _overflow?: string;

  width(value: number): this {
    if (typeof value === 'number' && Number.isFinite(value)) this._width = value;
    return this;
  }

  height(value: number): this {
    if (typeof value === 'number' && Number.isFinite(value)) this._height = value;
    return this;
  }

  size(width: number, height: number): this {
    this.width(width);
    this.height(height);
    return this;
  }

  viewBox(value: string): this {
    this._viewBox = value;
    return this;
  }

  preserveAspectRatio(value: string): this {
    this._preserveAspectRatio = value;
    return this;
  }

  overflow(value: string): this {
    this._overflow = value;
    return this;
  }

  build(): ReactElement {
    const children = this.processChildren();
    const { key: _key, dangerouslySetInnerHTML: _html, ...hostProps } = this._props;

    const props: CanvasInnerProps = {
      width: this._width,
      height: this._height,
      viewBox: this._viewBox,
      children,
      className: this.getClassName(),
      style: this.getStyle(),
      preserveAspectRatio: this._preserveAspectRatio,
      overflow: this._overflow ?? 'visible',
      ...hostProps,
    };

    return React.createElement(CanvasInner, props);
  }
}

export const Canvas = createBuilder(CanvasBuilder);

export interface CanvasProps extends BaseProps {
  width?: number;
  height?: number;
  viewBox?: string;
  preserveAspectRatio?: string;
}
