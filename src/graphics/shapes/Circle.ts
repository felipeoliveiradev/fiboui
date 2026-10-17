import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

function isFiniteNum(n: number): boolean {
  return typeof n === 'number' && Number.isFinite(n);
}

class CircleBuilder extends ShapeBuilder {
  private _cx: number = 0;
  private _cy: number = 0;
  private _r: number = 10;

  center(cx: number, cy: number): this {
    if (!isFiniteNum(cx) || !isFiniteNum(cy)) return this;
    this._cx = cx;
    this._cy = cy;
    return this;
  }

  cx(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cx = value;
    return this;
  }

  cy(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cy = value;
    return this;
  }

  left(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cx = value + this._r;
    return this;
  }

  top(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cy = value + this._r;
    return this;
  }

  right(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cx = value - this._r;
    return this;
  }

  bottom(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cy = value - this._r;
    return this;
  }

  centerX(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cx = value;
    return this;
  }

  centerY(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._cy = value;
    return this;
  }

  position(x: number, y: number): this {
    if (!isFiniteNum(x) || !isFiniteNum(y)) return this;
    this._cx = x + this._r;
    this._cy = y + this._r;
    return this;
  }

  size(width: number, height: number): this {
    if (!isFiniteNum(width) || !isFiniteNum(height)) return this;
    const diameter = (width + height) / 2;
    this._r = diameter / 2;
    return this;
  }

  radius(r: number): this {
    if (!isFiniteNum(r)) return this;
    this._r = r;
    return this;
  }

  r(value: number): this {
    return this.radius(value);
  }

  diameter(d: number): this {
    if (!isFiniteNum(d)) return this;
    this._r = d / 2;
    return this;
  }

  circumference(c: number): this {
    if (!isFiniteNum(c)) return this;
    this._r = c / (2 * Math.PI);
    return this;
  }

  area(a: number): this {
    if (!isFiniteNum(a) || a < 0) return this;
    this._r = Math.sqrt(a / Math.PI);
    return this;
  }

  rotateSelf(degrees: number): this {
    return this.rotate(degrees, this._cx, this._cy);
  }

  rotateAround(degrees: number, cx: number, cy: number): this {
    return this.rotate(degrees, cx, cy);
  }

  build(): ReactElement {
    const shapeElement = React.createElement('circle', {
      cx: this._cx,
      cy: this._cy,
      r: this._r,
      ...this.shapePaintProps(),
    });
    return this.wrapShape(shapeElement, 'circle-group');
  }
}

export const Circle = createShapeBuilder(CircleBuilder);
