'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';
import { Signal } from '../../core/state';
import type { FieldRule } from '../Form/validators';

const applyMask = (value: string, mask: string) => {
  let i = 0;
  const valueChars = value.replace(/\D/g, '').split('');
  let output = '';

  for (let m = 0; m < mask.length; m++) {
    if (i >= valueChars.length) break;

    if (mask[m] === '9') {
      output += valueChars[i++];
    } else {
      output += mask[m];
    }
  }
  return output;
};

/**
 * Uncontrolled by default — the DOM owns the text, so typing does not
 * re-render React. Signal / onChange sync without setState.
 * Opt into controlled mode with `.controlled(true)` when you need React to own value.
 */
const TextFieldInner = React.memo((props: any) => {
  const uniqueId = React.useId();
  const inputId = props.id || uniqueId;
  const [showPassword, setShowPassword] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const writingSignal = useRef(false);

  const {
    containerClass,
    containerStyle,
    label,
    error,
    mask,
    type,
    value,
    controlled,
    rules,
    onChange,
    onCommit,
    leadingIcon,
    trailingIcon,
    ...inputRest
  } = props;

  const isSignal = value instanceof Signal;
  const initial =
    typeof value === 'string' ? value : isSignal ? (value as Signal<string>).value : '';

  // Controlled path only — re-renders every key by design.
  const [controlledValue, setControlledValue] = useState(initial);
  useEffect(() => {
    if (!controlled) return;
    if (isSignal) {
      return (value as Signal<string>).subscribe(setControlledValue);
    }
    setControlledValue(typeof value === 'string' ? value : '');
  }, [controlled, value, isSignal]);

  // Uncontrolled + Signal: external writes patch the DOM, no React re-render.
  useEffect(() => {
    if (controlled || !isSignal) return;
    const signal = value as Signal<string>;
    return signal.subscribe((val: string) => {
      if (writingSignal.current) return;
      const el = inputRef.current;
      if (el && el.value !== val) el.value = val;
    });
  }, [value, isSignal, controlled]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (rules) {
      (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
    }
    const host = input.closest('.fibo-textfield-container') as HTMLElement | null;
    const span = host?.querySelector('.fibo-field-error') as HTMLElement | null;
    if (host) {
      (host as unknown as { __fiboShowError?: (msg: string | null) => void }).__fiboShowError = (
        message
      ) => {
        if (!span) return;
        span.textContent = message ?? '';
        span.style.display = message ? '' : 'none';
      };
    }
  }, [rules]);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  const readValue = (raw: string) => (mask ? applyMask(raw, mask) : raw);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = readValue(e.target.value);
    if (mask && e.target.value !== newValue) {
      e.target.value = newValue;
    }

    if (controlled) {
      setControlledValue(newValue);
    }

    if (isSignal) {
      writingSignal.current = true;
      (value as Signal<string>).value = newValue;
      writingSignal.current = false;
    }

    onChange?.(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onCommit?.(readValue(e.target.value));
    inputRest.onBlur?.(e);
  };

  const paddingLeft = leadingIcon ? '2.75rem' : '1rem';
  const paddingRight = trailingIcon || isPassword ? '2.75rem' : '1rem';

  const inputProps: Record<string, unknown> = {
    key: 'input',
    ref: inputRef,
    id: inputId,
    className: 'fibo-textfield-input w-full h-full bg-transparent outline-none py-2.5 text-sm',
    style: { paddingLeft, paddingRight },
    type: effectiveType,
    onChange: handleChange,
    onBlur: handleBlur,
    ...inputRest,
  };

  if (controlled) {
    inputProps.value = controlledValue;
  } else {
    inputProps.defaultValue = initial;
  }

  return React.createElement(
    'div',
    { className: containerClass, style: containerStyle },
    React.createElement('div', { className: 'relative w-full h-full flex items-center' }, [
      leadingIcon &&
        React.createElement(
          'div',
          {
            key: 'leading-icon',
            className:
              'absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none z-10',
          },
          leadingIcon
        ),

      React.createElement('input', inputProps),

      label &&
        React.createElement(
          'label',
          {
            key: 'label',
            htmlFor: inputId,
            className: 'fibo-textfield-label',
            style: { left: leadingIcon ? '2.75rem' : '1rem' },
          },
          label
        ),

      (trailingIcon || isPassword) &&
        React.createElement(
          'div',
          {
            key: 'trailing-icon',
            className:
              'absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center z-10',
          },
          isPassword
            ? React.createElement(
                'button',
                {
                  type: 'button',
                  className: 'text-gray-400 hover:text-gray-600 focus:outline-none',
                  onClick: () => setShowPassword(!showPassword),
                  tabIndex: -1,
                },
                showPassword
                  ? React.createElement(
                      'svg',
                      {
                        width: 16,
                        height: 16,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      },
                      React.createElement('path', {
                        d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24',
                      }),
                      React.createElement('line', { x1: 1, y1: 1, x2: 23, y2: 23 })
                    )
                  : React.createElement(
                      'svg',
                      {
                        width: 16,
                        height: 16,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      },
                      React.createElement('path', {
                        d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
                      }),
                      React.createElement('circle', { cx: 12, cy: 12, r: 3 })
                    )
              )
            : trailingIcon
        ),
    ]),
    React.createElement(
      'span',
      {
        id: props.name ? `fibo-err-${props.name}` : undefined,
        className: 'fibo-field-error text-[var(--fibo-error,#b91c1c)] text-xs mt-1 ml-1',
        style: { display: error ? '' : 'none' },
      },
      error || ''
    )
  );
});

