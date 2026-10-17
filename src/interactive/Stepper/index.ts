'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function decimals(step: number): number {
  const text = String(step);
  const index = text.indexOf('.');
  return index === -1 ? 0 : text.length - index - 1;
}

function roundToStep(value: number, step: number): number {
  const places = decimals(step);
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

interface StepperInnerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const StepperInner = React.memo((props: StepperInnerProps) => {
  const { value, min, max, step, onChange, label, disabled, className, style } = props;
  const [current, setCurrent] = useState(() => clamp(value, min, max));

  useEffect(() => {
    setCurrent(clamp(value, min, max));
  }, [value, min, max]);

  const commit = (next: number) => {
    const clamped = clamp(roundToStep(next, step), min, max);
    if (clamped === current) return;
    setCurrent(clamped);
    onChange?.(clamped);
  };

  const buttonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--fibo-border, #d1d5db)',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return React.createElement(
    'div',
    {
      className: ['fibo-stepper', className].filter(Boolean).join(' '),
      style: { display: 'inline-flex', flexDirection: 'column', gap: 6, ...style },
    },
    label
      ? React.createElement('span', { className: 'fibo-stepper-label text-sm font-medium' }, label)
      : null,
    React.createElement(
      'div',
      {
        role: 'group',
        'aria-label': label || 'Stepper',
        style: { display: 'inline-flex', alignItems: 'center', gap: 8 },
      },
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'fibo-stepper-minus',
          'aria-label': '-',
          disabled: disabled || current <= min,
          style: buttonStyle,
          onClick: () => commit(current - step),
        },
        '−'
      ),
      React.createElement(
        'span',
        { className: 'fibo-stepper-value', 'aria-live': 'polite' },
        String(current)
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'fibo-stepper-plus',
          'aria-label': '+',
          disabled: disabled || current >= max,
          style: buttonStyle,
          onClick: () => commit(current + step),
        },
        '+'
      )
    )
  );
});

class StepperBuilder extends FiboBuilder {
  private _value = 0;
  private _min = 0;
  private _max = 100;
  private _step = 1;
  private _onChange?: (value: number) => void;
  private _label?: string;
  private _disabled = false;

  value(n: number): this {
    this._value = n;
    return this;
  }

  min(n: number): this {
    this._min = n;
    return this;
  }

  max(n: number): this {
    this._max = n;
    return this;
  }

  step(n: number): this {
    this._step = n;
    return this;
  }

  onChange(handler: (value: number) => void): this {
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

  build(): ReactElement {
    const { disabled: propsDisabled, className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(StepperInner, {
      value: this._value,
      min: this._min,
      max: this._max,
      step: this._step,
      onChange: this._onChange,
      label: this._label,
      disabled: this._disabled || Boolean(propsDisabled),
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const Stepper = createBuilder(StepperBuilder);

export interface StepperProps extends BaseProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
}
