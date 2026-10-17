'use client';

import React, { CSSProperties, ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface WheelPickerInnerProps {
  items: string[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

const WheelPickerInner = React.memo(function WheelPickerInner(props: WheelPickerInnerProps) {
  const [selected, setSelected] = useState(props.value ?? '');

  return React.createElement(
    'div',
    {
      role: 'listbox',
      className: props.className,
      style: {
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        maxHeight: 240,
        ...props.style,
      },
    },
    props.items.map((item) =>
      React.createElement(
        'button',
        {
          key: item,
          type: 'button',
          role: 'option',
          className: 'fibo-wheel-picker-item',
          'aria-selected': selected === item ? 'true' : 'false',
          style: { scrollSnapAlign: 'center' },
          onClick: () => {
            setSelected(item);
            props.onChange?.(item);
          },
        },
        item
      )
    )
  );
});

class WheelPickerBuilder extends FiboBuilder {
  private _items: string[] = [];
  private _value = '';
  private _onChange?: (value: string) => void;

  items(values: string[]): this {
    this._items = values;
    return this;
  }

  value(selected: string): this {
    this._value = selected;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: propsStyle, ...rest } = this._props;
    const className = ['fibo-wheel-picker', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');
    const extraStyle =
      propsStyle && typeof propsStyle === 'object' && !Array.isArray(propsStyle)
        ? (propsStyle as CSSProperties)
        : {};

    return React.createElement(WheelPickerInner, {
      ...rest,
      className,
      style: { ...this.getStyle(), ...extraStyle },
      items: this._items,
      value: this._value,
      onChange: this._onChange,
    });
  }
}

export const WheelPicker = createBuilder(WheelPickerBuilder);

export interface WheelPickerProps extends BaseProps {
  items?: string[];
  value?: string;
  onChange?: (value: string) => void;
}
