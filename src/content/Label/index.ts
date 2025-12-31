import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const LabelInner = React.memo((props: any) => {
    const { text, htmlFor, required, className, style, ...rest } = props;
    
    return React.createElement(
      'label',
      {
        className: `fibo-label text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`,
        htmlFor: htmlFor,
        style: style,
        ...rest,
      },
      text,
      required && React.createElement('span', { className: 'text-red-500 ml-0.5' }, '*')
    );
});

class LabelBuilder extends FiboBuilder {
  private _text: string = '';
  private _htmlFor?: string;
  private _required: boolean = false;

  constructor(text: string = '') {
    super();
    this._text = text;
  }

  text(value: string): this {
    this._text = value;
    return this;
  }

  htmlFor(id: string): this {
    this._htmlFor = id;
    return this;
  }

  required(val: boolean = true): this {
    this._required = val;
    return this;
  }

  build(): ReactElement {
    const props = {
        text: this._text,
        htmlFor: this._htmlFor,
        required: this._required,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    return React.createElement(LabelInner, props);
  }
}


export const Label = createBuilder(LabelBuilder);

export interface LabelProps extends BaseProps {
  text: string;
  htmlFor?: string;
  required?: boolean;
}
