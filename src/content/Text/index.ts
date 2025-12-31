import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, TextType } from '../../core/types';

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
        style,
        ...rest,
      },
      text
    );
});

class TextBuilder extends FiboBuilder {
  private _text: string = '';
  private _type: TextType = 'body';

  constructor(text: string = '') {
    super();
    this._text = text;
  }

  text(value: string): this {
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

  build(): ReactElement {
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
