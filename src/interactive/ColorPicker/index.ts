'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface ColorPickerInnerProps {
  value?: string;
  label?: string;
  onChange?: (hex: string) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const ColorPickerInner = React.memo(function ColorPickerInner(props: ColorPickerInnerProps) {
  const autoId = React.useId();
  const inputId = props.id || autoId;
  const [value, setValue] = useState(props.value || '#000000');

  const input = React.createElement('input', {
    id: inputId,
    type: 'color',
    className: 'fibo-color-picker-input',
    value,
    'aria-label': props.label ? undefined : 'Color',
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
          { htmlFor: inputId, className: 'fibo-color-picker-label' },
          props.label
        )
      : null,
    input
  );
});

class ColorPickerBuilder extends FiboBuilder {
  private _value = '#000000';
  private _label?: string;
  private _onChange?: (hex: string) => void;

  value(hex: string): this {
    this._value = hex;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  onChange(handler: (hex: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-color-picker', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(ColorPickerInner, {
      ...rest,
      className,
      style: this.getStyle(),
      value: this._value,
      label: this._label,
      onChange: this._onChange,
    });
  }
}

export const ColorPicker = createBuilder(ColorPickerBuilder);

export interface ColorPickerProps extends BaseProps {
  value?: string;
  label?: string;
  onChange?: (hex: string) => void;
}
