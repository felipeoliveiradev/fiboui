import React from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { nextStableId } from '../../core/ids';

class LinearGradientBuilder extends FiboBuilder {
  private _id: string = nextStableId('gradient');
  private _colors: string[] = ['#000', '#fff'];
  private _stops?: number[];
  private _angle: number = 0;

  id(value: string): this {
    this._id = value;
    return this;
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

    const gradientElement = React.createElement(
      'linearGradient',
      {
        id: this._id,
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

    return { element: gradientElement, id: this._id };
  }
}

export const LinearGradient = createBuilder(LinearGradientBuilder);
