import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

class SelectableTextBuilder extends FiboBuilder {
  private _text = '';

  constructor(text: string = '') {
    super();
    this._text = typeof text === 'string' ? text : '';
  }

  text(value: string): this {
    this._text = typeof value === 'string' ? value : '';
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'p',
      {
        className: `fibo-selectable-text ${this.getClassName()}`.trim(),
        style: {
          margin: 0,
          ...this.getStyle(),
          userSelect: 'text',
        },
      },
      this._text
    );
  }
}

export const SelectableText = createBuilder(SelectableTextBuilder);
