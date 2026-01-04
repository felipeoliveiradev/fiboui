import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';

interface Option {
  label: string;
  value: string;
}

const SelectInner = React.memo((props: any) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { 
        containerClass, 
        containerStyle, 
        label, 
        error, 
        value,
        options = [],
        placeholder,
        onChange,
        disabled,
        multiple,
        ...rest 
    } = props;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isSelected = (val: string) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(val);
        }
        return value === val;
    };

    let displayText = '';
    if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
           displayText = options
               .filter((opt: Option) => value.includes(opt.value))
               .map((opt: Option) => opt.label)
               .join(', ');
        }
    } else {
        const selectedOption = options.find((opt: Option) => opt.value === value);
        displayText = selectedOption ? selectedOption.label : '';
    }

    const handleSelect = (val: string) => {
        if (disabled) return;

        if (multiple) {
            const currentValues = Array.isArray(value) ? [...value] : [];
            const index = currentValues.indexOf(val);
            if (index > -1) {
                currentValues.splice(index, 1);
            } else {
                currentValues.push(val);
            }
            onChange?.(currentValues);
        } else {
            onChange?.(val);
            setIsOpen(false);
        }
    };

    return React.createElement(
      'div',
      { 
          ref: containerRef,
          className: containerClass, 
          style: containerStyle 
      },
      React.createElement('div', { className: 'relative w-full h-full' }, [
          React.createElement('button', {
              key: 'trigger',
              id: inputId,
              type: 'button',
              disabled: disabled,
              className: `fibo-textfield-input text-left w-full flex items-center justify-between ${!displayText ? 'text-gray-400' : ''}`,
              onClick: () => !disabled && setIsOpen(!isOpen),
              ...rest
          }, [
              React.createElement('span', { key: 'text', className: 'truncate' }, displayText || placeholder || ' '),
              React.createElement('svg', { 
                  key: 'icon', 
                  className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`, 
                  fill: "none", 
                  stroke: "currentColor", 
                  viewBox: "0 0 24 24" 
              }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }))
          ]),
          
          label && React.createElement(
            'label',
            { 
                key: 'label',
                htmlFor: inputId,
                className: 'fibo-textfield-label' 
            },
            label
          ),
          
          isOpen && React.createElement('div', {
              key: 'dropdown',
              className: 'absolute z-50 w-full mt-1 bg-[var(--fibo-surface)] border border-[var(--fibo-outline)] rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none'
          }, options.map((opt: Option) => {
               const selected = isSelected(opt.value);
               return React.createElement('div', {
                   key: opt.value,
                   className: `px-4 py-2 cursor-pointer text-sm hover:bg-[var(--fibo-primary-container)] hover:text-[var(--fibo-on-primary-container)] flex items-center justify-between ${selected ? 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] font-medium' : 'text-[var(--fibo-on-surface)]'}`,
                   onClick: () => handleSelect(opt.value)
               }, [
                   React.createElement('span', { key: 'label' }, opt.label),
                   selected && React.createElement('svg', { 
                       key: 'check',
                       className: "w-4 h-4 text-[var(--fibo-primary)]",
                       viewBox: "0 0 20 20",
                       fill: "currentColor"
                   }, React.createElement('path', { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }))
               ])
          }))
      ]),
      
      error && React.createElement(
        'span',
        { className: 'text-[var(--fibo-error)] text-xs mt-1 ml-1' },
        error
      )
    );
});

class SelectBuilder extends FiboBuilder {
  private _value: string | string[] = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _disabled: boolean = false;
  private _error?: string;
  private _multiple: boolean = false;
  private _options: Option[] = [];
  private _onChange?: (value: string | string[]) => void;

  value(val: string | string[]): this {
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

  options(opts: Option[]): this {
      this._options = opts;
      return this;
  }
  
  multiple(val: boolean = true): this {
      this._multiple = val;
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

  onChange(handler: (value: string | string[]) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const containerClass = twMerge('fibo-textfield-container relative', ...this._classNames);

    const props = {
        containerClass,
        containerStyle: this.getStyle(),
        label: this._label,
        error: this._error,
        value: this._value,
        placeholder: this._placeholder,
        options: this._options,
        disabled: this._disabled,
        multiple: this._multiple,
        onChange: this._onChange,
        ...this._props
    };

    return React.createElement(SelectInner, props);
  }
}


export const Select = createBuilder(SelectBuilder);

export interface SelectProps extends BaseProps {
  value: string | string[];
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  options: Option[];
  onChange?: (value: string | string[]) => void;
}
