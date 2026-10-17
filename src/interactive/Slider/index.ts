'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

export type SliderDirection = 'horizontal' | 'vertical';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ratio(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (clamp(value, min, max) - min) / (max - min);
}

interface SliderInnerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  direction: SliderDirection;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const SliderInner = React.memo((props: SliderInnerProps) => {
  const {
    value,
    min,
    max,
    step,
    direction,
    onChange,
    label,
    disabled,
    className,
    style,
    id,
  } = props;

  const reactId = React.useId();
  const inputId = id || reactId;
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  const vertical = direction === 'vertical';
  const fill = `${ratio(current, min, max) * 100}%`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const next = clamp(Number(event.target.value), min, max);
    setCurrent(next);
    onChange?.(next);
  };

  const inputStyle: React.CSSProperties = vertical
    ? {
        writingMode: 'vertical-lr',
        WebkitAppearance: 'slider-vertical',
        width: 28,
        height: 160,
      }
    : { width: '100%' };

  return React.createElement(
    'div',
    {
      className: ['fibo-slider', vertical ? 'fibo-slider-vertical' : 'fibo-slider-horizontal', className]
        .filter(Boolean)
        .join(' '),
      style: {
        display: 'inline-flex',
        flexDirection: vertical ? 'row' : 'column',
        gap: 8,
        alignItems: vertical ? 'center' : 'stretch',
        ...style,
      },
    },
    label
      ? React.createElement(
          'label',
          { htmlFor: inputId, className: 'fibo-slider-label text-sm font-medium' },
          label
        )
      : null,
    React.createElement(
      'div',
      {
        className: 'fibo-slider-track',
        'aria-hidden': true,
        style: {
          position: 'relative',
          background: 'var(--fibo-track, #e5e7eb)',
          borderRadius: 999,
          overflow: 'hidden',
          ...(vertical ? { width: 6, height: 160 } : { height: 6, width: '100%' }),
        },
      },
      React.createElement('div', {
        className: 'fibo-slider-fill',
        style: {
          background: 'var(--fibo-primary, #3B82F6)',
          ...(vertical
            ? { position: 'absolute', left: 0, right: 0, bottom: 0, height: fill }
            : { height: '100%', width: fill }),
        },
      })
    ),
    React.createElement('input', {
      id: inputId,
      type: 'range',
      min,
      max,
      step,
      value: current,
      disabled,
      'aria-orientation': vertical ? 'vertical' : 'horizontal',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': current,
      'aria-label': label,
      onChange: handleChange,
      style: inputStyle,
    })
  );
});

class SliderBuilder extends FiboBuilder {
  private _value = 0;
  private _min = 0;
  private _max = 100;
  private _step = 1;
  private _direction: SliderDirection = 'horizontal';
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

  direction(dir: SliderDirection): this {
    this._direction = dir;
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
    return React.createElement(SliderInner, {
      value: this._value,
      min: this._min,
      max: this._max,
      step: this._step,
      direction: this._direction,
      onChange: this._onChange,
      label: this._label,
      disabled: this._disabled || Boolean(propsDisabled),
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const Slider = createBuilder(SliderBuilder);

export interface SliderProps extends BaseProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  direction?: SliderDirection;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
}
