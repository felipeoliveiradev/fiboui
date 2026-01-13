import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { twMerge } from 'tailwind-merge';

const SwitchInner = React.memo((props: any) => {
    const {
        checked,
        onChange,
        label,
        disabled,
        className,
        style
    } = props;

    const trackClasses = twMerge(
        'fibo-switch-track w-[44px] h-[24px] rounded-full relative transition-colors duration-200 ease-in-out',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        checked ? 'bg-[var(--fibo-primary,#3B82F6)]' : 'bg-gray-200'
    );

    const thumbClasses = twMerge(
        'absolute w-5 h-5 rounded-full bg-white top-[2px] left-[2px] transition-transform duration-200 ease-in-out shadow-sm',
        checked ? 'translate-x-[20px]' : 'translate-x-0'
    );

    return React.createElement(
        'label',
        {
            className: twMerge('fibo-switch flex items-center gap-3', className)
        },
        React.createElement(
            'div',
            {
                className: trackClasses,
                style: style,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (!disabled && onChange) {
                        onChange(!checked);
                    }
                }
            },
            React.createElement('div', { className: thumbClasses })
        ),
        label && React.createElement(
            'span',
            { className: 'text-sm font-medium text-gray-700 select-none' },
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

class SwitchBuilder extends FiboBuilder {
  private _checked: boolean = false;
  private _onChange?: (checked: boolean) => void;
  private _label?: string;
  private _disabled: boolean = false;

  checked(value: boolean): this {
    this._checked = value;
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
        className: this.getClassName(),
        style: this.getStyle()
    };
    return React.createElement(SwitchInner, props);
  }
}

export const Switch = createBuilder(SwitchBuilder);

export interface SwitchProps extends BaseProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
