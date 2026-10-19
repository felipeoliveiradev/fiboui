'use client';

import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { fiboCn as twMerge } from '../../core/cn';

interface CheckboxTileInnerProps {
  title?: string;
  subtitle?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const CheckboxTileInner = React.memo((props: CheckboxTileInnerProps) => {
  const { title = '', subtitle, checked = false, onChange, className, style } = props;
  const [isChecked, setIsChecked] = React.useState(checked);
  const titleId = React.useId();
  const subtitleId = React.useId();

  const toggle = () => {
    const next = !isChecked;
    setIsChecked(next);
    onChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toggle();
  };

  return React.createElement(
    'div',
    {
      role: 'checkbox',
      'aria-checked': isChecked,
      'aria-labelledby': titleId,
      'aria-describedby': subtitle ? subtitleId : undefined,
      tabIndex: 0,
      className: twMerge('fibo-checkbox-tile flex flex-row items-center w-full', className),
      style: { padding: '14px 0', cursor: 'pointer', gap: 12, ...style },
      onClick: toggle,
      onKeyDown,
    },
    React.createElement(
      'span',
      {
        'aria-hidden': true,
        className: 'fibo-checkbox-tile-box shrink-0',
        style: {
          width: 16,
          height: 16,
          border: '1px solid #3b3b3b',
          borderRadius: 3,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isChecked ? '#111' : 'transparent',
          color: '#fff',
          fontSize: 11,
          lineHeight: 1,
        },
      },
      isChecked ? '✓' : ''
    ),
    React.createElement(
      'div',
      { className: 'fibo-checkbox-tile-body flex-1 min-w-0 flex flex-col justify-center' },
      React.createElement(
        'span',
        {
          id: titleId,
          className: 'fibo-checkbox-tile-title',
          style: { fontSize: 11, letterSpacing: '0.06em', lineHeight: 1.3, margin: 0 },
        },
        title
      ),
      subtitle
        ? React.createElement(
            'span',
            {
              id: subtitleId,
              className: 'fibo-checkbox-tile-subtitle',
              style: {
                fontSize: 8,
                letterSpacing: '0.06em',
                lineHeight: 1.3,
                margin: 0,
                color: '#9a9a9a',
              },
            },
            subtitle
          )
        : null
    )
  );
});

class CheckboxTileBuilder extends FiboBuilder {
  private _title?: string;
  private _subtitle?: string;
  private _checked?: boolean;
  private _onChange?: (checked: boolean) => void;

  title(value: string): this {
    this._title = value;
    return this;
  }

  subtitle(value: string): this {
    this._subtitle = value;
    return this;
  }

  checked(value: boolean): this {
    this._checked = value;
    return this;
  }

  onChange(handler: (checked: boolean) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const {
      title: titleProp,
      subtitle: subtitleProp,
      checked: checkedProp,
      onChange: onChangeProp,
      ...rest
    } = this._props;

    return React.createElement(CheckboxTileInner, {
      ...rest,
      title: this._title ?? titleProp,
      subtitle: this._subtitle ?? subtitleProp,
      checked: this._checked ?? Boolean(checkedProp),
      onChange: this._onChange ?? onChangeProp,
      className: this.getClassName(),
      style: this.getStyle(),
    });
  }
}

export const CheckboxTile = createBuilder(CheckboxTileBuilder);
