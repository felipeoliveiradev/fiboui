import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, TextType } from '../../core/types';
import { FineGrainText } from '../../core/FineGrain';
import type { BindableSignal } from '../../core/state';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

/**
 * Theme-aware defaults: CSS vars from `.theme()` / `fibo-theme-*` (SwiftUI Environment /
 * Flutter TextTheme). Fallbacks keep text readable with no theme mounted.
 */
export const TEXT_VARIANT_STYLE: Record<TextType, CSSProperties> = {
  h1: {
    fontSize: 'var(--fibo-text-h1-size, 2.25rem)',
    fontWeight: 'var(--fibo-text-h1-weight, 700)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h1-tracking, -0.025em)',
    lineHeight: 'var(--fibo-text-h1-height, 1.2)',
    color: 'var(--fibo-text-h1-color, inherit)',
  },
  h2: {
    fontSize: 'var(--fibo-text-h2-size, 1.875rem)',
    fontWeight: 'var(--fibo-text-h2-weight, 700)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h2-tracking, -0.025em)',
    lineHeight: 'var(--fibo-text-h2-height, 1.25)',
    color: 'var(--fibo-text-h2-color, inherit)',
  },
  h3: {
    fontSize: 'var(--fibo-text-h3-size, 1.5rem)',
    fontWeight: 'var(--fibo-text-h3-weight, 600)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h3-tracking, -0.02em)',
    lineHeight: 'var(--fibo-text-h3-height, 1.3)',
    color: 'var(--fibo-text-h3-color, inherit)',
  },
  h4: {
    fontSize: 'var(--fibo-text-h4-size, 1.25rem)',
    fontWeight: 'var(--fibo-text-h4-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h4-height, 1.35)',
    color: 'var(--fibo-text-h4-color, inherit)',
  },
  h5: {
    fontSize: 'var(--fibo-text-h5-size, 1.125rem)',
    fontWeight: 'var(--fibo-text-h5-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h5-height, 1.4)',
    color: 'var(--fibo-text-h5-color, inherit)',
  },
  h6: {
    fontSize: 'var(--fibo-text-h6-size, 1rem)',
    fontWeight: 'var(--fibo-text-h6-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h6-height, 1.45)',
    color: 'var(--fibo-text-h6-color, inherit)',
  },
  body: {
    fontSize: 'var(--fibo-text-body-size, 1rem)',
    fontWeight: 'var(--fibo-text-body-weight, 400)' as unknown as number,
    lineHeight: 'var(--fibo-text-body-height, 1.5)',
    color: 'var(--fibo-text-body-color, inherit)',
  },
  caption: {
    fontSize: 'var(--fibo-text-caption-size, 0.875rem)',
    fontWeight: 'var(--fibo-text-caption-weight, 400)' as unknown as number,
    lineHeight: 'var(--fibo-text-caption-height, 1.4)',
    color: 'var(--fibo-text-caption-color, inherit)',
  },
  label: {
    fontSize: 'var(--fibo-text-label-size, 0.875rem)',
    fontWeight: 'var(--fibo-text-label-weight, 500)' as unknown as number,
    letterSpacing: 'var(--fibo-text-label-tracking, 0.01em)',
    lineHeight: 'var(--fibo-text-label-height, 1.4)',
    color: 'var(--fibo-text-label-color, inherit)',
  },
};

function textStyle(type: TextType, extra?: CSSProperties): CSSProperties {
  return {
    margin: 0,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    maxWidth: '100%',
    ...TEXT_VARIANT_STYLE[type],
    ...extra,
  };
}

const TextInner = React.memo((props: any) => {
  const { text, type, className, style, ...rest } = props;

  const elementMap: Record<TextType, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    caption: 'span',
    label: 'label',
  };

  return React.createElement(
    elementMap[type as TextType],
    {
      className: `fibo-text fibo-text-${type} min-w-0 ${className}`,
      style: textStyle(type as TextType, style),
      ...rest,
    },
    text
  );
});

class TextBuilder extends FiboBuilder {
  private _text: string | (() => string) = '';
  private _type: TextType = 'body';

  constructor(text: string | (() => string) = '') {
    super();
    this.text(text);
  }

  text(value: string | (() => string)): this {
    if (typeof value === 'string' && hasInterpMarks(value)) {
      // Auto-bind markers from `$length` / `interp()`; extra `.bindSignal(x)` still OK.
      this._text = () => resolveInterpString(value);
      for (const sig of collectInterpSignals(value)) {
        super.bindSignal(sig);
      }
      return this;
    }
    this._text = value;
    return this;
  }

  type(type: TextType): this {
    this._type = type;
    return this;
  }

  variant(variant: TextType): this {
    this._type = variant;
    return this;
  }

  nowrap(): this {
    this._classNames.push('whitespace-nowrap');
    return this;
  }

  mono(): this {
    this._classNames.push('font-mono');
    return this;
  }

  muted(): this {
    this._style = { ...this._style, color: '#9a9a9a' };
    return this;
  }

  /**
   * Subscribe an extra signal (or override text with `format`).
   * `$length` / `interp()` already auto-bind their own signals.
   *
   * ```ts
   * Text(`Total: ${todos.$length}`).bindSignal(filter) // also rebuild when filter changes
   * Text().bindSignal(todos, (list) => `Total: ${list.length}`)
   * ```
   */
  bindSignal<T>(
    signal: BindableSignal<T>,
    format?: (value: T) => string
  ): this {
    super.bindSignal(signal);
    if (format) {
      this._text = () => format(signal.value);
    }
    return this;
  }

  build(): ReactElement {
    const elementMap: Record<TextType, keyof HTMLElementTagNameMap> = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      body: 'p',
      caption: 'span',
      label: 'label',
    };

    if (typeof this._text === 'function') {
      const compute = this._text;
      return React.createElement(FineGrainText, {
        compute,
        as: elementMap[this._type],
        className: `fibo-text fibo-text-${this._type} min-w-0 ${this.getClassName()}`,
        style: textStyle(this._type, this.getStyle()),
        ...this._props
      });
    }

    const props = {
      text: this._text,
      type: this._type,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props
    };
    return React.createElement(TextInner, props);
  }
}

export const Text = createBuilder(TextBuilder);

export interface TextProps extends BaseProps {
  text: string;
  type?: TextType;
  variant?: TextType;
}
