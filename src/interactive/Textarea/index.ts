'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';
import { Signal } from '../../core/state';
import type { FieldRule } from '../Form/validators';

/**
 * Uncontrolled by default — the DOM owns the text, so typing does not
 * re-render React. Signal / onChange sync without setState.
 * Opt into controlled mode with `.controlled(true)` when you need React to own value.
 */
const TextareaInner = React.memo((props: any) => {
  const uniqueId = React.useId();
  const inputId = props.id || uniqueId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const writingSignal = useRef(false);

  const {
    containerClass,
    containerStyle,
    label,
    error,
    value,
    controlled,
    rules,
    onChange,
    onCommit,
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
      const el = textareaRef.current;
      if (el && el.value !== val) el.value = val;
    });
  }, [value, isSignal, controlled]);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (rules) {
      (textarea as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
    }
    const host = textarea.closest('.fibo-textarea-container') as HTMLElement | null;
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

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

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onCommit?.(e.target.value);
    inputRest.onBlur?.(e);
  };

  const textareaProps: Record<string, unknown> = {
    key: 'textarea',
    ref: textareaRef,
    id: inputId,
    className: 'fibo-textarea-input w-full p-4 text-base bg-transparent outline-none relative z-10',
    onChange: handleChange,
    onBlur: handleBlur,
    ...inputRest,
  };

  if (controlled) {
    textareaProps.value = controlledValue;
  } else {
    textareaProps.defaultValue = initial;
  }

  return React.createElement(
    'div',
    { className: containerClass, style: containerStyle },
    React.createElement('textarea', textareaProps),
    label &&
      React.createElement(
        'label',
        {
          key: 'label',
          htmlFor: inputId,
          className: 'fibo-textarea-label',
        },
        label
      ),
    React.createElement(
      'span',
      {
        className: 'fibo-field-error text-[var(--fibo-error,#b91c1c)] text-xs mt-1 ml-1',
        role: 'alert',
        style: { display: error ? '' : 'none' },
      },
      error || ''
    )
  );
});

class TextareaBuilder extends FiboBuilder {
  private _value: string | Signal<string> = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _name?: string;
  private _disabled: boolean = false;
  private _rows: number = 4;
  private _error?: string;
  private _rules?: FieldRule[];
  private _controlled = false;
  private _resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';
  private _onChange?: (value: string) => void;
  /** Fires on blur — prefer this over onChange to avoid work per keystroke. */
  private _onCommit?: (value: string) => void;

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

  disabled(val: boolean = true): this {
    this._disabled = val;
    return this;
  }

  rows(val: number): this {
    this._rows = val;
    return this;
  }

  resize(val: 'none' | 'vertical' | 'horizontal' | 'both'): this {
    this._resize = val;
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

  build(): ReactElement {
    const containerClass = twMerge('fibo-textarea-container w-full', ...this._classNames);

    const props = {
      containerClass,
      containerStyle: this.getStyle(),
      label: this._label,
      error: this._error,
      rows: this._rows,
      value: this._value,
      controlled: this._controlled,
      name: this._name,
      placeholder: this._placeholder || ' ',
      disabled: this._disabled,
      rules: this._rules,
      style: { resize: this._resize },
      onChange: this._onChange,
      onCommit: this._onCommit,
      ...this._props,
    };

    return React.createElement(TextareaInner, props);
  }
}

export const Textarea = createBuilder(TextareaBuilder);

export interface TextareaProps extends BaseProps {
  value: string | Signal<string>;
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  rows?: number;
}
