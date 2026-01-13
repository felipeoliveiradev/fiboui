import React, { ReactElement } from 'react';

export class ShapeBuilder {
  protected _className?: string;
  protected _style?: React.CSSProperties;
  protected _fill: string = '#000';
  protected _stroke?: string;
  protected _strokeWidth?: number;
  protected _strokeDasharray?: string;
  protected _strokeLinecap?: 'butt' | 'round' | 'square';
  protected _strokeLinejoin?: 'miter' | 'round' | 'bevel';
  protected _opacity?: number;
  protected _fillOpacity?: number;
  protected _strokeOpacity?: number;
  protected _transform?: string;
  protected _filter?: string;
  protected _clipPath?: string;
  protected _children: React.ReactNode[] = [];
  protected _over: React.ReactNode[] = [];
  protected _below: React.ReactNode[] = [];

  className(value: string): this {
    this._className = value;
    return this;
  }

  style(value: React.CSSProperties): this {
    this._style = value;
    return this;
  }

  fill(color: string | any): this {
    if (typeof color === 'string') {
      this._fill = color;
    } else {
      this._fill = `url(#${color.id})`;
    }
    return this;
  }

  fillColor(color: string): this {
    this._fill = color;
    return this;
  }

  fillRGB(r: number, g: number, b: number): this {
    this._fill = `rgb(${r}, ${g}, ${b})`;
    return this;
  }

  fillRGBA(r: number, g: number, b: number, a: number): this {
    this._fill = `rgba(${r}, ${g}, ${b}, ${a})`;
    return this;
  }

  fillHex(hex: string): this {
    this._fill = hex.startsWith('#') ? hex : `#${hex}`;
    return this;
  }

  fillOpacity(value: number): this {
    this._fillOpacity = value;
    return this;
  }

  stroke(color: string): this {
    this._stroke = color;
    return this;
  }

  strokeColor(color: string): this {
    this._stroke = color;
    return this;
  }

  strokeRGB(r: number, g: number, b: number): this {
    this._stroke = `rgb(${r}, ${g}, ${b})`;
    return this;
  }

  strokeRGBA(r: number, g: number, b: number, a: number): this {
    this._stroke = `rgba(${r}, ${g}, ${b}, ${a})`;
    return this;
  }

  strokeHex(hex: string): this {
    this._stroke = hex.startsWith('#') ? hex : `#${hex}`;
    return this;
  }

  strokeWidth(width: number): this {
    this._strokeWidth = width;
    return this;
  }

  strokeW(width: number): this {
    this._strokeWidth = width;
    return this;
  }

  strokeOpacity(value: number): this {
    this._strokeOpacity = value;
    return this;
  }

  strokeDasharray(pattern: string): this {
    this._strokeDasharray = pattern;
    return this;
  }

  strokeLinecap(value: 'butt' | 'round' | 'square'): this {
    this._strokeLinecap = value;
    return this;
  }

  strokeLinejoin(value: 'miter' | 'round' | 'bevel'): this {
    this._strokeLinejoin = value;
    return this;
  }

  dashed(dashLength: number = 5, gapLength: number = 5): this {
    this._strokeDasharray = `${dashLength} ${gapLength}`;
    return this;
  }

  dotted(dotSize: number = 2, gapSize: number = 2): this {
    this._strokeDasharray = `${dotSize} ${gapSize}`;
    this._strokeLinecap = 'round';
    return this;
  }

  opacity(value: number): this {
    this._opacity = value;
    return this;
  }

  alpha(value: number): this {
    this._opacity = value;
    return this;
  }

  transparent(percent: number): this {
    this._opacity = 1 - (percent / 100);
    return this;
  }

  opaque(): this {
    this._opacity = 1;
    return this;
  }

  transform(value: string): this {
    this._transform = value;
    return this;
  }

  rotate(degrees: number, cx?: number, cy?: number): this {
    const center = cx !== undefined && cy !== undefined ? ` ${cx} ${cy}` : '';
    this._transform = `rotate(${degrees}${center})`;
    return this;
  }

