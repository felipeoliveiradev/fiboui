import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

class CircleBuilder extends ShapeBuilder {
  private _cx: number = 0;
  private _cy: number = 0;
  private _r: number = 10;

  // Position methods (specific to Circle)
  center(cx: number, cy: number): this {
    this._cx = cx;
    this._cy = cy;
    return this;
  }

  cx(value: number): this {
    this._cx = value;
    return this;
  }

  cy(value: number): this {
    this._cy = value;
    return this;
  }

  left(value: number): this {
    this._cx = value + this._r;
    return this;
  }

  top(value: number): this {
    this._cy = value + this._r;
    return this;
  }

  right(value: number): this {
    this._cx = value - this._r;
    return this;
  }

  bottom(value: number): this {
    this._cy = value - this._r;
    return this;
  }

  centerX(value: number): this {
    this._cx = value;
    return this;
  }

  centerY(value: number): this {
    this._cy = value;
    return this;
  }

  // Convenience methods for API consistency with Rect
  position(x: number, y: number): this {
    this._cx = x + this._r;
    this._cy = y + this._r;
    return this;
  }

  size(width: number, height: number): this {
    const diameter = (width + height) / 2;
    this._r = diameter / 2;
    return this;
  }

  // Size methods (specific to Circle)
  radius(r: number): this {
    this._r = r;
    return this;
  }

  r(value: number): this {
    this._r = value;
    return this;
  }

  diameter(d: number): this {
    this._r = d / 2;
    return this;
  }

  circumference(c: number): this {
    this._r = c / (2 * Math.PI);
    return this;
  }

  area(a: number): this {
    this._r = Math.sqrt(a / Math.PI);
    return this;
  }

  // Circle-specific rotation methods
  rotateSelf(degrees: number): this {
    this._transform = `rotate(${degrees} ${this._cx} ${this._cy})`;
    return this;
  }

  rotateAround(degrees: number, cx: number, cy: number): this {
    this._transform = `rotate(${degrees} ${cx} ${cy})`;
    return this;
  }

  build(): ReactElement {
    const hasLayers = this._below.length > 0 || this._children.length > 0 || this._over.length > 0;

    const shapeElement = React.createElement('circle', {
      cx: this._cx,
      cy: this._cy,
      r: this._r,
      fill: this._fill,
      fillOpacity: this._fillOpacity,
      stroke: this._stroke,
      strokeWidth: this._strokeWidth,
      strokeOpacity: this._strokeOpacity,
      strokeDasharray: this._strokeDasharray,
      strokeLinecap: this._strokeLinecap,
      opacity: this._opacity,
      transform: this._transform,
      filter: this._filter,
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
      { key: `circle-group-${Math.random()}` },
      groupChildren
    );
  }
}

export const Circle = createShapeBuilder(CircleBuilder);
