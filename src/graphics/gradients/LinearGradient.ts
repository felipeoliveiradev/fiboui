import React from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { hashKey } from '../../core/styleManager';

class LinearGradientBuilder extends FiboBuilder {
  private _id?: string;
  private _colors: string[] = ['#000', '#fff'];
  private _stops?: number[];
  private _angle: number = 0;

  id(value: string): this {
    this._id = value;
    return this;
  }

  private gradientId(): string {
    if (this._id) return this._id;
    return `gradient-${hashKey(JSON.stringify({ c: this._colors, s: this._stops, a: this._angle }))}`;
  }

  colors(colors: string[]): this {
    this._colors = colors;
    return this;
  }

  stops(stops: number[]): this {
    this._stops = stops;
    return this;
  }

  angle(degrees: number): this {
    this._angle = degrees;
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

  build(): any {
    const coords = this.angleToCoords();
    const stops = this._stops || this._colors.map((_, i) => i / (this._colors.length - 1));

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

    return { element: gradientElement, id: gid };
  }
}

export const LinearGradient = createBuilder(LinearGradientBuilder);