  scale(sx: number, sy?: number): this {
    const scaleY = sy !== undefined ? ` ${sy}` : '';
    this._transform = `scale(${sx}${scaleY})`;
    return this;
  }

  scaleX(sx: number): this {
    this._transform = `scale(${sx} 1)`;
    return this;
  }

  scaleY(sy: number): this {
    this._transform = `scale(1 ${sy})`;
    return this;
  }

  scaleUniform(s: number): this {
    this._transform = `scale(${s})`;
    return this;
  }

  translate(tx: number, ty: number): this {
    this._transform = `translate(${tx} ${ty})`;
    return this;
  }

  translateX(tx: number): this {
    this._transform = `translate(${tx} 0)`;
    return this;
  }

  translateY(ty: number): this {
    this._transform = `translate(0 ${ty})`;
    return this;
  }

  skewX(degrees: number): this {
    this._transform = `skewX(${degrees})`;
    return this;
  }

  skewY(degrees: number): this {
    this._transform = `skewY(${degrees})`;
    return this;
  }

  rotateX(degrees: number): this {
    this._transform = `rotateX(${degrees}deg)`;
    return this;
  }

  rotateY(degrees: number): this {
    this._transform = `rotateY(${degrees}deg)`;
    return this;
  }

  rotateZ(degrees: number): this {
    this._transform = `rotateZ(${degrees}deg)`;
    return this;
  }

  rotate3d(x: number, y: number, z: number, degrees: number): this {
    this._transform = `rotate3d(${x}, ${y}, ${z}, ${degrees}deg)`;
    return this;
  }

  perspective(value: number): this {
    this._transform = `perspective(${value}px)`;
    return this;
  }

  filter(value: string): this {
    this._filter = value;
    return this;
  }

  blur(amount: number): this {
    this._filter = `blur(${amount}px)`;
    return this;
  }

  blurPx(px: number): this {
    this._filter = `blur(${px}px)`;
    return this;
  }

  dropShadow(dx: number, dy: number, blur: number, color: string): this {
    this._filter = `drop-shadow(${dx}px ${dy}px ${blur}px ${color})`;
    return this;
  }

  shadow(dx: number, dy: number, blur: number, color: string): this {
    this._filter = `drop-shadow(${dx}px ${dy}px ${blur}px ${color})`;
    return this;
  }

  glow(color: string, blur: number = 10): this {
    this._filter = `drop-shadow(0 0 ${blur}px ${color})`;
    return this;
  }

  brightness(value: number): this {
    this._filter = `brightness(${value})`;
    return this;
  }

  contrast(value: number): this {
    this._filter = `contrast(${value})`;
    return this;
  }

  grayscale(value: number = 1): this {
    this._filter = `grayscale(${value})`;
    return this;
  }

  sepia(value: number = 1): this {
    this._filter = `sepia(${value})`;
    return this;
  }

  saturate(value: number): this {
    this._filter = `saturate(${value})`;
    return this;
  }

  hueRotate(degrees: number): this {
    this._filter = `hue-rotate(${degrees}deg)`;
    return this;
  }

  invert(value: number = 1): this {
    this._filter = `invert(${value})`;
    return this;
  }

  clipPath(value: string): this {
    this._clipPath = value;
    return this;
  }

  children(elements: React.ReactNode[]): this {
    this._children = elements;
    return this;
  }

  child(element: React.ReactNode): this {
    this._children.push(element);
    return this;
  }

  over(elements: React.ReactNode[]): this {
    this._over = elements;
    return this;
  }

  below(elements: React.ReactNode[]): this {
    this._below = elements;
    return this;
  }

  build(): ReactElement {
    throw new Error('build() must be implemented by subclass');
  }
}

export function createShapeBuilder<T extends ShapeBuilder>(BuilderClass: new () => T): () => T {
  return () => new BuilderClass();
}
