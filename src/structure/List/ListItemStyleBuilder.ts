import type { CSSProperties } from 'react';
import {
  CssStyleStore,
  createCssFluentProxy,
  normalizeCssValue,
  type CssFluentProxy,
} from '../../core/cssFluent';

/**
 * Resting styles for every list row.
 * SwiftUI `listRowBackground` / `listRowInsets` · Flutter `ListTileTheme`.
 *
 * Accepts **any CSS3 property** via fluent methods (Proxy), same as FiboBuilder:
 * `.boxShadow(...)`, `.transform(...)`, `.backdropFilter(...)`, `.clipPath(...)`, …
 */
export class ListItemStyleBuilder extends CssStyleStore {
  padding(value: number | string): this {
    this.setProp('padding', normalizeCssValue('padding', value));
    return this;
  }

  paddingX(value: number | string): this {
    const v = normalizeCssValue('paddingLeft', value);
    this.setProp('paddingLeft', v);
    this.setProp('paddingRight', v);
    return this;
  }

  paddingY(value: number | string): this {
    const v = normalizeCssValue('paddingTop', value);
    this.setProp('paddingTop', v);
    this.setProp('paddingBottom', v);
    return this;
  }

  /** SwiftUI-ish: `listRowInsets` */
  insets(value: number | string): this {
    return this.padding(value);
  }

  bg(color: string): this {
    this.setProp('backgroundColor', color);
    return this;
  }

  /** SwiftUI-ish: `listRowBackground` */
  background(color: string): this {
    return this.bg(color);
  }

  color(value: string): this {
    this.setProp('color', value);
    return this;
  }

  rounded(value: number | string = 8): this {
    this.setProp('borderRadius', normalizeCssValue('borderRadius', value));
    return this;
  }

  border(value: number | string): this {
    this.setProp('border', normalizeCssValue('border', value));
    return this;
  }

  borderBottom(value: string): this {
    this.setProp('borderBottom', value);
    return this;
  }

  /** Alias of `.boxShadow(...)` — full CSS `box-shadow` string or `0` → `none`. */
  shadow(value: number | string): this {
    this.setProp('boxShadow', normalizeCssValue('boxShadow', value));
    return this;
  }

  boxShadow(value: number | string): this {
    return this.shadow(value);
  }

  opacity(value: number): this {
    this.setProp('opacity', normalizeCssValue('opacity', value));
    return this;
  }

  /** Space after each row. */
  spacing(value: number | string): this {
    this.setProp('marginBottom', normalizeCssValue('marginBottom', value));
    return this;
  }

  css(property: string, value: string | number): this {
    const camel = property.includes('-')
      ? property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      : property;
    this.setProp(camel, normalizeCssValue(camel, value));
    return this;
  }

  style(extra: CSSProperties): this {
    this.mergeStyle(normalizeItemStyleObject(extra));
    return this;
  }
}

/** `itemStyle({ boxShadow: 0, padding: 14 })` → `{ boxShadow: 'none', padding: '14px' }`. */
export function normalizeItemStyleObject(style: CSSProperties): CSSProperties {
  const out: CSSProperties = {};
  const record = out as Record<string, string>;
  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined) continue;
    record[key] = normalizeCssValue(key, value);
  }
  return out;
}

/** Proxied builder: every CSS property is a method. */
export function createListItemStyleBuilder(): ListItemStyleBuilder & CssFluentProxy {
  const host = new ListItemStyleBuilder();
  return createCssFluentProxy(host) as ListItemStyleBuilder & CssFluentProxy;
}
