'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedButtonInnerProps {
  options: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const SegmentedButtonInner = React.memo(function SegmentedButtonInner(
  props: SegmentedButtonInnerProps
) {
  const [selected, setSelected] = useState(props.value ?? '');

  return React.createElement(
    'div',
    {
      role: 'radiogroup',
      className: props.className,
      style: props.style,
    },
    props.options.map((option) =>
      React.createElement(
        'button',
        {
          key: option.value,
          type: 'button',
          role: 'radio',
          className: 'fibo-segmented-button-option',
          'aria-checked': selected === option.value ? 'true' : 'false',
          onClick: () => {
            setSelected(option.value);
            props.onChange?.(option.value);
          },
        },
        option.label
      )
    )
  );
});

class SegmentedButtonBuilder extends FiboBuilder {
  private _options: SegmentedOption[] = [];
  private _value = '';
  private _onChange?: (value: string) => void;

  options(items: SegmentedOption[]): this {
    this._options = items;
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
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-segmented-button', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(SegmentedButtonInner, {
      ...rest,
      className,
      style: this.getStyle(),
      options: this._options,
      value: this._value,
      onChange: this._onChange,
    });
  }
}

export const SegmentedButton = createBuilder(SegmentedButtonBuilder);

export interface SegmentedButtonProps extends BaseProps {
  options?: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
}
