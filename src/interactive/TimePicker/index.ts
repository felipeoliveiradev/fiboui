'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface TimePickerInnerProps {
  value?: string;
  label?: string;
  onChange?: (hm: string) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const TimePickerInner = React.memo(function TimePickerInner(props: TimePickerInnerProps) {
  const autoId = React.useId();
  const inputId = props.id || autoId;
  const [value, setValue] = useState(props.value ?? '');

  const input = React.createElement('input', {
    id: inputId,
    type: 'time',
    className: 'fibo-time-picker-input',
    value,
    'aria-label': props.label ? undefined : 'Time',
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
          { htmlFor: inputId, className: 'fibo-time-picker-label' },
          props.label
        )
      : null,
    input
  );
});

class TimePickerBuilder extends FiboBuilder {
  private _value = '';
  private _label?: string;
  private _onChange?: (hm: string) => void;

  value(hm: string): this {
    this._value = hm;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  onChange(handler: (hm: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-time-picker', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(TimePickerInner, {
      ...rest,
      className,
      style: this.getStyle(),
      value: this._value,
      label: this._label,
      onChange: this._onChange,
    });
  }
}

export const TimePicker = createBuilder(TimePickerBuilder);

export interface TimePickerProps extends BaseProps {
  value?: string;
  label?: string;
  onChange?: (hm: string) => void;
}
