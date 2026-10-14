import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, TextType } from '../../core/types';
import { FineGrainText } from '../../core/FineGrain';

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
      style: { margin: 0, ...style },
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

  h1(): this {
    return this.variant('h1');
  }

  h2(): this {
    return this.variant('h2');
  }

  h3(): this {
    return this.variant('h3');
  }

  h4(): this {
    return this.variant('h4');
  }

  h5(): this {
    return this.variant('h5');
  }

  h6(): this {
    return this.variant('h6');
  }

  span(): this {
    return this.variant('caption');
  }

  /** Preserve `\\n` as visual line breaks (`white-space: pre-line`). */
  preLine(): this {
    this._style = { ...this._style, whiteSpace: 'pre-line' };
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
        style: { margin: 0, ...this.getStyle() },
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
