import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const SwitchInner = React.memo((props: any) => {
    const { 
        checked, 
        onChange, 
        label, 
        disabled, 
        className, 
        style 
    } = props;

    
    const trackBaseStyle: React.CSSProperties = {
        width: '44px',
        height: '24px',
        borderRadius: '9999px',
        position: 'relative',
        transition: 'background-color 0.2s ease-in-out',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        backgroundColor: checked ? 'var(--fibo-primary, #3B82F6)' : '#E5E7EB',
        ...style
    };

    const thumbStyle: React.CSSProperties = {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '2px',
        left: '2px',
        transition: 'transform 0.2s ease-in-out',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    return React.createElement(
        'label',
        { 
            className: `fibo-switch flex items-center gap-3 ${className}`
        },
        React.createElement(
            'div',
            {
                className: 'fibo-switch-track',
                style: trackBaseStyle,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (!disabled && onChange) {
                        onChange(!checked);
                    }
                }
            },
            React.createElement('div', { style: thumbStyle })
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
