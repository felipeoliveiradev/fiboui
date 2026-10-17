'use client';

import React, { ReactElement, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface OtpFieldInnerProps {
  length: number;
  onChange?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function digitOnly(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length > 0 ? digits.charAt(0) : '';
}

const OtpFieldInner = React.memo(function OtpFieldInner(props: OtpFieldInnerProps) {
  const length = props.length;
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digitsRef = useRef<string[]>(Array.from({ length }, () => ''));
  const [, setVersion] = useState(0);

  const commit = (index: number, raw: string) => {
    const digit = digitOnly(raw);
    const next = digitsRef.current.slice();
    next[index] = digit;
    digitsRef.current = next;
    setVersion((version) => version + 1);
    props.onChange?.(next.join(''));
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const inputs = Array.from({ length }, (_, index) =>
    React.createElement('input', {
      key: index,
      ref: (node: HTMLInputElement | null) => {
        refs.current[index] = node;
      },
      type: 'text',
      inputMode: 'numeric',
      maxLength: 1,
      autoComplete: index === 0 ? 'one-time-code' : 'off',
      className: 'fibo-otp-field-input',
      'aria-label': `Digit ${index + 1}`,
      value: digitsRef.current[index] ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        commit(index, event.target.value);
      },
    })
  );

  return React.createElement(
    'div',
    {
      className: props.className,
      style: props.style,
      role: 'group',
      'aria-label': 'One-time code',
    },
    ...inputs
  );
});

class OtpFieldBuilder extends FiboBuilder {
  private _length = 4;
  private _onChange?: (code: string) => void;

  length(count: number): this {
    this._length = count;
    return this;
  }

  onChange(handler: (code: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, style: extraStyle, ...rest } = this._props;
    const className = ['fibo-otp-field', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(OtpFieldInner, {
      ...rest,
      className,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      length: this._length,
      onChange: this._onChange,
    });
  }
}

export const OtpField = createBuilder(OtpFieldBuilder);

export interface OtpFieldProps extends BaseProps {
  length?: number;
  onChange?: (code: string) => void;
}
