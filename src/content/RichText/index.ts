import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

export interface RichTextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

function spanStyle(span: RichTextSpan): CSSProperties {
  const style: CSSProperties = {};
  if (span.bold) style.fontWeight = 700;
  if (span.italic) style.fontStyle = 'italic';
  if (span.color) style.color = span.color;
  return style;
}

class RichTextBuilder extends FiboBuilder {
  private _spans: RichTextSpan[] = [];

  spans(value: RichTextSpan[]): this {
    this._spans = Array.isArray(value) ? value : [];
    return this;
  }

  build(): ReactElement {
    const children = this._spans.map((span, index) =>
      React.createElement(
        'span',
        { key: index, style: spanStyle(span) },
        typeof span.text === 'string' ? span.text : ''
      )
    );

    return React.createElement(
      'p',
      {
        className: `fibo-rich-text ${this.getClassName()}`.trim(),
        style: { margin: 0, ...this.getStyle() },
      },
      children
    );
  }
}

export const RichText = createBuilder(RichTextBuilder);
