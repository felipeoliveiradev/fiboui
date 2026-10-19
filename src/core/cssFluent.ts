import type { CSSProperties } from 'react';

/** CSS props that accept unitless numbers (React / CSSOM). */
const UNITLESS = new Set([
  'opacity',
  'zIndex',
  'z-index',
  'flex',
  'flexGrow',
  'flex-grow',
  'flexShrink',
  'flex-shrink',
  'order',
  'fontWeight',
  'font-weight',
  'lineHeight',
  'line-height',
  'zoom',
  'orphans',
  'widows',
  'columnCount',
  'column-count',
  'gridRow',
  'grid-row',
  'gridColumn',
  'grid-column',
  'gridArea',
  'grid-area',
  'aspectRatio',
  'aspect-ratio',
  'lineClamp',
  'line-clamp',
  'tabSize',
  'tab-size',
  'scale',
  'scaleX',
  'scaleY',
  'animationIterationCount',
  'animation-iteration-count',
]);

/** Props where `0` means “off”, not `0px`. */
const ZERO_MEANS_NONE = new Set([
  'boxShadow',
  'box-shadow',
  'textShadow',
  'text-shadow',
  'filter',
  'backdropFilter',
  'backdrop-filter',
  'outline',
]);

export function camelToKebab(prop: string): string {
  if (prop.startsWith('--')) return prop;
  return prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamel(prop: string): string {
  if (prop.startsWith('--')) return prop;
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Names that are not CSS properties (Flutter / RN / Tailwind-ish).
 * Each expands to real longhands so they work on every builder, itemStyle and :hover.
 */
const LOGICAL_CSS = {
  paddingHorizontal: ['paddingLeft', 'paddingRight'],
  paddingVertical: ['paddingTop', 'paddingBottom'],
  paddingX: ['paddingLeft', 'paddingRight'],
  paddingY: ['paddingTop', 'paddingBottom'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
  marginHorizontal: ['marginLeft', 'marginRight'],
  marginVertical: ['marginTop', 'marginBottom'],
  marginX: ['marginLeft', 'marginRight'],
  marginY: ['marginTop', 'marginBottom'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  borderHorizontal: ['borderLeft', 'borderRight'],
  borderVertical: ['borderTop', 'borderBottom'],
  borderX: ['borderLeft', 'borderRight'],
  borderY: ['borderTop', 'borderBottom'],
  borderWidthHorizontal: ['borderLeftWidth', 'borderRightWidth'],
  borderWidthVertical: ['borderTopWidth', 'borderBottomWidth'],
  borderColorHorizontal: ['borderLeftColor', 'borderRightColor'],
  borderColorVertical: ['borderTopColor', 'borderBottomColor'],
  roundedTop: ['borderTopLeftRadius', 'borderTopRightRadius'],
  roundedBottom: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
  roundedLeft: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  roundedRight: ['borderTopRightRadius', 'borderBottomRightRadius'],
  insetHorizontal: ['left', 'right'],
  insetVertical: ['top', 'bottom'],
  insetX: ['left', 'right'],
  insetY: ['top', 'bottom'],
  gapX: ['columnGap'],
  gapY: ['rowGap'],
} as const;

export type LogicalCssName = keyof typeof LOGICAL_CSS;

/**
 * Fluent axes (`paddingHorizontal`, `borderHorizontal`, …).
 * `this` keeps the chain typed without a circular alias.
 */
export interface LogicalAxes {
  paddingHorizontal(value: string | number): this;
  paddingVertical(value: string | number): this;
  paddingX(value: string | number): this;
  paddingY(value: string | number): this;
  px(value: string | number): this;
  py(value: string | number): this;
  marginHorizontal(value: string | number): this;
  marginVertical(value: string | number): this;
  marginX(value: string | number): this;
  marginY(value: string | number): this;
  mx(value: string | number): this;
  my(value: string | number): this;
  borderHorizontal(value: string | number): this;
  borderVertical(value: string | number): this;
  borderX(value: string | number): this;
  borderY(value: string | number): this;
  borderWidthHorizontal(value: string | number): this;
  borderWidthVertical(value: string | number): this;
  borderColorHorizontal(value: string | number): this;
  borderColorVertical(value: string | number): this;
  roundedTop(value: string | number): this;
  roundedBottom(value: string | number): this;
  roundedLeft(value: string | number): this;
  roundedRight(value: string | number): this;
  insetHorizontal(value: string | number): this;
  insetVertical(value: string | number): this;
  insetX(value: string | number): this;
  insetY(value: string | number): this;
  gapX(value: string | number): this;
  gapY(value: string | number): this;
}

export function logicalLonghands(method: string): string[] | null {
  const hit = (LOGICAL_CSS as Record<string, readonly string[] | undefined>)[method];
  return hit ? [...hit] : null;
}

export type BoxKind = 'padding' | 'margin';

const BOX_SIDE_KEBAB: Record<BoxKind, readonly [string, string, string, string]> = {
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
};

const BOX_LONGHAND: Record<string, BoxKind> = {
  paddingTop: 'padding',
  paddingRight: 'padding',
  paddingBottom: 'padding',
  paddingLeft: 'padding',
  marginTop: 'margin',
  marginRight: 'margin',
  marginBottom: 'margin',
  marginLeft: 'margin',
};

/**
 * Split a padding/margin shorthand on spaces, keeping `calc()` / `var()` / `clamp()`
 * (and nested parens) as a single token. Naive `split(/\s+/)` turns
 * `8px calc(50% - 10px)` into four parts and yields `padding-bottom: -`.
 */
function splitCssSpaceSeparated(value: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (const ch of value) {
    if (ch === '(') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ')') {
      if (depth > 0) depth -= 1;
      current += ch;
      continue;
    }
    if (depth === 0 && /\s/.test(ch)) {
      if (current) {
        parts.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

/** Parse CSS `padding` / `margin` shorthand into [top, right, bottom, left]. */
export function parseBoxShorthand(value: string): [string, string, string, string] {
  const parts = splitCssSpaceSeparated(String(value).trim());
  const a = parts[0] ?? '';
  const b = parts[1] ?? a;
  const c = parts[2] ?? a;
  const d = parts[3] ?? b;
  return [a, b, c, d];
}

/**
 * Later `padding`/`margin` shorthand must not clobber existing axis longhands.
 * If any side is already set, expand into the missing sides only.
 */
export function resolveBoxShorthand(
  kind: BoxKind,
  value: string | number,
  existingKebab: ReadonlySet<string>,
): { shorthand: string | null; longhands: Array<[string, string]> } {
  const v = normalizeCssValue(kind, value);
  const sides = BOX_SIDE_KEBAB[kind];
  if (!sides.some((side) => existingKebab.has(side))) {
    return { shorthand: v, longhands: [] };
  }
  const parsed = parseBoxShorthand(v);
  const longhands: Array<[string, string]> = [];
  sides.forEach((side, i) => {
    if (!existingKebab.has(side)) longhands.push([side, parsed[i]]);
  });
  return { shorthand: null, longhands };
}

/** Apply a box shorthand onto a style object without resetting existing longhands. */
export function applyBoxShorthandToStyle(
  style: CSSProperties,
  kind: BoxKind,
  value: string | number,
): void {
  const record = style as Record<string, string | number>;
  const existing = new Set<string>();
  for (const kebab of BOX_SIDE_KEBAB[kind]) {
    if (record[kebabToCamel(kebab)] != null) existing.add(kebab);
  }
  const resolved = resolveBoxShorthand(kind, value, existing);
  if (resolved.shorthand != null) {
    record[kind] = resolved.shorthand;
    return;
  }
  for (const [kebab, val] of resolved.longhands) {
    record[kebabToCamel(kebab)] = val;
  }
  delete record[kind];
}

/**
 * Expand `padding` / `margin` shorthand into four longhands so a later
 * `.paddingLeft` / `.paddingHorizontal` is not reset by the shorthand.
 */
function expandBoxShorthand(style: CSSProperties, kind: BoxKind): void {
  const raw = (style as Record<string, unknown>)[kind];
  if (raw == null || raw === '') return;

  const [top, right, bottom, left] = parseBoxShorthand(String(raw));
  const sides: Array<[string, string]> = [
    [`${kind}Top`, top],
    [`${kind}Right`, right],
    [`${kind}Bottom`, bottom],
    [`${kind}Left`, left],
  ];
  const record = style as Record<string, string | number>;
  for (const [key, value] of sides) {
    if (record[key] == null) record[key] = value;
  }
  delete record[kind];
}

function writeNormalizedProp(
  out: Record<string, string>,
  camel: string,
  raw: unknown,
): void {
  const box = BOX_LONGHAND[camel];
  if (box) expandBoxShorthand(out as CSSProperties, box);
  out[camel] = normalizeCssValue(camel, raw);
}

/** Normalize every value in a style object (`boxShadow: 0` → `none`). */
export function normalizeCssProperties(
  styles: CSSProperties | Record<string, unknown>,
): CSSProperties {
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(styles)) {
    if (raw === undefined || raw === null) continue;
    const camel = key.startsWith('--') ? key : key.includes('-') ? kebabToCamel(key) : key;
    const logical = logicalLonghands(camel);
    if (logical) {
      for (const longhand of logical) {
        writeNormalizedProp(out, longhand, raw);
      }
      continue;
    }
    if (camel === 'padding' || camel === 'margin') {
      applyBoxShorthandToStyle(out as CSSProperties, camel, raw as string | number);
      continue;
    }
    writeNormalizedProp(out, camel, raw);
  }
  return out as CSSProperties;
}

/**
 * Normalize a fluent value into a CSS declaration value.
 * Numbers get `px` unless unitless; `boxShadow(0)` → `none`.
 */
export function normalizeCssValue(prop: string, value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  if (typeof value === 'number') {
    if (prop.startsWith('--')) return String(value);
    if (value === 0 && ZERO_MEANS_NONE.has(prop)) return 'none';
    if (UNITLESS.has(prop) || UNITLESS.has(camelToKebab(prop))) return String(value);
    return `${value}px`;
  }

  const str = String(value);
  if ((str === '0' || str === '0px') && ZERO_MEANS_NONE.has(prop)) return 'none';
  return str;
}

export type CssFluentMethods = {
  [K in keyof CSSProperties]-?: (value: CSSProperties[K] | number | string) => CssFluentProxy;
} & {
  /** Escape hatch: any CSS property (camel or kebab). */
  css(property: string, value: string | number): CssFluentProxy;
  /** Merge a raw style object. */
  style(extra: CSSProperties): CssFluentProxy;
};

export type CssFluentProxy = CssFluentMethods &
  LogicalAxes & {
    /** Shorthand for `backgroundColor` (FiboBuilder / List / Checkbox state paints). */
    bg(color: string): CssFluentProxy;
    toStyle(): CSSProperties;
    toCSSString(): string;
  };

type CssFluentHost = {
  setProp(prop: string, value: string | number): void;
  mergeStyle(extra: CSSProperties): void;
  toStyle(): CSSProperties;
  toCSSString(): string;
};

/**
 * Proxy that accepts **any** CSS3 property as a fluent method
 * (same idea as `createBuilder` on FiboBuilder).
 *
 * ```ts
 * s.boxShadow('0 8px 24px rgba(0,0,0,.12)').padding(16).backdropFilter('blur(8px)')
 * s.css('clip-path', 'circle(50%)')
 * ```
 */
export function createCssFluentProxy(host: CssFluentHost): CssFluentProxy {
  const wrap = (fn: (...args: any[]) => any) =>
    (...args: any[]) => {
      fn(...args);
      return proxy;
    };

  const proxy: CssFluentProxy = new Proxy({} as CssFluentProxy, {
    get(_t, prop) {
      if (prop === 'toStyle') return () => host.toStyle();
      if (prop === 'toCSSString') return () => host.toCSSString();

      if (prop === 'css') {
        return wrap((property: string, value: string | number) => {
          const camel = property.includes('-') ? kebabToCamel(property) : property;
          host.setProp(camel, normalizeCssValue(camel, value));
        });
      }

      if (prop === 'style') {
        return wrap((extra: CSSProperties) => host.mergeStyle(extra));
      }

      if (typeof prop !== 'string') return undefined;

      // Host convenience methods (bg, padding, rounded, …) — bind `this` to host
      const hostAny = host as unknown as Record<string, unknown>;
      const hostFn = hostAny[prop];
      if (typeof hostFn === 'function' && !['setProp', 'mergeStyle', 'toStyle', 'toCSSString'].includes(prop)) {
        return wrap((...args: unknown[]) => (hostFn as Function).call(host, ...args));
      }

      const logical = logicalLonghands(prop);
      if (logical) {
        return wrap((value: unknown) => {
          for (const longhand of logical) {
            host.setProp(longhand, normalizeCssValue(longhand, value));
          }
        });
      }

      // Any CSS property: .boxShadow(...), .transform(...), .clipPath(...), …
      return wrap((value: unknown) => {
        host.setProp(prop, normalizeCssValue(prop, value));
      });
    },
  });

  return proxy;
}

/** Shared store for itemStyle / itemHover fluent builders. */
export class CssStyleStore implements CssFluentHost {
  protected _style: CSSProperties = {};

  /** Shorthand for `backgroundColor` (same as FiboBuilder / ListItemStyleBuilder). */
  bg(color: string): this {
    this.setProp('backgroundColor', color);
    return this;
  }

  setProp(prop: string, value: string | number): void {
    if (prop === 'padding' || prop === 'margin') {
      applyBoxShorthandToStyle(this._style, prop, value);
      return;
    }
    const box = BOX_LONGHAND[prop];
    if (box) expandBoxShorthand(this._style, box);
    (this._style as Record<string, string | number>)[prop] = value;
  }

  /** Flutter / RN: left + right. */
  paddingHorizontal(value: number | string): this {
    const v = normalizeCssValue('paddingLeft', value);
    this.setProp('paddingLeft', v);
    this.setProp('paddingRight', v);
    return this;
  }

  /** Flutter / RN: top + bottom. */
  paddingVertical(value: number | string): this {
    const v = normalizeCssValue('paddingTop', value);
    this.setProp('paddingTop', v);
    this.setProp('paddingBottom', v);
    return this;
  }

  paddingX(value: number | string): this {
    return this.paddingHorizontal(value);
  }

  paddingY(value: number | string): this {
    return this.paddingVertical(value);
  }

  marginHorizontal(value: number | string): this {
    const v = normalizeCssValue('marginLeft', value);
    this.setProp('marginLeft', v);
    this.setProp('marginRight', v);
    return this;
  }

  marginVertical(value: number | string): this {
    const v = normalizeCssValue('marginTop', value);
    this.setProp('marginTop', v);
    this.setProp('marginBottom', v);
    return this;
  }

  marginX(value: number | string): this {
    return this.marginHorizontal(value);
  }

  marginY(value: number | string): this {
    return this.marginVertical(value);
  }

  mergeStyle(extra: CSSProperties): void {
    const normalized = normalizeCssProperties(extra);
    for (const [key, value] of Object.entries(normalized)) {
      this.setProp(key, value as string);
    }
  }

  toStyle(): CSSProperties {
    return { ...this._style };
  }

  toCSSString(): string {
    return Object.entries(this._style)
      .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
      .join('; ')
      .concat(Object.keys(this._style).length ? ';' : '');
  }
}

/**
 * Resolve a style object or fluent callback into `CSSProperties`.
 * Same shape as `List().itemStyle(...)` — works for Checkbox / Switch state paints.
 *
 * ```ts
 * resolveFluentCss((s) => s.bg('#c8ff00').borderColor('transparent'))
 * resolveFluentCss({ backgroundColor: '#c8ff00' })
 * ```
 */
export function resolveFluentCss(
  input: CSSProperties | ((builder: CssFluentProxy) => void | CssFluentProxy)
): CSSProperties {
  if (typeof input === 'function') {
    const host = new CssStyleStore();
    const proxy = createCssFluentProxy(host);
    input(proxy);
    return host.toStyle();
  }
  return normalizeCssProperties(input);
}
