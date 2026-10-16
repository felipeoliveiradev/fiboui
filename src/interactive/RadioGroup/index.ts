'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { twMerge } from 'tailwind-merge';

interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioGroupInnerProps {
  value?: string;
  controlled?: boolean;
  options?: RadioOption[];
  onChange?: (value: string) => void;
  name?: string;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Uncontrolled by default — DOM owns selection (`defaultChecked` + local visual state).
 * Opt into `.controlled(true)` when the parent must drive `value`.
 */
const RadioGroupInner = React.memo((props: RadioGroupInnerProps) => {
  const {
    value = '',
    controlled = false,
    options = [],
    onChange,
    name,
    direction,
    className,
    style,
  } = props;

  const groupRef = useRef<HTMLDivElement>(null);
  const autoName = React.useId();
  const groupName = name || autoName;
  const initialValue = value;
  const [localValue, setLocalValue] = useState(initialValue);
  const selected = controlled ? value : localValue;

  useEffect(() => {
    if (controlled) return;
    const group = groupRef.current;
    if (!group) return;

    const syncFromDom = () => {
      const checked = group.querySelector<HTMLInputElement>('input[type="radio"]:checked');
      setLocalValue(checked?.value ?? '');
    };
    const onFormReset = () => {
      requestAnimationFrame(syncFromDom);
    };

    group.addEventListener('fibo-sync', syncFromDom);
    const form = group.closest('form');
    form?.addEventListener('reset', onFormReset);
    return () => {
      group.removeEventListener('fibo-sync', syncFromDom);
      form?.removeEventListener('reset', onFormReset);
    };
  }, [controlled]);

  return React.createElement(
    'div',
    {
      ref: groupRef,
      role: 'radiogroup',
      className: twMerge(
        `fibo-radio-group flex ${direction === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4'}`,
        className
      ),
      style,
    },
    options.map((option) => {
      const isSelected = selected === option.value;
      const isDisabled = option.disabled;

      const circleClasses = twMerge(
        'relative flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all duration-200',
        isSelected
          ? 'border-[5px] border-[var(--fibo-primary,#3B82F6)]'
          : 'border-2 border-gray-300'
      );

      const inputProps: Record<string, unknown> = {
        type: 'radio',
        name: groupName,
        value: option.value,
        disabled: isDisabled,
        className: 'sr-only',
        onChange: () => {
          if (isDisabled) return;
          if (!controlled) setLocalValue(option.value);
          onChange?.(option.value);
        },
      };
      if (controlled) {
        inputProps.checked = isSelected;
      } else {
        inputProps.defaultChecked = initialValue === option.value;
      }

      return React.createElement(
        'label',
        {
          key: option.value,
          className: `flex items-center gap-2 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
        },
        React.createElement(
          'div',
          {
            className: circleClasses,
            'aria-hidden': true,
          },
          React.createElement('input', inputProps)
        ),
        React.createElement('span', { className: 'text-sm text-gray-700' }, option.label)
      );
    })
  );
});

class RadioGroupBuilder extends FiboBuilder {
  private _value: string = '';
  private _controlled = false;
  private _options: RadioOption[] = [];
  private _onChange?: (value: string) => void;
  private _name?: string;
  private _direction: 'vertical' | 'horizontal' = 'vertical';

  value(val: string): this {
    this._value = val;
    return this;
  }

  /**
   * Force controlled React selection (parent must setState). Default is uncontrolled.
   */
  controlled(enabled: boolean = true): this {
    this._controlled = enabled;
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
    const props: RadioGroupInnerProps = {
      value: this._value,
      controlled: this._controlled,
      options: this._options,
      onChange: this._onChange,
      name: this._name,
      direction: this._direction,
      className: this.getClassName(),
      style: this.getStyle(),
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
  name?: string;
}
