'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { fiboCn as twMerge } from '../../core/cn';
import { BaseProps } from '../../core/types';
import { Signal } from '../../core/state';
import type { FieldRule } from '../Form/validators';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

const TEXT_INPUT_TYPES = new Set(['text', 'password', 'email', 'number', 'tel']);

/** Invalid `<input type>` (checkbox/submit/hidden/…) must not leak into a text field. */
function asHtmlInputType(value: unknown): string {
  return typeof value === 'string' && TEXT_INPUT_TYPES.has(value) ? value : 'text';
}

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

function clearIcon() {
  return React.createElement(
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
      'aria-hidden': true,
    },
    React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
    React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
  );
}

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
  const clearBtnRef = useRef<HTMLButtonElement>(null);
  const writingSignal = useRef(false);

  const {
    containerClass,
    containerStyle,
    fieldClass,
    label,
    error,
    helper,
    mask,
    type: rawType,
    value,
    controlled,
    rules,
    onChange,
    onCommit,
    leadingIcon,
    trailingIcon,
    clearable,
    bare,
    ...inputRest
  } = props;

  const helperId = helper
    ? inputRest.name
      ? `fibo-help-${inputRest.name}`
      : `fibo-help-${inputId}`
    : undefined;
  const errId = inputRest.name ? `fibo-err-${inputRest.name}` : `fibo-err-${inputId}`;

  const isSignal = value instanceof Signal;
  const readValue = (raw: string) => (mask ? applyMask(raw, mask) : raw);
  const initial = readValue(
    typeof value === 'string' ? value : isSignal ? (value as Signal<string>).value : ''
  );

  const setClearVisible = (on: boolean) => {
    const btn = clearBtnRef.current;
    if (btn) btn.style.display = on ? '' : 'none';
  };

  // Controlled path only — re-renders every key by design.
  const [controlledValue, setControlledValue] = useState(initial);
  useEffect(() => {
    if (!controlled) return;
    if (isSignal) {
      return (value as Signal<string>).subscribe((val: string) => {
        const next = readValue(val);
        setControlledValue(next);
        setClearVisible(next.length > 0);
      });
    }
    const next = readValue(typeof value === 'string' ? value : '');
    setControlledValue(next);
    setClearVisible(next.length > 0);
  }, [controlled, value, isSignal, mask]);

  // Uncontrolled + Signal: external writes patch the DOM, no React re-render.
  useEffect(() => {
    if (controlled || !isSignal) return;
    const signal = value as Signal<string>;
    return signal.subscribe((val: string) => {
      if (writingSignal.current) return;
      const el = inputRef.current;
      const next = readValue(val);
      if (el && el.value !== next) el.value = next;
      setClearVisible(next.length > 0);
    });
  }, [value, isSignal, controlled, mask]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (rules) {
      (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
    }
    const host = input.closest('.fibo-textfield-container') as HTMLElement | null;
    const span = host?.querySelector('.fibo-field-error') as HTMLElement | null;
    const helperSpan = host?.querySelector('.fibo-field-helper') as HTMLElement | null;
    if (host) {
      (host as unknown as { __fiboShowError?: (msg: string | null) => void }).__fiboShowError = (
        message
      ) => {
        if (span) {
          span.textContent = message ?? '';
          span.style.display = message ? '' : 'none';
        }
        if (helperSpan) {
          helperSpan.style.display = message || !helper ? 'none' : '';
        }
        if (message) {
          input.setAttribute('aria-invalid', 'true');
          input.setAttribute(
            'aria-describedby',
            helperId ? `${errId} ${helperId}` : errId
          );
        } else {
          input.removeAttribute('aria-invalid');
          if (helperId) input.setAttribute('aria-describedby', helperId);
          else input.removeAttribute('aria-describedby');
        }
      };
    }
  }, [rules, helper, helperId, errId]);

  const type = asHtmlInputType(rawType);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const disabled = Boolean(inputRest.disabled);
  const showClear = Boolean(clearable) && !disabled;
  const showEyeOrIcon = Boolean(trailingIcon || isPassword);

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

    setClearVisible(newValue.length > 0);
    onChange?.(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onCommit?.(readValue(e.target.value));
    inputRest.onBlur?.(e);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = inputRef.current;
    if (el) el.value = '';
    if (controlled) {
      setControlledValue('');
    }
    if (isSignal) {
      writingSignal.current = true;
      (value as Signal<string>).value = '';
      writingSignal.current = false;
    }
    setClearVisible(false);
    onChange?.('');
    el?.focus();
    el?.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const paddingLeft = bare ? 0 : leadingIcon ? '2.75rem' : '1rem';
  const trailCount = (showClear ? 1 : 0) + (showEyeOrIcon ? 1 : 0);
  const paddingRight = bare ? 0 : trailCount >= 2 ? '4.5rem' : trailCount === 1 ? '2.75rem' : '1rem';

  const inputProps: Record<string, unknown> = {
    key: 'input',
    ref: inputRef,
    id: inputId,
    className: bare
      ? 'fibo-textfield-input w-full bg-transparent outline-none'
      : 'fibo-textfield-input w-full h-full bg-transparent outline-none py-2.5 text-sm',
    style: bare
      ? { padding: 0, display: 'block', width: '100%', height: '1lh', lineHeight: 'inherit' }
      : { paddingLeft, paddingRight },
    ...inputRest,
    type: effectiveType,
    onChange: handleChange,
    onBlur: handleBlur,
  };
  if (
    isPassword &&
    inputProps.autoComplete == null &&
    inputProps.autocomplete == null
  ) {
    inputProps.autoComplete = 'current-password';
  }

  if (error) {
    inputProps['aria-invalid'] = true;
    inputProps['aria-describedby'] = errId;
  } else if (helperId) {
    inputProps['aria-describedby'] = helperId;
  }

  if (controlled) {
    inputProps.value = controlledValue;
  } else {
    inputProps.defaultValue = initial;
  }

  const passwordToggle = React.createElement(
    'button',
    {
      key: 'password-toggle',
      type: 'button',
      className: 'text-gray-400 hover:text-gray-600 focus:outline-none',
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onClick: () => {
        setShowPassword((v) => !v);
        inputRef.current?.focus();
      },
      tabIndex: -1,
      'aria-label': showPassword ? 'Hide password' : 'Show password',
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
  );

  const clearButton = showClear
    ? React.createElement(
        'button',
        {
          key: 'clear',
          ref: clearBtnRef,
          type: 'button',
          className: 'text-gray-400 hover:text-gray-600 focus:outline-none',
          style: { display: initial ? '' : 'none' },
          onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
          onClick: handleClear,
          tabIndex: -1,
          'aria-label': 'Clear',
        },
        clearIcon()
      )
    : null;

  return React.createElement(
    'div',
    { className: containerClass, style: containerStyle },
    React.createElement(
      'div',
      {
        className: fieldClass || 'relative w-full h-14 flex items-center',
        style: bare ? { display: 'block', width: '100%' } : undefined,
      },
      [
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
            // Absolute so the label never becomes a flex sibling (web theme
            // historically omitted this and labels spilled beside the input).
            style: {
              position: 'absolute',
              left: bare ? 0 : leadingIcon ? '2.75rem' : '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 2,
              margin: 0,
            },
          },
          label
        ),

      (showClear || showEyeOrIcon) &&
        React.createElement(
          'div',
          {
            key: 'trailing-icon',
            className:
              'absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center z-10 gap-1',
          },
          clearButton,
          isPassword ? passwordToggle : trailingIcon
        ),
    ]),
    helper
      ? React.createElement(
          'span',
          {
            id: helperId,
            className:
              'fibo-field-helper text-[var(--fibo-on-surface-variant,#9a9a9a)] text-xs mt-1 ml-1',
            style: { display: error ? 'none' : '' },
          },
          helper
        )
      : null,
    React.createElement(
      'span',
      {
        id: errId,
        className: 'fibo-field-error text-[var(--fibo-error,#b91c1c)] text-xs mt-1 ml-1',
        role: 'alert',
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
  private _helper?: string;
  private _rules?: FieldRule[];
  private _mask?: string;
  private _controlled = false;
  private _clearable = false;
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

  private bindMarked(val: string | undefined): void {
    if (!val || !hasInterpMarks(val)) return;
    for (const sig of collectInterpSignals(val)) {
      this.bindSignal(sig);
    }
  }

  label(val: string): this {
    this._label = val;
    this.bindMarked(val);
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    this.bindMarked(val);
    return this;
  }

  /** HTML `name` — required for `Form().onSubmit` FormData collection. */
  name(val: string): this {
    this._name = val;
    return this;
  }

  type(val: 'text' | 'password' | 'email' | 'number' | 'tel'): this {
    this._type = asHtmlInputType(val);
    return this;
  }

  /** Native `inputMode` — virtual keyboard hint. */
  inputMode(val: React.HTMLAttributes<HTMLInputElement>['inputMode']): this {
    this._props.inputMode = val;
    return this;
  }

  /** Native `enterKeyHint` — mobile action-key label. */
  enterKeyHint(val: React.HTMLAttributes<HTMLInputElement>['enterKeyHint']): this {
    this._props.enterKeyHint = val;
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
    this.bindMarked(val);
    return this;
  }

  /** Muted hint under the field. Hidden while `.error()` (or a painted Form error) is showing. */
  helper(text: string): this {
    this._helper = text;
    this.bindMarked(text);
    return this;
  }

  /** Trailing clear button while the input has a value. Hidden when empty or disabled. */
  clearable(enabled: boolean = true): this {
    this._clearable = enabled;
    return this;
  }

  /** Alias of `.clearable()`. */
  clear(enabled: boolean = true): this {
    return this.clearable(enabled);
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
    let fieldClasses = this.isReset()
      ? 'relative w-full flex items-center'
      : 'relative w-full h-14 flex items-center';

    if (!this.isReset()) {
      if (this._variant === 'outlined') {
        fieldClasses += ' border border-[var(--fibo-outline)] rounded-[4px] bg-transparent';
      } else {
        fieldClasses +=
          ' bg-[var(--fibo-surface-variant)] rounded-t-[4px] border-b border-[var(--fibo-outline)]';
      }
    }

    const containerClass = twMerge(
      'fibo-textfield-container w-full flex flex-col',
      ...this._classNames
    );

    const resolve = (text: string | undefined) =>
      text && hasInterpMarks(text) ? resolveInterpString(text) : text;

    const props = {
      containerClass,
      fieldClass: twMerge(fieldClasses, ...this._classNames.filter((name) => name.startsWith('fibo-'))),
      bare: this.isReset(),
      containerStyle: this.isReset()
        ? { height: 'fit-content', ...this.getStyle() }
        : this.getStyle(),
      label: resolve(this._label),
      error: resolve(this._error),
      helper: resolve(this._helper),
      leadingIcon: this._leadingIcon,
      trailingIcon: this._trailingIcon,
      clearable: this._clearable,
      value: this._value,
      controlled: this._controlled,
      placeholder: resolve(this._placeholder) || ' ',
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
  helper?: string;
  clearable?: boolean;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  mask?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>['enterKeyHint'];
}
