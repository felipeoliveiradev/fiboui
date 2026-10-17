'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { twMerge } from 'tailwind-merge';
import type { FieldRule } from '../Form/validators';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
}

const TOGGLE_FOCUS_RING =
  'group-focus-within:ring-2 group-focus-within:ring-offset-2 group-focus-within:ring-[var(--fibo-primary,#3B82F6)] group-has-[:focus-visible]:ring-2';

interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

const RADIO_MOVE_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']);

function escapeAttr(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/"/g, '\\"');
}

function moveRadioValue(options: RadioOption[], selected: string, key: string): string | null {
  const enabled = options.filter((o) => !o.disabled);
  if (enabled.length === 0) return null;
  if (key === 'Home') return enabled[0].value;
  if (key === 'End') return enabled[enabled.length - 1].value;
  const delta = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1;
  const idx = enabled.findIndex((o) => o.value === selected);
  if (idx === -1) {
    return delta > 0 ? enabled[0].value : enabled[enabled.length - 1].value;
  }
  return enabled[(idx + delta + enabled.length) % enabled.length].value;
}

interface RadioGroupInnerProps {
  value?: string;
  controlled?: boolean;
  options?: RadioOption[];
  onChange?: (value: string) => void;
  name?: string;
  direction?: 'vertical' | 'horizontal';
  rules?: FieldRule[];
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Uncontrolled by default — DOM owns selection (`defaultChecked` + local visual state).
 * Opt into `.controlled(true)` when the parent must drive `value`.
 * Only `.name()` groups submit; omitted name stays out of FormData.
 */
const RadioGroupInner = React.memo((props: RadioGroupInnerProps) => {
  const {
    value = '',
    controlled = false,
    options = [],
    onChange,
    name,
    direction,
    rules,
    error,
    className,
    style,
  } = props;

  const groupRef = useRef<HTMLDivElement>(null);
  const autoId = React.useId();
  const errId = name ? `fibo-err-${name}` : `${autoId}-error`;
  const initialValue = value;
  const [localValue, setLocalValue] = useState(initialValue);
  const rawSelected = controlled ? value : localValue;
  // Disabled options are not a valid selection (FormData omits them; arrows skip them).
  const selected = options.some((o) => o.value === rawSelected && !o.disabled)
    ? rawSelected
    : '';
  const named = !!name;
  const tabValue = selected || options.find((o) => !o.disabled)?.value;

  useEffect(() => {
    if (controlled) return;
    const group = groupRef.current;
    if (!group) return;

    const syncFromDom = () => {
      const checked = group.querySelector<HTMLInputElement>('input[type="radio"]:checked');
      setLocalValue(checked?.value ?? '');
    };
    const onFormReset = () => {
      if (!named) {
        setLocalValue(initialValue);
        return;
      }
      requestAnimationFrame(syncFromDom);
    };

    group.addEventListener('fibo-sync', syncFromDom);
    const form = group.closest('form');
    form?.addEventListener('reset', onFormReset);
    return () => {
      group.removeEventListener('fibo-sync', syncFromDom);
      form?.removeEventListener('reset', onFormReset);
    };
  }, [controlled, named, initialValue]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (rules) {
      const target =
        group.querySelector<HTMLInputElement>('input[type="radio"]:not(:disabled)') ??
        group.querySelector<HTMLInputElement>('input[type="radio"]');
      if (target) {
        (target as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
      }
    }
    (group as unknown as { __fiboShowError?: (msg: string | null) => void }).__fiboShowError = (
      message
    ) => {
      const span = group.querySelector('.fibo-field-error') as HTMLElement | null;
      if (span) {
        span.textContent = message ?? '';
        span.style.display = message ? '' : 'none';
      }
      const describedBy = span?.id || undefined;
      group.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
        if (message) {
          input.setAttribute('aria-invalid', 'true');
          if (describedBy) input.setAttribute('aria-describedby', describedBy);
        } else {
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
        }
      });
      if (message) {
        group.setAttribute('aria-invalid', 'true');
        if (describedBy) group.setAttribute('aria-describedby', describedBy);
      } else {
        group.removeAttribute('aria-invalid');
        group.removeAttribute('aria-describedby');
      }
    };
  }, [rules]);

