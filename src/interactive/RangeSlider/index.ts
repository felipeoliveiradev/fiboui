'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function percent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((clamp(value, min, max) - min) / (max - min)) * 100;
}

interface RangeSliderInnerProps {
  start: number;
  end: number;
  min: number;
  max: number;
  step: number;
  onChange?: (start: number, end: number) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const RangeSliderInner = React.memo((props: RangeSliderInnerProps) => {
  const { start, end, min, max, step, onChange, disabled, className, style } = props;
  const [range, setRange] = useState({ start, end });

  useEffect(() => {
    const nextStart = clamp(Math.min(start, end), min, max);
    const nextEnd = clamp(Math.max(start, end), min, max);
    setRange({ start: nextStart, end: nextEnd });
  }, [start, end, min, max]);

  const commit = (nextStart: number, nextEnd: number) => {
    const orderedStart = clamp(Math.min(nextStart, nextEnd), min, max);
    const orderedEnd = clamp(Math.max(orderedStart, nextEnd), min, max);
    const ordered = { start: orderedStart, end: orderedEnd };
    setRange(ordered);
    onChange?.(ordered.start, ordered.end);
  };

  const left = percent(range.start, min, max);
  const right = percent(range.end, min, max);

  const thumbStyle = (which: 'start' | 'end'): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    width: '100%',
    margin: 0,
    background: 'transparent',
    pointerEvents: 'none',
    zIndex: which === 'start' ? 2 : 3,
  });

  return React.createElement(
    'div',
    {
      className: ['fibo-range-slider', className].filter(Boolean).join(' '),
      style: { position: 'relative', width: '100%', ...style },
    },
    React.createElement(
      'div',
      {
        className: 'fibo-range-track',
        'aria-hidden': true,
        style: {
          position: 'relative',
          height: 6,
          borderRadius: 999,
          background: 'var(--fibo-track, #e5e7eb)',
        },
      },
      React.createElement('div', {
        className: 'fibo-range-fill',
        style: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${left}%`,
          width: `${Math.max(0, right - left)}%`,
          background: 'var(--fibo-primary, #3B82F6)',
          borderRadius: 999,
        },
      })
    ),
    React.createElement('input', {
      type: 'range',
      className: 'fibo-range-thumb fibo-range-start',
      min,
      max,
      step,
      value: range.start,
      disabled,
      'aria-label': 'Range start',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': range.start,
      style: { ...thumbStyle('start'), pointerEvents: 'auto' },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const next = clamp(Number(event.target.value), min, range.end);
        commit(next, range.end);
      },
    }),
    React.createElement('input', {
      type: 'range',
      className: 'fibo-range-thumb fibo-range-end',
      min,
      max,
      step,
      value: range.end,
      disabled,
      'aria-label': 'Range end',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': range.end,
      style: { ...thumbStyle('end'), pointerEvents: 'auto' },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const next = clamp(Number(event.target.value), range.start, max);
        commit(range.start, next);
      },
    })
  );
});

class RangeSliderBuilder extends FiboBuilder {
  private _start = 0;
  private _end = 100;
  private _min = 0;
  private _max = 100;
  private _step = 1;
  private _onChange?: (start: number, end: number) => void;
  private _disabled = false;

  start(n: number): this {
    this._start = n;
    return this;
  }

  end(n: number): this {
    this._end = n;
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

  onChange(handler: (start: number, end: number) => void): this {
    this._onChange = handler;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
    return this;
  }

  build(): ReactElement {
    const { disabled: propsDisabled, className: extraClass, style: extraStyle, ...rest } = this._props;
    const start = Math.min(this._start, this._end);
    const end = Math.max(this._start, this._end);
    return React.createElement(RangeSliderInner, {
      start,
      end,
      min: this._min,
      max: this._max,
      step: this._step,
      onChange: this._onChange,
      disabled: this._disabled || Boolean(propsDisabled),
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const RangeSlider = createBuilder(RangeSliderBuilder);

export interface RangeSliderProps extends BaseProps {
  start?: number;
  end?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (start: number, end: number) => void;
  disabled?: boolean;
}
