import React, { ReactElement, ChangeEvent, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Signal } from '../../core/state';

const applyMask = (value: string, mask: string) => {
    let i = 0;
    const valueChars = value.replace(/\D/g, '').split('');
    let output = '';
    
    for (let m = 0; m < mask.length; m++) {
        if (i >= valueChars.length) break;
        
        if (mask[m] === '9') {
            output += valueChars[i++];
        } else {
            output += mask[m];
        }
    }
    return output;
};

const TextFieldInner = React.memo((props: any) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const [showPassword, setShowPassword] = React.useState(false);
    
    const { 
        containerClass, 
        containerStyle, 
        label, 
        error, 
        mask,
        type,
        value, // Can be string or Signal
        onChange,
        ...inputRest 
    } = props;

    // Handle Signal or primitive value
    const isSignal = value instanceof Signal;
    const [localValue, setLocalValue] = useState(isSignal ? value.value : value);

    // Sync with Signal updates
    useEffect(() => {
        if (isSignal) {
            const unsubscribe = value.subscribe((val: string) => {
                setLocalValue(val);
            });
            return unsubscribe;
        } else {
            setLocalValue(value);
        }
    }, [value, isSignal]);

    const isPassword = type === 'password';
    const effectiveType = isPassword && showPassword ? 'text' : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        if (mask) {
            newValue = applyMask(newValue, mask);
            
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: newValue
                }
            } as React.ChangeEvent<HTMLInputElement>;
            
            if (isSignal) {
                value.value = newValue; // Update signal
            }
            onChange?.(syntheticEvent);
        } else {
            if (isSignal) {
                value.value = newValue; // Update signal
            }
            onChange?.(e);
        }
    };

    return React.createElement(
      'div',
      { className: containerClass, style: containerStyle },
      React.createElement('div', { className: 'relative w-full' }, [
          React.createElement('input', {
              key: 'input',
              id: inputId,
              className: 'fibo-textfield-input',
              type: effectiveType,
              onChange: handleChange,
              value: localValue,
              ...inputRest
          }),
          label && React.createElement(
            'label',
            { 
                key: 'label',
                htmlFor: inputId,
                className: 'fibo-textfield-label' 
            },
            label
          ),
          isPassword && React.createElement(
              'button',
              {
                  key: 'toggle',
                  type: 'button',
                  className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none',
                  onClick: () => setShowPassword(!showPassword),
                  tabIndex: -1
              },
              showPassword ? 
                React.createElement('svg', { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                    React.createElement('path', { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }),
                    React.createElement('line', { x1: 1, y1: 1, x2: 23, y2: 23 })
                ) :
                React.createElement('svg', { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
                    React.createElement('path', { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                    React.createElement('circle', { cx: 12, cy: 12, r: 3 })
                )
          )
      ]),
      error && React.createElement(
        'span',
        { className: 'text-[var(--fibo-error)] text-xs mt-1 ml-1' },
        error
      )
    );
});

class TextFieldBuilder extends FiboBuilder {
  private _value: string | Signal<string> = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _type: string = 'text';
  private _disabled: boolean = false;
  private _error?: string;
  private _mask?: string;
  private _onChange?: (value: string) => void;

  constructor(value: string = '') {
    super();
    this._value = value;
  }

  value(val: string | Signal<string>): this {
    this._value = val;
    return this;
  }

  label(val: string): this {
    this._label = val;
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    return this;
  }

  type(val: 'text' | 'password' | 'email' | 'number' | 'tel'): this {
    this._type = val;
    return this;
  }

  mask(format: string): this {
      this._mask = format;
      return this;
  }

  disabled(val: boolean = true): this {
    this._disabled = val;
    return this;
  }

  error(val: string): this {
    this._error = val;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const containerClass = ['fibo-textfield-container', ...this._classNames]
      .filter(Boolean)
      .join(' ');

    const props = {
        containerClass,
        containerStyle: this.getStyle(),
        label: this._label,
        error: this._error,
        value: this._value,
        placeholder: this._placeholder || ' ',
        type: this._type,
        mask: this._mask,
        disabled: this._disabled,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
            this._onChange?.(e.target.value);
        },
        ...this._props
    };

    return React.createElement(TextFieldInner, props);
  }
}

export const TextField = createBuilder(TextFieldBuilder);

export interface TextFieldProps extends BaseProps {
  value: string | Signal<string>;
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  mask?: string;
}
