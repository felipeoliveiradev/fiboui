import React, { ReactElement } from 'react';
import { ShapeBuilder, createShapeBuilder } from '../ShapeBuilder';

function asPathD(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

class PathBuilder extends ShapeBuilder {
  private _d: string = '';

  d(pathData: string): this {
    this._d = asPathD(pathData);
    return this;
  }

  /** Append a command; skip if any coordinate is non-finite (invalid SVG). */
  private push(chunk: string, nums: number[]): this {
    if (typeof this._d !== 'string') this._d = '';
    for (let i = 0; i < nums.length; i += 1) {
      if (!Number.isFinite(nums[i])) return this;
    }
    this._d += chunk;
    return this;
  }

  moveTo(x: number, y: number): this {
    return this.push(`M ${x} ${y} `, [x, y]);
  }

  lineTo(x: number, y: number): this {
    return this.push(`L ${x} ${y} `, [x, y]);
  }

  horizontalLineTo(x: number): this {
    return this.push(`H ${x} `, [x]);
  }

  verticalLineTo(y: number): this {
    return this.push(`V ${y} `, [y]);
  }

  curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    return this.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y} `, [x1, y1, x2, y2, x, y]);
  }

  smoothCurveTo(x2: number, y2: number, x: number, y: number): this {
    return this.push(`S ${x2} ${y2}, ${x} ${y} `, [x2, y2, x, y]);
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): this {
    return this.push(`Q ${x1} ${y1}, ${x} ${y} `, [x1, y1, x, y]);
  }

  smoothQuadraticCurveTo(x: number, y: number): this {
    return this.push(`T ${x} ${y} `, [x, y]);
  }

  arc(rx: number, ry: number, rotation: number, largeArc: 0 | 1, sweep: 0 | 1, x: number, y: number): this {
    return this.push(`A ${rx} ${ry} ${rotation} ${largeArc} ${sweep} ${x} ${y} `, [rx, ry, rotation, largeArc, sweep, x, y]);
  }

  close(): this {
    return this.push('Z ', []);
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
    const d = asPathD(this._d).trim() || undefined;
    const shapeElement = React.createElement('path', {
      d,
      ...this.shapePaintProps(),
    });
    return this.wrapShape(shapeElement, 'path-group');
  }
}

export const Path = createShapeBuilder(PathBuilder);
