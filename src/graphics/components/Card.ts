import { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { Rect } from '../shapes/Rect';

class CardBuilder extends FiboBuilder {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 100;
  private _height: number = 100;
  private _elevation: number = 1;
  private _color: string = '#FFFFFF';
  private _radius: number = 12;

  xy(x: number, y: number): this {
    this._x = x;
    this._y = y;
    return this;
  }

  size(width: number, height: number): this {
    this._width = width;
    this._height = height;
    return this;
  }

  elevation(level: number): this {
    this._elevation = level;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  rounded(value: number): this {
    this._radius = value;
    return this;
  }

  build(): ReactElement {

    let shadowConfig: { dy: number, blur: number, opacity: number };

    switch (Math.min(Math.max(0, this._elevation), 5)) {
      case 0: shadowConfig = { dy: 0, blur: 0, opacity: 0 }; break;
      case 1: shadowConfig = { dy: 1, blur: 2, opacity: 0.1 }; break;
      case 2: shadowConfig = { dy: 2, blur: 4, opacity: 0.15 }; break;
      case 3: shadowConfig = { dy: 4, blur: 8, opacity: 0.2 }; break;
      case 4: shadowConfig = { dy: 8, blur: 16, opacity: 0.25 }; break;
      case 5: shadowConfig = { dy: 12, blur: 24, opacity: 0.3 }; break;
      default: shadowConfig = { dy: 2, blur: 4, opacity: 0.15 }; break;
    }

    return Rect()

      .position(this._x, this._y)
      .size(this._width, this._height)

      .fillHex(this._color)
      .cornerRadius(this._radius)

      .shadow(0, shadowConfig.dy, shadowConfig.blur, `rgba(0,0,0,${shadowConfig.opacity})`)

      .children(this.processChildren())
      .build();
  }
}

export const CardSvg = createBuilder(CardBuilder);
