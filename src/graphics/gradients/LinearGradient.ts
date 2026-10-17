import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { nextStableId } from '../../core/ids';

class LinearGradientBuilder extends FiboBuilder {
  private _id?: string;
  /** Per-instance auto id — content hashes collided for identical paints (invalid SVG). */
  private readonly _uid = nextStableId('gradient');
  private _colors: string[] = ['#000', '#fff'];
  private _stops?: number[];
  private _angle: number = 0;

  id(value: string): this {
    this._id = value;
    return this;
  }

  /** SVG paint id — used by ShapeBuilder.fill(gradient). */
  gradientId(): string {
    if (this._id) return this._id;
    return this._uid;
  }

  colors(colors: string[]): this {
    if (!Array.isArray(colors)) return this;
    const paints = colors.filter((c): c is string => typeof c === 'string' && c.length > 0);
    this._colors = paints.length > 0 ? paints : ['#000', '#fff'];
    return this;
  }

  stops(stops: number[]): this {
    if (Array.isArray(stops)) this._stops = stops;
    return this;
  }

  angle(degrees: number): this {
    if (typeof degrees === 'number' && Number.isFinite(degrees)) this._angle = degrees;
    return this;
  }

  private angleToCoords(): { x1: string; y1: string; x2: string; y2: string } {
    const rad = (this._angle - 90) * (Math.PI / 180);
    const x1 = 50 - Math.cos(rad) * 50;
    const y1 = 50 - Math.sin(rad) * 50;
    const x2 = 50 + Math.cos(rad) * 50;
    const y2 = 50 + Math.sin(rad) * 50;

    return {
      x1: `${x1}%`,
      y1: `${y1}%`,
      x2: `${x2}%`,
      y2: `${y2}%`
    };
  }

  private stopOffsets(): number[] {
    const n = this._colors.length;
    if (n <= 0) return [];
    if (n === 1) {
      const s = this._stops?.[0];
      return [typeof s === 'number' && Number.isFinite(s) ? s : 0];
    }
    return this._colors.map((_, i) => {
      const s = this._stops?.[i];
      return typeof s === 'number' && Number.isFinite(s) ? s : i / (n - 1);
    });
  }

  build(): ReactElement {
    const coords = this.angleToCoords();
    const stops = this.stopOffsets();
    const gid = this.gradientId();

    const gradientElement = React.createElement(
      'linearGradient',
      {
        id: gid,
        ...coords
      },
      this._colors.map((color, i) =>
        React.createElement('stop', {
          key: i,
          offset: `${stops[i] * 100}%`,
          stopColor: color
        })
      )
    );

    return React.createElement('defs', { key: gid }, gradientElement);
  }
}

export const LinearGradient = createBuilder(LinearGradientBuilder);
