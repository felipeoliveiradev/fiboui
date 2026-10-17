'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface SecureFieldInnerProps {
  value?: string;
  placeholder?: string;
  reveal?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const SecureFieldInner = React.memo(function SecureFieldInner(props: SecureFieldInnerProps) {
  const [value, setValue] = useState(props.value ?? '');
  const [visible, setVisible] = useState(false);

  const input = React.createElement('input', {
    type: visible ? 'text' : 'password',
    className: 'fibo-secure-field-input',
    value,
    placeholder: props.placeholder,
    autoComplete: 'current-password',
    'aria-label': props.placeholder || 'Password',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      props.onChange?.(event.target.value);
    },
  });

  return React.createElement(
    'div',
    { className: props.className, style: props.style },
    input,
    props.reveal
      ? React.createElement(
          'button',
          {
            type: 'button',
            className: 'fibo-secure-field-reveal',
            'aria-label': visible ? 'Hide password' : 'Reveal password',
            'aria-pressed': visible ? 'true' : 'false',
            onClick: () => setVisible((current) => !current),
          },
          visible ? 'Hide' : 'Reveal'
        )
      : null
  );
});

class SecureFieldBuilder extends FiboBuilder {
  private _value = '';
  private _placeholder?: string;
  private _revealToggle = false;
  private _onChange?: (value: string) => void;

  value(text: string): this {
    this._value = text;
    return this;
  }

  placeholder(text: string): this {
    this._placeholder = text;
    return this;
  }

  /**
   * Boolean: password-visibility toggle (default on when called with no args).
   * String/object: FiboBuilder scroll-reveal preset.
   */
  reveal(
    preset: boolean | string | { preset?: string; once?: boolean; rootMargin?: string; threshold?: number } = true,
    options?: { once?: boolean; rootMargin?: string; threshold?: number }
  ): this {
    if (typeof preset === 'boolean') {
      this._revealToggle = preset;
      return this;
    }
    return super.reveal(preset, options);
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-secure-field', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(SecureFieldInner, {
      ...rest,
      className,
      style: this.getStyle(),
      value: this._value,
      placeholder: this._placeholder,
      reveal: this._revealToggle,
      onChange: this._onChange,
    });
  }
}

export const SecureField = createBuilder(SecureFieldBuilder);

export interface SecureFieldProps extends BaseProps {
  value?: string;
  placeholder?: string;
  reveal?: boolean;
  onChange?: (value: string) => void;
}
