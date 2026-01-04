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

  /**
   * Sets the position of the card.
   * @param x X coordinate
   * @param y Y coordinate
   */
  xy(x: number, y: number): this {
    this._x = x;
    this._y = y;
    return this;
  }

  /**
   * Sets the size of the card.
   * @param width Width
   * @param height Height
   */
  size(width: number, height: number): this {
    this._width = width;
    this._height = height;
    return this;
  }

  /**
   * Sets the elevation (shadow depth) of the card.
   * Mimics Flutter's elevation levels (0-5).
   * @param level Elevation level (0 to 5)
   */
  elevation(level: number): this {
    this._elevation = level;
    return this;
  }

  /**
   * Sets the background color of the card.
   * @param value Color string (hex, rgb, etc.)
   */
  color(value: string): this {
    this._color = value;
    return this;
  }

  /**
   * Sets the border radius of the card.
   * @param value Radius in pixels
   */
  rounded(value: number): this {
    this._radius = value;
    return this;
  }

  build(): ReactElement {
    // Map elevation levels to shadow properties
    let shadowConfig: { dy: number, blur: number, opacity: number };

    switch (Math.min(Math.max(0, this._elevation), 5)) {
      case 0: shadowConfig = { dy: 0, blur: 0, opacity: 0 }; break;
      case 1: shadowConfig = { dy: 1, blur: 2, opacity: 0.1 }; break; // sm
      case 2: shadowConfig = { dy: 2, blur: 4, opacity: 0.15 }; break; // md
      case 3: shadowConfig = { dy: 4, blur: 8, opacity: 0.2 }; break; // lg
      case 4: shadowConfig = { dy: 8, blur: 16, opacity: 0.25 }; break; // xl
      case 5: shadowConfig = { dy: 12, blur: 24, opacity: 0.3 }; break; // 2xl
      default: shadowConfig = { dy: 2, blur: 4, opacity: 0.15 }; break;
    }

    return Rect()
      // Position & Size
      .position(this._x, this._y)
      .size(this._width, this._height)

      // Appearance
      .fillHex(this._color)
      .cornerRadius(this._radius)

      // Shadow (Elevation)
      .shadow(0, shadowConfig.dy, shadowConfig.blur, `rgba(0,0,0,${shadowConfig.opacity})`)

      // Content
      .children(this.processChildren())
      .build();
  }
}

export const CardSvg = createBuilder(CardBuilder);
