import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

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

  // Position methods (specific to Rect)
  position(x: number, y: number): this {
    this._x = x;
    this._y = y;
    return this;
  }

  x(value: number): this {
    this._x = value;
    return this;
  }

  y(value: number): this {
    this._y = value;
    return this;
  }

  left(value: number): this {
    this._x = value;
    return this;
  }

  top(value: number): this {
    this._y = value;
    return this;
  }

  right(value: number): this {
    this._x = value - this._width;
    return this;
  }

  bottom(value: number): this {
    this._y = value - this._height;
    return this;
  }

  centerX(value: number): this {
    this._x = value - this._width / 2;
    return this;
  }

  centerY(value: number): this {
    this._y = value - this._height / 2;
    return this;
  }

  center(cx: number, cy: number): this {
    this._x = cx - this._width / 2;
    this._y = cy - this._height / 2;
    return this;
  }

  // Size methods (specific to Rect)
  size(width: number, height: number): this {
    this._width = width;
    this._height = height;
    return this;
  }

  width(value: number): this {
    this._width = value;
    return this;
  }

  height(value: number): this {
    this._height = value;
    return this;
  }

  // Corner radius methods (specific to Rect)
  cornerRadius(radius: number): this {
    this._rx = radius;
    this._ry = radius;
    this._radiusTopLeft = undefined;
    this._radiusTopRight = undefined;
    this._radiusBottomLeft = undefined;
    this._radiusBottomRight = undefined;
    return this;
  }

  cornerRadii(rx: number, ry: number): this {
    this._rx = rx;
    this._ry = ry;
    return this;
  }

  cornerRadiusTopLeft(radius: number): this {
    this._radiusTopLeft = radius;
    return this;
  }

  cornerRadiusTopRight(radius: number): this {
    this._radiusTopRight = radius;
    return this;
  }

  cornerRadiusBottomLeft(radius: number): this {
    this._radiusBottomLeft = radius;
    return this;
  }

  cornerRadiusBottomRight(radius: number): this {
    this._radiusBottomRight = radius;
    return this;
  }

  cornerRadiusTop(radius: number): this {
    this._radiusTopLeft = radius;
    this._radiusTopRight = radius;
    return this;
  }

  cornerRadiusBottom(radius: number): this {
    this._radiusBottomLeft = radius;
    this._radiusBottomRight = radius;
    return this;
  }

  cornerRadiusLeft(radius: number): this {
    this._radiusTopLeft = radius;
    this._radiusBottomLeft = radius;
    return this;
  }

  cornerRadiusRight(radius: number): this {
    this._radiusTopRight = radius;
    this._radiusBottomRight = radius;
    return this;
  }

  // Rect-specific rotation
  rotateSelf(degrees: number): this {
    const cx = this._x + this._width / 2;
    const cy = this._y + this._height / 2;
    this._transform = `rotate(${degrees} ${cx} ${cy})`;
    return this;
  }

  private generateRoundedRectPath(): string {
    const x = this._x;
    const y = this._y;
    const w = this._width;
    const h = this._height;
    const tl = this._radiusTopLeft || 0;
    const tr = this._radiusTopRight || 0;
    const br = this._radiusBottomRight || 0;
    const bl = this._radiusBottomLeft || 0;

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

    const hasLayers = this._below.length > 0 || this._children.length > 0 || this._over.length > 0;

    const shapeElement = hasIndividualCorners
      ? React.createElement('path', {
        d: this.generateRoundedRectPath(),
        fill: this._fill,
        fillOpacity: this._fillOpacity,
        stroke: this._stroke,
        strokeWidth: this._strokeWidth,
        strokeOpacity: this._strokeOpacity,
        strokeDasharray: this._strokeDasharray,
        strokeLinecap: this._strokeLinecap,
        strokeLinejoin: this._strokeLinejoin,
        opacity: this._opacity,
        transform: this._transform,
        filter: this._filter,
        clipPath: this._clipPath,
        className: this._className,
        style: this._style
      })
      : React.createElement('rect', {
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height,
        rx: this._rx,
        ry: this._ry,
        fill: this._fill,
        fillOpacity: this._fillOpacity,
        stroke: this._stroke,
        strokeWidth: this._strokeWidth,
        strokeOpacity: this._strokeOpacity,
        strokeDasharray: this._strokeDasharray,
        strokeLinecap: this._strokeLinecap,
        strokeLinejoin: this._strokeLinejoin,
        opacity: this._opacity,
        transform: this._transform,
        filter: this._filter,
        clipPath: this._clipPath,
        className: this._className,
        style: this._style
      });

    if (!hasLayers) {
      return shapeElement;
    }

    const groupChildren = [
      ...this._below,
      shapeElement,
      ...this._children,
      ...this._over
    ];

    return React.createElement(
      'g',
      { key: `rect-group-${Math.random()}` },
      groupChildren
    );
  }
}

export const Rect = createShapeBuilder(RectBuilder);
