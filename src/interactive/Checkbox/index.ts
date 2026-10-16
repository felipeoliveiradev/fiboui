'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { twMerge } from 'tailwind-merge';
import type { FieldRule } from '../Form/validators';

interface CheckboxInnerProps {
  checked?: boolean;
  controlled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
  rules?: FieldRule[];
  error?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

/**
 * Uncontrolled by default — DOM owns checked (`defaultChecked` + local visual state).
 * Opt into `.controlled(true)` when the parent must drive `checked`.
 */
const CheckboxInner = React.memo((props: CheckboxInnerProps) => {
  const {
    checked = false,
    controlled = false,
    onChange,
    label,
    disabled,
    indeterminate,
    name,
    value = 'on',
    rules,
    error,
    className,
    style,
    id,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const initialChecked = checked;
  const [localChecked, setLocalChecked] = useState(initialChecked);
  const isChecked = controlled ? !!checked : localChecked;
  const isCheckedOrIndeterminate = isChecked || indeterminate;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  // Uncontrolled: keep visual in sync when Form.reset / Form.set patches the DOM.
  useEffect(() => {
    if (controlled) return;
    const input = inputRef.current;
    if (!input) return;

    const syncFromDom = () => setLocalChecked(input.checked);
    const onFormReset = () => {
      requestAnimationFrame(syncFromDom);
    };

    input.addEventListener('fibo-sync', syncFromDom);
    const form = input.closest('form');
    form?.addEventListener('reset', onFormReset);
    return () => {
      input.removeEventListener('fibo-sync', syncFromDom);
      form?.removeEventListener('reset', onFormReset);
    };
  }, [controlled]);

  useEffect(() => {
    const input = inputRef.current;
    const host = hostRef.current;
    if (!input) return;
    if (rules) {
      (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const next = e.target.checked;
    if (!controlled) setLocalChecked(next);
    onChange?.(next);
  };

  let icon = null;
  if (indeterminate) {
    icon = React.createElement('div', { className: 'w-[10px] h-[2px] bg-white rounded-[1px]' });
  } else if (isChecked) {
    icon = React.createElement(
      'svg',
      {
        width: '12',
        height: '12',
        viewBox: '0 0 12 12',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': true,
      },
      React.createElement('path', {
        d: 'M10 3L4.5 8.5L2 6',
        stroke: 'white',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    );
  }

  const inputProps: Record<string, unknown> = {
    ref: inputRef,
    id,
    type: 'checkbox',
    name,
    value,
    disabled,
    className: 'sr-only',
    onChange: handleChange,
  };
  if (controlled) {
    inputProps.checked = !!checked;
  } else {
    inputProps.defaultChecked = initialChecked;
  }

  return React.createElement(
    'div',
    {
      ref: hostRef,
      className: twMerge('fibo-checkbox-container', className),
    },
    React.createElement(
      'label',
      {
        className: 'fibo-checkbox flex items-center gap-2',
      },
      React.createElement(
        'div',
        {
          className: twMerge(
            'fibo-checkbox-box w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            isCheckedOrIndeterminate
              ? 'border-transparent bg-[var(--fibo-primary,#3B82F6)]'
              : 'border-gray-300 bg-transparent'
          ),
          style,
          'aria-hidden': true,
        },
        icon
      ),
      label &&
        React.createElement('span', { className: 'text-sm text-gray-700 select-none' }, label),
      React.createElement('input', inputProps)
    ),
    React.createElement(
      'span',
      {
        className: 'fibo-field-error text-[var(--fibo-error,#b91c1c)] text-xs mt-1 ml-1',
        style: { display: error ? '' : 'none' },
      },
      error || ''
    )
  );
});

class CheckboxBuilder extends FiboBuilder {
  private _checked: boolean = false;
  private _controlled = false;
  private _onChange?: (checked: boolean) => void;
  private _label?: string;
  private _disabled: boolean = false;
  private _indeterminate: boolean = false;
  private _name?: string;
  private _value: string = 'on';
  private _rules?: FieldRule[];
  private _error?: string;

  checked(value: boolean): this {
    this._checked = value;
    return this;
  }

  /**
   * Force controlled React `checked` (parent must setState). Default is uncontrolled.
   */
  controlled(enabled: boolean = true): this {
    this._controlled = enabled;
    return this;
  }

  /** HTML `name` — required for `Form` FormData collection. */
  name(val: string): this {
    this._name = val;
    return this;
  }

  /** Submit value when checked (HTML checkbox `value`, default `'on'`). */
  value(val: string): this {
    this._value = val;
    return this;
  }

  indeterminate(value: boolean): this {
    this._indeterminate = value;
    return this;
  }

  onChange(handler: (checked: boolean) => void): this {
    this._onChange = handler;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
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

  build(): ReactElement {
    const props: CheckboxInnerProps = {
      checked: this._checked,
      controlled: this._controlled,
      onChange: this._onChange,
      label: this._label,
      disabled: this._disabled,
      indeterminate: this._indeterminate,
      name: this._name,
      value: this._value,
      rules: this._rules,
      error: this._error,
      className: this.getClassName(),
      style: this.getStyle(),
      ...(this._props as CheckboxInnerProps),
    };
    return React.createElement(CheckboxInner, props);
  }
}

export const Checkbox = createBuilder(CheckboxBuilder);

export interface CheckboxProps extends BaseProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
}
