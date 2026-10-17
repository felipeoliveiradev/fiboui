'use client';

import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';

interface RadioTileInnerProps {
  title?: string;
  value?: string;
  group?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const RadioTileInner = React.memo((props: RadioTileInnerProps) => {
  const { title = '', value = '', group, checked = false, onChange, className, style } = props;
  const [isChecked, setIsChecked] = React.useState(checked);
  const titleId = React.useId();

  const select = () => {
    setIsChecked(true);
    onChange?.(value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    select();
  };

  return React.createElement(
    'div',
    {
      role: 'radio',
      'aria-checked': isChecked,
      'aria-labelledby': titleId,
      tabIndex: 0,
      'data-value': value,
      'data-group': group,
      className: twMerge('fibo-radio-tile flex flex-row items-center w-full', className),
      style: { padding: '14px 0', cursor: 'pointer', gap: 12, ...style },
      onClick: select,
      onKeyDown,
    },
    React.createElement(
      'span',
      {
        'aria-hidden': true,
        className: 'fibo-radio-tile-mark shrink-0',
        style: {
          width: 16,
          height: 16,
          borderRadius: 999,
          border: '1px solid #3b3b3b',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      isChecked
        ? React.createElement('span', {
            style: {
              width: 8,
              height: 8,
              borderRadius: 999,
              background: '#111',
            },
          })
        : null
    ),
    React.createElement(
      'span',
      {
        id: titleId,
        className: 'fibo-radio-tile-title flex-1 min-w-0',
        style: { fontSize: 11, letterSpacing: '0.06em', lineHeight: 1.3, margin: 0 },
      },
      title
    )
  );
});

class RadioTileBuilder extends FiboBuilder {
  private _title?: string;
  private _value?: string;
  private _group?: string;
  private _checked?: boolean;
  private _onChange?: (value: string) => void;

  title(value: string): this {
    this._title = value;
    return this;
  }

  value(value: string): this {
    this._value = value;
    return this;
  }

  group(name?: string): this {
    if (typeof name === 'string') {
      this._group = name;
      return this;
    }
    return super.group();
  }

  checked(value: boolean): this {
    this._checked = value;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const {
      title: titleProp,
      value: valueProp,
      group: groupProp,
      checked: checkedProp,
      onChange: onChangeProp,
      ...rest
    } = this._props;

    return React.createElement(RadioTileInner, {
      ...rest,
      title: this._title ?? titleProp,
      value: this._value ?? valueProp ?? '',
      group: this._group ?? groupProp,
      checked: this._checked ?? Boolean(checkedProp),
      onChange: this._onChange ?? onChangeProp,
      className: this.getClassName(),
      style: this.getStyle(),
    });
  }
}

export const RadioTile = createBuilder(RadioTileBuilder);
