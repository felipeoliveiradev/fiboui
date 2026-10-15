import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

class PathBuilder extends ShapeBuilder {
  private _d: string = '';

  d(pathData: string): this {
    this._d = pathData;
    return this;
  }

  moveTo(x: number, y: number): this {
    this._d += `M ${x} ${y} `;
    return this;
  }

  lineTo(x: number, y: number): this {
    this._d += `L ${x} ${y} `;
    return this;
  }

  horizontalLineTo(x: number): this {
    this._d += `H ${x} `;
    return this;
  }

  verticalLineTo(y: number): this {
    this._d += `V ${y} `;
    return this;
  }

  curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this._d += `C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y} `;
    return this;
  }

  smoothCurveTo(x2: number, y2: number, x: number, y: number): this {
    this._d += `S ${x2} ${y2}, ${x} ${y} `;
    return this;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): this {
    this._d += `Q ${x1} ${y1}, ${x} ${y} `;
    return this;
  }

  smoothQuadraticCurveTo(x: number, y: number): this {
    this._d += `T ${x} ${y} `;
    return this;
  }

  arc(rx: number, ry: number, rotation: number, largeArc: 0 | 1, sweep: 0 | 1, x: number, y: number): this {
    this._d += `A ${rx} ${ry} ${rotation} ${largeArc} ${sweep} ${x} ${y} `;
    return this;
  }

  close(): this {
    this._d += 'Z ';
    return this;
  }

  private _pullX?: number;
  private _pullY?: number;

  startAt(x: number, y: number): this {
    return this.moveTo(x, y);
  }

  lineUntil(x: number, y: number): this {
    return this.lineTo(x, y);
  }

  curveUntil(endX: number, endY: number, pullX: number, pullY: number): this {
    return this.quadraticCurveTo(pullX, pullY, endX, endY);
  }

  pull(x: number, y: number): this {
    this._pullX = x;
    this._pullY = y;
    return this;
  }

  to(x: number, y: number): this {
    if (this._pullX !== undefined && this._pullY !== undefined) {

      this.quadraticCurveTo(this._pullX, this._pullY, x, y);

      this._pullX = undefined;
      this._pullY = undefined;
    } else {

      this.lineTo(x, y);
    }
    return this;
  }

  done(): this {
    return this.close();
  }

  build(): ReactElement {
    const hasLayers = this._below.length > 0 || this._children.length > 0 || this._over.length > 0;

    const shapeElement = React.createElement('path', {
      d: this._d.trim(),
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
      { key: this._className || 'path-group' },
      groupChildren
    );
  }
}

export const Path = createShapeBuilder(PathBuilder);