  const onGroupKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!RADIO_MOVE_KEYS.has(event.key)) return;
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'radio') return;
    event.preventDefault();
    const next = moveRadioValue(options, selected, event.key);
    if (next == null || next === selected) return;
    const target = groupRef.current?.querySelector<HTMLInputElement>(
      `input[type="radio"][value="${escapeAttr(next)}"]`
    );
    if (!target || target.disabled) return;
    target.click();
    target.focus();
  };

  return React.createElement(
    'div',
    {
      ref: groupRef,
      role: 'radiogroup',
      className: twMerge(
        `fibo-radio-group flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4'}`,
        className
      ),
      style,
      onKeyDown: onGroupKeyDown,
      ...(error ? { 'aria-invalid': true, 'aria-describedby': errId } : null),
    },
    options.map((option) => {
      const isSelected = selected === option.value;
      const isDisabled = option.disabled;

      const circleClasses = twMerge(
        'fibo-radio-circle relative flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all duration-200',
        TOGGLE_FOCUS_RING,
        isSelected
          ? 'border-[5px] border-[var(--fibo-primary,#3B82F6)]'
          : 'border-2 border-gray-300'
      );

      const inputProps: Record<string, unknown> = {
        type: 'radio',
        value: option.value,
        disabled: isDisabled,
        className: 'sr-only',
        onChange: () => {
          if (isDisabled) return;
          if (!controlled) setLocalValue(option.value);
          onChange?.(option.value);
        },
      };
      if (named) inputProps.name = name;
      if (error) {
        inputProps['aria-invalid'] = true;
        inputProps['aria-describedby'] = errId;
      }
      if (!isDisabled) {
        inputProps.tabIndex = option.value === tabValue ? 0 : -1;
      }
      if (controlled || !named) {
        inputProps.checked = isSelected;
      } else {
        inputProps.defaultChecked = initialValue === option.value && !isDisabled;
      }

      return React.createElement(
        'label',
        {
          key: option.value,
          className: `group flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
        },
        React.createElement('div', {
          className: circleClasses,
          'aria-hidden': true,
        }),
        React.createElement('span', { className: 'text-sm text-gray-700' }, option.label),
        React.createElement('input', inputProps)
      );
    }),
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

class RadioGroupBuilder extends FiboBuilder {
  private _value: string = '';
  private _controlled = false;
  private _options: RadioOption[] = [];
  private _onChange?: (value: string) => void;
  private _name?: string;
  private _direction: 'vertical' | 'horizontal' = 'vertical';
  private _rules?: FieldRule[];
  private _error?: string;

  value(val: string): this {
    this._value = val;
    return this;
  }

  /**
   * Force controlled React selection (parent must setState). Default is uncontrolled.
   */
  controlled(enabled: boolean = true): this {
    this._controlled = enabled;
    return this;
  }

  options(opts: RadioOption[]): this {
    this._options = opts;
    for (const opt of opts) {
      bindInterp(this, opt.label);
    }
    return this;
  }

  onChange(handler: (val: string) => void): this {
    this._onChange = handler;
    return this;
  }

  direction(dir: 'vertical' | 'horizontal'): this {
    this._direction = dir;
    return this;
  }

  name(val: string): this {
    this._name = val;
    return this;
  }

  error(val: string): this {
    this._error = val;
    bindInterp(this, val);
    return this;
  }

  /** Rules collected by `Form` on submit (this field's own checks). */
  rules(...items: FieldRule[]): this {
    this._rules = items;
    return this;
  }

  build(): ReactElement {
    const props: RadioGroupInnerProps = {
      value: this._value,
      controlled: this._controlled,
      options: this._options.map((opt) => ({
        ...opt,
        label: resolveInterp(opt.label) ?? opt.label,
      })),
      onChange: this._onChange,
      name: this._name,
      direction: this._direction,
      rules: this._rules,
      error: resolveInterp(this._error),
      className: this.getClassName(),
      style: this.getStyle(),
    };
    return React.createElement(RadioGroupInner, props);
  }
}

export const RadioGroup = createBuilder(RadioGroupBuilder);

export interface RadioGroupProps extends BaseProps {
  value: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
  name?: string;
}
