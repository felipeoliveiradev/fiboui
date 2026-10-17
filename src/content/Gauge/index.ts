import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface GaugeInnerProps {
  value: number;
  min: number;
  max: number;
  label?: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}

const GaugeInner = React.memo((props: GaugeInnerProps) => {
  const { value, min, max, label, color, className, style } = props;
  const cx = 100;
  const cy = 100;
  const r = 80;
  const arcLength = Math.PI * r;
  const span = max - min;
  const t = span === 0 ? 0 : (clamp(value, min, max) - min) / span;
  const drawn = t * arcLength;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return React.createElement(
    'div',
    {
      className: ['fibo-gauge', className].filter(Boolean).join(' '),
      style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...style },
    },
    React.createElement(
      'svg',
      {
        className: 'fibo-gauge-svg',
        width: 200,
        height: 120,
        viewBox: '0 0 200 120',
        role: 'meter',
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': clamp(value, min, max),
        'aria-label': label || 'Gauge',
      },
      React.createElement('path', {
        className: 'fibo-gauge-track',
        d,
        fill: 'none',
        stroke: 'var(--fibo-track, #e5e7eb)',
        strokeWidth: 12,
        strokeLinecap: 'round',
      }),
      React.createElement('path', {
        className: 'fibo-gauge-value',
        d,
        fill: 'none',
        stroke: color,
        strokeWidth: 12,
        strokeLinecap: 'round',
        strokeDasharray: `${drawn} ${arcLength}`,
      })
    ),
    label
      ? React.createElement('span', { className: 'fibo-gauge-label text-sm font-medium' }, label)
      : null
  );
});

class GaugeBuilder extends FiboBuilder {
  private _value = 0;
  private _min = 0;
  private _max = 1;
  private _label?: string;
  private _color = '#3B82F6';

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

  label(text: string): this {
    this._label = text;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(GaugeInner, {
      value: this._value,
      min: this._min,
      max: this._max,
      label: this._label,
      color: this._color,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const Gauge = createBuilder(GaugeBuilder);

export interface GaugeProps extends BaseProps {
  value?: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
}
