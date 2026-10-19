'use client';

import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { fiboCn as twMerge } from '../../core/cn';

interface SwitchTileInnerProps {
  title?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

const SwitchTileInner = React.memo((props: SwitchTileInnerProps) => {
  const { title = '', checked = false, onChange, className, style } = props;
  const [isChecked, setIsChecked] = React.useState(checked);
  const titleId = React.useId();

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
      role: 'switch',
      'aria-checked': isChecked,
      'aria-labelledby': titleId,
      tabIndex: 0,
      className: twMerge('fibo-switch-tile flex flex-row items-center w-full', className),
      style: { padding: '14px 0', cursor: 'pointer', gap: 12, ...style },
      onClick: toggle,
      onKeyDown,
    },
    React.createElement(
      'span',
      {
        id: titleId,
        className: 'fibo-switch-tile-title flex-1 min-w-0',
        style: { fontSize: 11, letterSpacing: '0.06em', lineHeight: 1.3, margin: 0 },
      },
      title
    ),
    React.createElement(
      'span',
      {
        'aria-hidden': true,
        className: 'fibo-switch-tile-track shrink-0',
        style: {
          width: 36,
          height: 20,
          borderRadius: 999,
          background: isChecked ? '#111' : '#d4d4d4',
          position: 'relative',
          display: 'inline-block',
        },
      },
      React.createElement('span', {
        className: 'fibo-switch-tile-thumb',
        style: {
          position: 'absolute',
          top: 2,
          left: isChecked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 999,
          background: '#fff',
        },
      })
    )
  );
});

class SwitchTileBuilder extends FiboBuilder {
  private _title?: string;
  private _checked?: boolean;
  private _onChange?: (checked: boolean) => void;

  title(value: string): this {
    this._title = value;
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
    const { title: titleProp, checked: checkedProp, onChange: onChangeProp, ...rest } = this._props;

    return React.createElement(SwitchTileInner, {
      ...rest,
      title: this._title ?? titleProp,
      checked: this._checked ?? Boolean(checkedProp),
      onChange: this._onChange ?? onChangeProp,
      className: this.getClassName(),
      style: this.getStyle(),
    });
  }
}

export const SwitchTile = createBuilder(SwitchTileBuilder);
