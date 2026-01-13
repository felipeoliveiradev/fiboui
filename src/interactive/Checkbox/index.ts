import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { twMerge } from 'tailwind-merge';

const CheckboxInner = React.memo((props: any) => {
    const {
        checked,
        onChange,
        label,
        disabled,
        indeterminate,
        className,
        style
    } = props;

    const isCheckedOrIndeterminate = checked || indeterminate;

    let icon = null;
    if (indeterminate) {
        icon = React.createElement('div', { className: 'w-[10px] h-[2px] bg-white rounded-[1px]' });
    } else if (checked) {
        icon = React.createElement('svg', {
            width: '12',
            height: '12',
            viewBox: '0 0 12 12',
            fill: 'none',
            xmlns: 'http://www.w3.org/2000/svg'
        },
        React.createElement('path', {
            d: 'M10 3L4.5 8.5L2 6',
            stroke: 'white',
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
        }));
    }

    return React.createElement(
        'label',
        {

            className: twMerge('fibo-checkbox flex items-center gap-2', className)
        },
        React.createElement(
            'div',
            {
                className: twMerge(
                    'fibo-checkbox-box w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200',
                     disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                     isCheckedOrIndeterminate
                        ? 'border-transparent bg-[var(--fibo-primary,#3B82F6)]'
                        : 'border-gray-300 bg-transparent',

                ),
                style: style,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (!disabled && onChange) {
                        onChange(!checked);
                    }
                }
            },
            icon
        ),
        label && React.createElement(
            'span',
            { className: 'text-sm text-gray-700 select-none' },
            label
        ),
        React.createElement('input', {
            type: 'checkbox',
            checked: checked,
            disabled: disabled,
            className: 'sr-only',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => !disabled && onChange?.(e.target.checked)
        })
    );
});

class CheckboxBuilder extends FiboBuilder {
  private _checked: boolean = false;
  private _onChange?: (checked: boolean) => void;
  private _label?: string;
  private _disabled: boolean = false;
  private _indeterminate: boolean = false;

  checked(value: boolean): this {
    this._checked = value;
    return this;
  }

  indeterminate(value: boolean): this {
    this._indeterminate = value;
    return this;
  }

  onChange(handler: (checked: boolean) => void): this {
    this._onChange = handler;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
    return this;
  }

  build(): ReactElement {
    const props = {
        checked: this._checked,
        onChange: this._onChange,
        label: this._label,
        disabled: this._disabled,
        indeterminate: this._indeterminate,
        className: this.getClassName(),
        style: this.getStyle()
    };
    return React.createElement(CheckboxInner, props);
  }
}

export const Checkbox = createBuilder(CheckboxBuilder);

export interface CheckboxProps extends BaseProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}
