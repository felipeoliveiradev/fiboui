import type { CSSProperties } from 'react';
import {
  CssStyleStore,
  createCssFluentProxy,
  kebabToCamel,
  normalizeCssValue,
  type CssFluentProxy,
} from '../../core/cssFluent';

/**
 * Pseudo-state styles for list rows (:hover / :active / :focus).
 * Full CSS3 via Proxy — same surface as `itemStyle`.
 */
export class ListItemPseudoStateBuilder extends CssStyleStore {
  bg(color: string): this {
    this.setProp('backgroundColor', color);
    return this;
  }

  color(value: string): this {
    this.setProp('color', value);
    return this;
  }

  opacity(value: number): this {
    this.setProp('opacity', normalizeCssValue('opacity', value));
    return this;
  }

  borderColor(value: string): this {
    this.setProp('borderColor', value);
    return this;
  }

  transform(value: string): this {
    this.setProp('transform', value);
    return this;
  }

  scale(value: number): this {
    this.setProp('transform', `scale(${value})`);
    return this;
  }

  translateX(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.setProp('transform', `translateX(${finalValue})`);
    return this;
  }

  translateY(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.setProp('transform', `translateY(${finalValue})`);
    return this;
  }

  shadow(value: number | string): this {
    this.setProp('boxShadow', normalizeCssValue('boxShadow', value));
    return this;
  }

  boxShadow(value: number | string): this {
    return this.shadow(value);
  }

  css(styles: CSSProperties): this;
  css(property: string, value: string | number): this;
  css(propertyOrStyles: string | CSSProperties, value?: string | number): this {
    if (typeof propertyOrStyles === 'object' && propertyOrStyles !== null) {
      for (const [key, raw] of Object.entries(propertyOrStyles)) {
        if (raw === undefined || raw === null) continue;
        const camel = key.startsWith('--')
          ? key
          : key.includes('-')
            ? kebabToCamel(key)
            : key;
        this.setProp(camel, normalizeCssValue(camel, raw));
      }
      return this;
    }
    const property = propertyOrStyles;
    const camel = property.includes('-') ? kebabToCamel(property) : property;
    this.setProp(camel, normalizeCssValue(camel, value as string | number));
    return this;
  }
}

export function createListItemPseudoStateBuilder(): ListItemPseudoStateBuilder & CssFluentProxy {
  const host = new ListItemPseudoStateBuilder();
  return createCssFluentProxy(host) as ListItemPseudoStateBuilder & CssFluentProxy;
}
