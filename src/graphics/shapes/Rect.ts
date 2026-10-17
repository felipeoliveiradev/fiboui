import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

function isFiniteNum(n: number): boolean {
  return typeof n === 'number' && Number.isFinite(n);
}

class RectBuilder extends ShapeBuilder {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 100;
  private _height: number = 100;
  private _rx?: number;
  private _ry?: number;
  private _radiusTopLeft?: number;
  private _radiusTopRight?: number;
  private _radiusBottomLeft?: number;
  private _radiusBottomRight?: number;

  position(x: number, y: number): this {
    if (!isFiniteNum(x) || !isFiniteNum(y)) return this;
    this._x = x;
    this._y = y;
    return this;
  }

  x(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._x = value;
    return this;
  }

  y(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._y = value;
    return this;
  }

  left(value: number): this {
    return this.x(value);
  }

  top(value: number): this {
    return this.y(value);
  }

  right(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._x = value - this._width;
    return this;
  }

  bottom(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._y = value - this._height;
    return this;
  }

  centerX(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._x = value - this._width / 2;
    return this;
  }

  centerY(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._y = value - this._height / 2;
    return this;
  }

  center(cx: number, cy: number): this {
    if (!isFiniteNum(cx) || !isFiniteNum(cy)) return this;
    this._x = cx - this._width / 2;
    this._y = cy - this._height / 2;
    return this;
  }

  size(width: number, height: number): this {
    if (!isFiniteNum(width) || !isFiniteNum(height)) return this;
    this._width = width;
    this._height = height;
    return this;
  }

  width(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._width = value;
    return this;
  }

  height(value: number): this {
    if (!isFiniteNum(value)) return this;
    this._height = value;
    return this;
  }

  cornerRadius(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._rx = radius;
    this._ry = radius;
    this._radiusTopLeft = undefined;
    this._radiusTopRight = undefined;
    this._radiusBottomLeft = undefined;
    this._radiusBottomRight = undefined;
    return this;
  }

  cornerRadii(rx: number, ry: number): this {
    if (!isFiniteNum(rx) || !isFiniteNum(ry)) return this;
    this._rx = rx;
    this._ry = ry;
    this._radiusTopLeft = undefined;
    this._radiusTopRight = undefined;
    this._radiusBottomLeft = undefined;
    this._radiusBottomRight = undefined;
    return this;
  }

  cornerRadiusTopLeft(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusTopLeft = radius;
    return this;
  }

  cornerRadiusTopRight(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusTopRight = radius;
    return this;
  }

  cornerRadiusBottomLeft(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusBottomLeft = radius;
    return this;
  }

  cornerRadiusBottomRight(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusBottomRight = radius;
    return this;
  }

  cornerRadiusTop(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusTopLeft = radius;
    this._radiusTopRight = radius;
    return this;
  }

  cornerRadiusBottom(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusBottomLeft = radius;
    this._radiusBottomRight = radius;
    return this;
  }

  cornerRadiusLeft(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusTopLeft = radius;
    this._radiusBottomLeft = radius;
    return this;
  }

  cornerRadiusRight(radius: number): this {
    if (!isFiniteNum(radius)) return this;
    this._radiusTopRight = radius;
    this._radiusBottomRight = radius;
    return this;
  }

  rotateSelf(degrees: number): this {
    const cx = this._x + this._width / 2;
    const cy = this._y + this._height / 2;
    return this.rotate(degrees, cx, cy);
  }

  private generateRoundedRectPath(): string {
    const x = this._x;
    const y = this._y;
    const w = this._width;
    const h = this._height;
    const fallback = this._rx;
    const tl = this._radiusTopLeft ?? fallback ?? 0;
    const tr = this._radiusTopRight ?? fallback ?? 0;
    const br = this._radiusBottomRight ?? fallback ?? 0;
    const bl = this._radiusBottomLeft ?? fallback ?? 0;

    return `
      M ${x + tl} ${y}
      L ${x + w - tr} ${y}
      Q ${x + w} ${y} ${x + w} ${y + tr}
      L ${x + w} ${y + h - br}
      Q ${x + w} ${y + h} ${x + w - br} ${y + h}
      L ${x + bl} ${y + h}
      Q ${x} ${y + h} ${x} ${y + h - bl}
      L ${x} ${y + tl}
      Q ${x} ${y} ${x + tl} ${y}
      Z
    `.trim().replace(/\s+/g, ' ');
  }

  build(): ReactElement {
    const hasIndividualCorners =
      this._radiusTopLeft !== undefined ||
      this._radiusTopRight !== undefined ||
      this._radiusBottomLeft !== undefined ||
      this._radiusBottomRight !== undefined;

    const paint = this.shapePaintProps();
    const shapeElement = hasIndividualCorners
      ? React.createElement('path', {
        d: this.generateRoundedRectPath(),
        ...paint,
      })
      : React.createElement('rect', {
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height,
        rx: this._rx,
        ry: this._ry,
        ...paint,
      });
    return this.wrapShape(shapeElement, 'rect-group');
  }
}

export const Rect = createShapeBuilder(RectBuilder);
