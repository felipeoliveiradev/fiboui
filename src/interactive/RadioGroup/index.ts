import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { twMerge } from 'tailwind-merge';

interface RadioOption {
    label: string;
    value: string;
    disabled?: boolean;
}

const RadioGroupInner = React.memo((props: any) => {
    const {
        value,
        options,
        onChange,
        name,
        direction,
        className,
        style
    } = props;

    return React.createElement(
        'div',
        {
            className: twMerge(`fibo-radio-group flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4'}`, className),
            style: style
        },
        options.map((option: any) => {
            const isSelected = value === option.value;
            const isDisabled = option.disabled;

            const circleClasses = twMerge(
                'relative flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all duration-200',
                 isSelected ? 'border-[5px] border-[var(--fibo-primary,#3B82F6)]' : 'border-2 border-gray-300'
            );

            return React.createElement(
                'label',
                {
                    key: option.value,
                    className: `flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                },
                React.createElement(
                    'div',
                    {
                        className: circleClasses
                    },
                    React.createElement('input', {
                        type: 'radio',
                        name: name,
                        value: option.value,
                        checked: isSelected,
                        disabled: isDisabled,
                        className: 'sr-only',
                        onChange: () => !isDisabled && onChange?.(option.value)
                    })
                ),
                React.createElement(
                    'span',
                    { className: 'text-sm text-gray-700' },
                    option.label
                )
            );
        })
    );
});

class RadioGroupBuilder extends FiboBuilder {
  private _value: string = '';
  private _options: RadioOption[] = [];
  private _onChange?: (value: string) => void;
  private _name: string = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  private _direction: 'vertical' | 'horizontal' = 'vertical';

  value(val: string): this {
    this._value = val;
    return this;
  }

  options(opts: RadioOption[]): this {
    this._options = opts;
    return this;
  }

  onChange(handler: (val: string) => void): this {
    this._onChange = handler;
    return this;
  }

  direction(dir: 'vertical' | 'horizontal'): this {
    this._direction = dir;
    return this;
  }

  name(val: string): this {
    this._name = val;
    return this;
  }

  build(): ReactElement {
    const props = {
        value: this._value,
        options: this._options,
        onChange: this._onChange,
        name: this._name,
        direction: this._direction,
        className: this.getClassName(),
        style: this.getStyle()
    };
    return React.createElement(RadioGroupInner, props);
  }
}

export const RadioGroup = createBuilder(RadioGroupBuilder);

export interface RadioGroupProps extends BaseProps {
  value: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  direction?: 'vertical' | 'horizontal';
}
