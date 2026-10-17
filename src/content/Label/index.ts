import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
}

const LabelInner = React.memo((props: any) => {
    const { text, htmlFor, required, className, style, ...rest } = props;
    const hostClass = [
      'fibo-label',
      'fibo-text-label',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return React.createElement(
      'label',
      {
        ...rest,
        className: hostClass,
        htmlFor: htmlFor,
        style: style,
      },
      text,
      required && React.createElement('span', { className: 'text-red-500 ml-0.5', 'aria-hidden': true }, '*')
    );
});

class LabelBuilder extends FiboBuilder {
  private _text: string = '';
  private _htmlFor?: string;
  private _required: boolean = false;

  constructor(text: string = '') {
    super();
    this.text(text);
  }

  text(value: string): this {
    this._text = value;
    bindInterp(this, value);
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
        text: resolveInterp(this._text),
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
