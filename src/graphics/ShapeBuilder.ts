import React, { ReactElement } from 'react';
import type { CSSProperties } from 'react';
import {
  kebabToCamel,
  logicalLonghands,
  normalizeCssValue,
  type LogicalAxes,
} from '../core/cssFluent';

const SHAPE_REACT_FIELDS = new Set<PropertyKey>([
  '$$typeof',
  'type',
  'props',
  'ref',
  'key',
  '_owner',
  '_store',
  '_self',
  '_source',
]);

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;

/** Fluent CSS methods on shapes. Does not override existing SVG APIs (`shadow`, `opacity`, …). */
export type ShapeStyleBuilder<T> = T &
  LogicalAxes & {
    [K in Exclude<KnownKeys<CSSProperties>, KnownKeys<T>>]-?: (
      value: CSSProperties[K] | number | string,
    ) => ShapeStyleBuilder<T>;
  };

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
  protected _paintDefs: React.ReactNode[] = [];

  className(value: string): this {
    this._className = value;
    return this;
  }

  style(value: React.CSSProperties): this {
    this._style = mergeShapeStyle(this._style, value);
    if (value && typeof value === 'object') {
      const keys = Object.keys(value).map((k) => (k.includes('-') ? kebabToCamel(k) : k));
      this.lastWritePresentation(keys);
    }
    return this;
  }

  /** Merge CSS. `css(prop, value)` or `css({ … })` like FiboBuilder (object no longer throws). */
  css(property: string | React.CSSProperties, value?: unknown): this {
    if (property !== null && typeof property === 'object') {
      return this.style(property);
    }
    const name = String(property);
    const camel = name.includes('-') ? kebabToCamel(name) : name;
    const names = logicalLonghands(camel) ?? [camel];
    const next: React.CSSProperties = { ...this._style };
    for (const key of names) {
      (next as Record<string, string>)[key] = normalizeShapeCssValue(key, value);
    }
    this._style = next;
    this.lastWritePresentation(names);
    return this;
  }

  /** CSS `transform`/`filter` win over the SVG presentation attribute (same last-write as rotateX). */
  private lastWritePresentation(keys: readonly string[]): void {
    if (keys.includes('transform')) this._transform = undefined;
    if (keys.includes('filter')) this._filter = undefined;
  }

  private clearStyleProp(key: 'transform' | 'filter'): this {
    if (this._style && this._style[key] != null) {
      const next = { ...this._style };
      delete next[key];
      this._style = next;
    }
    return this;
  }

  fill(color: string | any): this {
    if (typeof color === 'string') {
      this._fill = color;
      return this;
    }
    const paint = resolveSvgPaint(color);
    if (paint) {
      this._fill = paint.fill;
      if (paint.def != null) {
        this._paintDefs.push(paint.def);
      }
      return this;
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
    return this.setSvgTransform(value);
  }

  rotate(degrees: number, cx?: number, cy?: number): this {
    const center = cx !== undefined && cy !== undefined ? ` ${cx} ${cy}` : '';
    return this.setSvgTransform(`rotate(${degrees}${center})`);
  }

  scale(sx: number, sy?: number): this {
    const scaleY = sy !== undefined ? ` ${sy}` : '';
    return this.setSvgTransform(`scale(${sx}${scaleY})`);
  }

  scaleX(sx: number): this {
    return this.setSvgTransform(`scale(${sx} 1)`);
  }

  scaleY(sy: number): this {
    return this.setSvgTransform(`scale(1 ${sy})`);
  }

  scaleUniform(s: number): this {
    return this.setSvgTransform(`scale(${s})`);
  }

  translate(tx: number, ty: number): this {
    return this.setSvgTransform(`translate(${tx} ${ty})`);
  }

  translateX(tx: number): this {
    return this.setSvgTransform(`translate(${tx} 0)`);
  }

  translateY(ty: number): this {
    return this.setSvgTransform(`translate(0 ${ty})`);
  }

  skewX(degrees: number): this {
    return this.setSvgTransform(`skewX(${degrees})`);
  }

  skewY(degrees: number): this {
    return this.setSvgTransform(`skewY(${degrees})`);
  }

  /** CSS 3D — SVG `transform` attr has no rotateX/Y/Z. */
  rotateX(degrees: number): this {
    return this.setCssTransform(`rotateX(${degrees}deg)`);
  }

  rotateY(degrees: number): this {
    return this.setCssTransform(`rotateY(${degrees}deg)`);
  }

  rotateZ(degrees: number): this {
    return this.setCssTransform(`rotateZ(${degrees}deg)`);
  }

  rotate3d(x: number, y: number, z: number, degrees: number): this {
    return this.setCssTransform(`rotate3d(${x}, ${y}, ${z}, ${degrees}deg)`);
  }

  perspective(value: number): this {
    return this.setCssTransform(`perspective(${value}px)`);
  }

  filter(value: string): this {
    this._filter = typeof value === 'string' ? stripSvgDropShadowInset(value) : value;
    return this.clearStyleProp('filter');
  }

  /** SVG 1.1 transform list. Clears a prior CSS 3D `style.transform`. */
  private setSvgTransform(value: string): this {
    this._transform = value;
    return this.clearStyleProp('transform');
  }

  /** CSS transform (3D). Clears the SVG `transform` attribute. */
  private setCssTransform(value: string): this {
    this._transform = undefined;
    return this.css('transform', value);
  }

  blur(amount: number): this {
    this._filter = `blur(${amount}px)`;
    return this.clearStyleProp('filter');
  }

  blurPx(px: number): this {
    this._filter = `blur(${px}px)`;
    return this.clearStyleProp('filter');
  }

  dropShadow(dx: number, dy?: number, blur?: number, color?: string): this {
    return this.applyDropShadow(dx, dy, blur, color);
  }

  /** SVG `filter: drop-shadow()`. 1-arg `0`/`none` matches FiboBuilder `.shadow(0)` = none. */
  shadow(dx: number, dy?: number, blur?: number, color?: string): this {
    return this.applyDropShadow(dx, dy, blur, color);
  }

  private applyDropShadow(dx: number, dy?: number, blur?: number, color?: string): this {
    if (isShadowNone(dx, dy, blur, color)) {
      this._filter = undefined;
      return this.clearStyleProp('filter');
    }
    this._filter = svgDropShadow(dx, dy ?? 0, blur ?? 0, color);
    return this.clearStyleProp('filter');
  }

  glow(color: string, blur: number = 10): this {
    this._filter = `drop-shadow(0 0 ${blur}px ${svgDropShadowColor(color)})`;
    return this.clearStyleProp('filter');
  }

  brightness(value: number): this {
    this._filter = `brightness(${value})`;
    return this.clearStyleProp('filter');
  }

  contrast(value: number): this {
    this._filter = `contrast(${value})`;
    return this.clearStyleProp('filter');
  }

  grayscale(value: number = 1): this {
    this._filter = `grayscale(${value})`;
    return this.clearStyleProp('filter');
  }

  sepia(value: number = 1): this {
    this._filter = `sepia(${value})`;
    return this.clearStyleProp('filter');
  }

  saturate(value: number): this {
    this._filter = `saturate(${value})`;
    return this.clearStyleProp('filter');
  }

  hueRotate(degrees: number): this {
    this._filter = `hue-rotate(${degrees}deg)`;
    return this.clearStyleProp('filter');
  }

  invert(value: number = 1): this {
    this._filter = `invert(${value})`;
    return this.clearStyleProp('filter');
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

  /** Presentation attributes shared by Circle / Rect / Path. */
  protected shapePaintProps(): Record<string, unknown> {
    return {
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
      style: this._style,
    };
  }

  /** Group / fragment wrapper. Keeps stable keys used by production-audit. */
  protected wrapShape(shapeElement: ReactElement, groupKey: string): ReactElement {
    const hasLayers = this._below.length > 0 || this._children.length > 0 || this._over.length > 0;
    const defs = this._paintDefs;
    if (!hasLayers && defs.length === 0) {
      return shapeElement;
    }
    if (!hasLayers) {
      return React.createElement(React.Fragment, null, ...defs, shapeElement);
    }
    return React.createElement(
      'g',
      { key: this._className || groupKey },
      ...defs,
      ...this._below,
      shapeElement,
      ...this._children,
      ...this._over,
    );
  }

  build(): ReactElement {
    throw new Error('build() must be implemented by subclass');
  }
}


/** Merge `.style({…})`: 0→none, logical axes; keep other numbers as numbers. */
function mergeShapeStyle(
  base: React.CSSProperties | undefined,
  extra: React.CSSProperties | null | undefined,
): React.CSSProperties {
  const next: Record<string, unknown> = { ...base };
  if (!extra || typeof extra !== 'object') return next as React.CSSProperties;
  for (const [key, raw] of Object.entries(extra)) {
    if (raw === undefined || raw === null) continue;
    const camel = key.includes('-') ? kebabToCamel(key) : key;
    const logical = logicalLonghands(camel);
    if (logical) {
      const v = normalizeCssValue(logical[0], raw);
      for (const name of logical) next[name] = v;
      continue;
    }
    const normalized = normalizeShapeCssValue(camel, raw);
    if (normalized === 'none' || camel === 'filter' || camel === 'backdropFilter') {
      next[camel] = normalized;
      continue;
    }
    next[camel] = raw;
  }
  return next as React.CSSProperties;
}

/** CSS `drop-shadow()` (SVG filter) rejects `inset`; strip it so the filter applies as outer shadow. */
function svgDropShadowColor(color: unknown): string {
  if (typeof color !== 'string') return '';
  return color.replace(/\binset\b/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** FiboBuilder `.shadow(0)` / `.shadow('none')` — 4-arg `shadow(0, dy, blur, color)` stays a drop-shadow. */
function isShadowNone(dx: unknown, dy?: unknown, blur?: unknown, color?: unknown): boolean {
  if (dy !== undefined || blur !== undefined || color !== undefined) return false;
  return dx === 0 || dx === '0' || dx === 'none' || dx == null || dx === false;
}

function normalizeShapeCssValue(key: string, value: unknown): string {
  const normalized = normalizeCssValue(key, value);
  if (key === 'filter' || key === 'backdropFilter') {
    return stripSvgDropShadowInset(normalized);
  }
  return normalized;
}

/** Strip `inset` inside `drop-shadow()`, but keep `url(#inset)`. */
function stripSvgDropShadowInset(value: string): string {
  if (!/drop-shadow\s*\(/i.test(value)) return value;
  return value
    .replace(/\binset\b/gi, (token, offset: number, full: string) => {
      const before = full.slice(0, offset);
      if (/url\s*\([^)]*$/i.test(before)) return token;
      return ' ';
    })
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function svgDropShadow(dx: number, dy: number, blur: number, color?: unknown): string {
  return `drop-shadow(${dx}px ${dy}px ${blur}px ${svgDropShadowColor(color)})`;
}

function resolveSvgPaint(color: unknown): { fill: string; def?: React.ReactNode } | undefined {
  if (!color || typeof color !== 'object') return undefined;
  const rec = color as {
    gradientId?: () => string;
    id?: unknown;
    element?: React.ReactNode;
    props?: { id?: unknown };
    build?: () => unknown;
  };
  let gid: string | undefined;
  if (typeof rec.gradientId === 'function') {
    const id = rec.gradientId();
    if (typeof id === 'string' && id) gid = id;
  }
  if (!gid && typeof rec.id === 'string' && rec.id) gid = rec.id;
  if (!gid && typeof rec.props?.id === 'string' && rec.props.id) gid = rec.props.id;
  if (!gid) return undefined;
  // Fluent createBuilder proxies return a CSS stub for unknown props like
  // `.element`. Only host nodes belong in <defs>; assemble via `.build()`.
  let def = asPaintDef(rec.element);
  if (def == null && typeof rec.build === 'function') {
    def = asPaintDef(rec.build());
  }
  return { fill: `url(#${gid})`, def };
}

function asPaintDef(value: unknown): React.ReactNode | undefined {
  if (value == null || typeof value === 'function' || typeof value === 'boolean') return undefined;
  if (React.isValidElement(value)) return value;
  return undefined;
}

export function createShapeBuilder<T extends ShapeBuilder>(
  BuilderClass: new () => T,
): () => ShapeStyleBuilder<T> {
  return () => {
    const instance = new BuilderClass();
    const assemble = () => instance.build();
    const displayName = BuilderClass.name.replace(/Builder$/, '') || 'Shape';
    const Render = function FiboShape() {
      return assemble();
    };
    Render.displayName = displayName;
    const proto = React.createElement(Render);
    Object.defineProperty(instance, '$$typeof', {
      value: (proto as any).$$typeof,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(instance, 'type', {
      value: Render,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    (instance as any).props = proto.props ?? {};
    (instance as any).ref = (proto as any).ref ?? null;
    (instance as any)._store = { validated: 1 };

    // CSS-like proxy: unknown methods merge into style. `shadow(dx,dy,blur,color)` stays SVG.
    const proxy = new Proxy(instance, {
      get(target, prop, receiver) {
        if (
          typeof prop !== 'string' ||
          prop === 'constructor' ||
          prop === 'then' ||
          SHAPE_REACT_FIELDS.has(prop)
        ) {
          return Reflect.get(target, prop, receiver);
        }

        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          if (typeof val !== 'function') return val;
          return (...args: unknown[]) => {
            const result = (val as Function).apply(target, args);
            return result === target ? proxy : result;
          };
        }

        return (value: unknown) => {
          target.css(prop, value);
          return proxy;
        };
      },
    });

    return proxy as ShapeStyleBuilder<T>;
  };
}
