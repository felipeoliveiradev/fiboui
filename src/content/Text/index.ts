import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, TextType } from '../../core/types';
import { FineGrainText } from '../../core/FineGrain';

/** Default rem scale so `.variant('h1')` is visible without a theme class or Tailwind preflight. */
export const TEXT_VARIANT_STYLE: Record<TextType, CSSProperties> = {
  h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
  h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
  h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
  h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.45 },
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.4 },
  label: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 },
};

function textStyle(type: TextType, extra?: CSSProperties): CSSProperties {
  return { margin: 0, ...TEXT_VARIANT_STYLE[type], ...extra };
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
      className: `fibo-text fibo-text-${type} ${className}`,
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
        className: `fibo-text fibo-text-${this._type} ${this.getClassName()}`,
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
