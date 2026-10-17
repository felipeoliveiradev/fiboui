import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

export type NumericTextFormat = (n: number) => string;

interface NumericTextViewProps {
  value: number;
  format?: NumericTextFormat;
  className?: string;
  style?: CSSProperties;
}

function displayNumber(value: number, format?: NumericTextFormat): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  if (typeof format === 'function') {
    const formatted = format(n);
    return formatted == null ? '' : String(formatted);
  }
  return String(n);
}

/**
 * Reads `value` (and `format`) on every render so a later render shows the
 * latest number. Animation is intentionally omitted.
 */
const NumericTextView = (props: NumericTextViewProps) => {
  const { value, format, className, style } = props;
  return React.createElement(
    'span',
    {
      className: ['fibo-numeric-text', className].filter(Boolean).join(' '),
      style,
    },
    displayNumber(value, format)
  );
};

class NumericTextBuilder extends FiboBuilder {
  private _value = 0;
  private _format?: NumericTextFormat;

  value(n: number): this {
    this._value = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return this;
  }

  /** Map the current number to the string painted in the DOM. */
  format(fn: NumericTextFormat): this {
    this._format = fn;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(NumericTextView, {
      value: this._value,
      format: this._format,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const NumericText = createBuilder(NumericTextBuilder);

export interface NumericTextProps extends BaseProps {
  value?: number;
  format?: NumericTextFormat;
}
