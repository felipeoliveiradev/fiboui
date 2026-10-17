'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface DatePickerInnerProps {
  value?: string;
  label?: string;
  min?: string;
  max?: string;
  onChange?: (iso: string) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const DatePickerInner = React.memo(function DatePickerInner(props: DatePickerInnerProps) {
  const autoId = React.useId();
  const inputId = props.id || autoId;
  const [value, setValue] = useState(props.value ?? '');

  const input = React.createElement('input', {
    id: inputId,
    type: 'date',
    className: 'fibo-date-picker-input',
    value,
    min: props.min,
    max: props.max,
    'aria-label': props.label ? undefined : 'Date',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      props.onChange?.(event.target.value);
    },
  });

  return React.createElement(
    'div',
    { className: props.className, style: props.style },
    props.label
      ? React.createElement(
          'label',
          { htmlFor: inputId, className: 'fibo-date-picker-label' },
          props.label
        )
      : null,
    input
  );
});

class DatePickerBuilder extends FiboBuilder {
  private _value = '';
  private _label?: string;
  private _min?: string;
  private _max?: string;
  private _onChange?: (iso: string) => void;

  value(iso: string): this {
    this._value = iso;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  min(iso?: string): this {
    this._min = iso;
    return this;
  }

  max(iso?: string): this {
    this._max = iso;
    return this;
  }

  onChange(handler: (iso: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-date-picker', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(DatePickerInner, {
      ...rest,
      className,
      style: this.getStyle(),
      value: this._value,
      label: this._label,
      min: this._min,
      max: this._max,
      onChange: this._onChange,
    });
  }
}

export const DatePicker = createBuilder(DatePickerBuilder);

export interface DatePickerProps extends BaseProps {
  value?: string;
  label?: string;
  min?: string;
  max?: string;
  onChange?: (iso: string) => void;
}
