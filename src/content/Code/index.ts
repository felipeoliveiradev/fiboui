import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

class CodeBuilder extends FiboBuilder {
  private _source: string | (() => string) = '';
  private _label?: string;
  private _inline = false;
  private _language?: string;

  constructor(source: string | (() => string) = '') {
    super();
    this._source = source;
  }

  text(value: string | (() => string)): this {
    this._source = value;
    return this;
  }

  label(value: string): this {
    this._label = value;
    return this;
  }

  inline(enable: boolean = true): this {
    this._inline = enable;
    return this;
  }

  language(value: string): this {
    this._language = value;
    return this;
  }

  build(): ReactElement {
    const source = typeof this._source === 'function' ? this._source() : this._source;
    const className = this.getClassName();
    const style = this.getStyle();

    if (this._inline) {
      return React.createElement(
        'code',
        {
          className: ['fibo-code-inline', className].filter(Boolean).join(' '),
          style,
          ...this._props,
        },
        source
      );
    }

    const label = this._label
      ? React.createElement(
          'span',
          { key: 'label', className: 'fibo-code-label code-label' },
          this._label
        )
      : null;

    return React.createElement(
      'pre',
      {
        className: ['fibo-code', className].filter(Boolean).join(' '),
        style,
        tabIndex: 0,
        ...this._props,
      },
      label,
      React.createElement(
        'code',
        this._language ? { className: `language-${this._language}` } : null,
        source
      )
    );
  }
}

export const Code = createBuilder(CodeBuilder);

export interface CodeProps extends BaseProps {
  text?: string;
  label?: string;
  inline?: boolean;
  language?: string;
}
