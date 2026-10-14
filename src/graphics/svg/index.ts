import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

class SvgBuilder extends FiboBuilder {
  private _viewBox?: string;
  private _width?: number | string;
  private _height?: number | string;
  private _label?: string;
  private _decorative = false;

  viewBox(value: string): this {
    this._viewBox = value;
    return this;
  }

  size(width: number | string, height?: number | string): this {
    this._width = width;
    this._height = height ?? width;
    return this;
  }

  label(value: string): this {
    this._label = value;
    return this;
  }

  decorative(enable: boolean = true): this {
    this._decorative = enable;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'svg',
      {
        className: ['fibo-svg', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        viewBox: this._viewBox,
        width: this._width,
        height: this._height,
        xmlns: 'http://www.w3.org/2000/svg',
        role: this._decorative ? undefined : this._label ? 'img' : undefined,
        'aria-label': this._decorative ? undefined : this._label,
        'aria-hidden': this._decorative ? true : undefined,
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

class DefsBuilder extends FiboBuilder {
  build(): ReactElement {
    return React.createElement(
      'defs',
      { className: this.getClassName() || undefined, ...this._props },
      ...this.processChildren()
    );
  }
}

class SvgGroupBuilder extends FiboBuilder {
  private _filter?: string;
  private _fill?: string;

  filter(value: string): this {
    this._filter = value;
    return this;
  }

  paint(value: string): this {
    this._fill = value;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'g',
      {
        className: this.getClassName() || undefined,
        style: this.getStyle(),
        filter: this._filter,
        fill: this._fill,
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

class EllipseBuilder extends FiboBuilder {
  private _cx = 0;
  private _cy = 0;
  private _rx = 10;
  private _ry = 10;
  private _fill?: string;
  private _fillOpacity?: number;

  cx(value: number): this {
    this._cx = value;
    return this;
  }

  cy(value: number): this {
    this._cy = value;
    return this;
  }

  rx(value: number): this {
    this._rx = value;
    return this;
  }

  ry(value: number): this {
    this._ry = value;
    return this;
  }

  paint(value: string): this {
    this._fill = value;
    return this;
  }

  fillOpacity(value: number): this {
    this._fillOpacity = value;
    return this;
  }

  build(): ReactElement {
    return React.createElement('ellipse', {
      cx: this._cx,
      cy: this._cy,
      rx: this._rx,
      ry: this._ry,
      fill: this._fill,
      fillOpacity: this._fillOpacity,
      className: this.getClassName() || undefined,
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export type GradientStop = { offset: string; color: string; opacity?: number };

class RadialGradientBuilder extends FiboBuilder {
  private _gid = '';
  private _cx = '50%';
  private _cy = '50%';
  private _r = '50%';
  private _stops: GradientStop[] = [];

  constructor(id: string = '') {
    super();
    this._gid = id;
  }

  id(value: string): this {
    this._gid = value;
    return this;
  }

  cx(value: string): this {
    this._cx = value;
    return this;
  }

  cy(value: string): this {
    this._cy = value;
    return this;
  }

  r(value: string): this {
    this._r = value;
    return this;
  }

  stops(list: GradientStop[]): this {
    this._stops = list;
    return this;
  }

  stop(offset: string, color: string, opacity?: number): this {
    this._stops.push({ offset, color, opacity });
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'radialGradient',
      { id: this._gid, cx: this._cx, cy: this._cy, r: this._r, ...this._props },
      this._stops.map((stop, i) =>
        React.createElement('stop', {
          key: `${stop.offset}-${i}`,
          offset: stop.offset,
          stopColor: stop.color,
          stopOpacity: stop.opacity,
        })
      )
    );
  }
}

class SvgFilterBuilder extends FiboBuilder {
  private _fid = '';
  private _x = '-20%';
  private _y = '-20%';
  private _w = '140%';
  private _h = '140%';
  private _blur?: number;
  private _matrix?: string;

  constructor(id: string = '') {
    super();
    this._fid = id;
  }

  id(value: string): this {
    this._fid = value;
    return this;
  }

  region(x: string, y: string, width: string, height: string): this {
    this._x = x;
    this._y = y;
    this._w = width;
    this._h = height;
    return this;
  }

  blur(stdDeviation: number): this {
    this._blur = stdDeviation;
    return this;
  }

  colorMatrix(values: string): this {
    this._matrix = values;
    return this;
  }

  build(): ReactElement {
    const parts: React.ReactNode[] = [];
    if (this._blur !== undefined) {
      parts.push(
        React.createElement('feGaussianBlur', {
          key: 'blur',
          in: 'SourceGraphic',
          stdDeviation: this._blur,
          result: 'blur',
        })
      );
    }
    if (this._matrix) {
      parts.push(
        React.createElement('feColorMatrix', {
          key: 'matrix',
          in: this._blur !== undefined ? 'blur' : 'SourceGraphic',
          mode: 'matrix',
          values: this._matrix,
          result: 'goo',
        })
      );
    }
    return React.createElement(
      'filter',
      {
        id: this._fid,
        x: this._x,
        y: this._y,
        width: this._w,
        height: this._h,
        ...this._props,
      },
      ...parts
    );
  }
}

export const Svg = createBuilder(SvgBuilder);
export const Defs = createBuilder(DefsBuilder);
export const SvgGroup = createBuilder(SvgGroupBuilder);
export const Ellipse = createBuilder(EllipseBuilder);
export const RadialGradient = createBuilder(RadialGradientBuilder);
export const SvgFilter = createBuilder(SvgFilterBuilder);