class TextFieldBuilder extends FiboBuilder {
  private _value: string | Signal<string> = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _type: string = 'text';
  private _name?: string;
  private _disabled: boolean = false;
  private _error?: string;
  private _rules?: FieldRule[];
  private _mask?: string;
  private _controlled = false;
  private _onChange?: (value: string) => void;
  /** Fires on blur — prefer this over onChange to avoid work per keystroke. */
  private _onCommit?: (value: string) => void;
  private _leadingIcon?: React.ReactNode;
  private _trailingIcon?: React.ReactNode;

  constructor(value: string = '') {
    super();
    this._value = value;
  }

  value(val: string | Signal<string>): this {
    this._value = val;
    return this;
  }

  /**
   * Force controlled React `value` (re-renders every key). Default is uncontrolled.
   * Prefer `.value(signal)` + read signal when needed, or `.onCommit`.
   */
  controlled(enabled: boolean = true): this {
    this._controlled = enabled;
    return this;
  }

  label(val: string): this {
    this._label = val;
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    return this;
  }

  /** HTML `name` — required for `Form().onSubmit` FormData collection. */
  name(val: string): this {
    this._name = val;
    return this;
  }

  type(val: 'text' | 'password' | 'email' | 'number' | 'tel'): this {
    this._type = val;
    return this;
  }

  mask(format: string): this {
    this._mask = format;
    return this;
  }

  disabled(val: boolean = true): this {
    this._disabled = val;
    return this;
  }

  error(val: string): this {
    this._error = val;
    return this;
  }

  /** Rules collected by `Form` on submit (this field's own checks). */
  rules(...items: FieldRule[]): this {
    this._rules = items;
    return this;
  }

  /** Per-keystroke callback — does not re-render the field by itself. */
  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  /** Fires when the field loses focus — use for validation / form sync. */
  onCommit(handler: (value: string) => void): this {
    this._onCommit = handler;
    return this;
  }

  leadingIcon(icon: React.ReactNode): this {
    this._leadingIcon = icon;
    return this;
  }

  trailingIcon(icon: React.ReactNode): this {
    this._trailingIcon = icon;
    return this;
  }

  private _variant: 'filled' | 'outlined' = 'filled';

  variant(val: 'filled' | 'outlined'): this {
    this._variant = val;
    return this;
  }

  build(): ReactElement {
    let baseClasses = 'fibo-textfield-container w-full h-14 relative';

    if (this._variant === 'outlined') {
      baseClasses += ' border border-[var(--fibo-outline)] rounded-[4px] bg-transparent';
    } else {
      baseClasses +=
        ' bg-[var(--fibo-surface-variant)] rounded-t-[4px] border-b border-[var(--fibo-outline)]';
    }

    const containerClass = twMerge(baseClasses, ...this._classNames);

    const props = {
      containerClass,
      containerStyle: this.getStyle(),
      label: this._label,
      error: this._error,
      leadingIcon: this._leadingIcon,
      trailingIcon: this._trailingIcon,
      value: this._value,
      controlled: this._controlled,
      placeholder: this._placeholder || ' ',
      type: this._type,
      name: this._name,
      mask: this._mask,
      rules: this._rules,
      disabled: this._disabled,
      onChange: this._onChange,
      onCommit: this._onCommit,
      ...this._props,
    };

    return React.createElement(TextFieldInner, props);
  }
}

export const TextField = createBuilder(TextFieldBuilder);

export interface TextFieldProps extends BaseProps {
  value: string | Signal<string>;
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  mask?: string;
}
