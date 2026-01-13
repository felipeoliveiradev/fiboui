import React, { ReactElement, useState, useRef, useEffect, ChangeEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';

interface Option {
  label: string;
  value: string;
}

const ComboboxInner = React.memo((props: any) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
        onAdd,
        disabled,
        multiple,
        ...rest
    } = props;

    useEffect(() => {
        if (!multiple) {
            const selected = props.options.find((o: Option) => o.value === props.value);
            if (selected && !isOpen && searchTerm !== selected.label) {
                setSearchTerm(selected.label);
            }
        }
    }, [props.value, props.options, isOpen, multiple]);

    const filteredOptions = options.filter((opt: Option) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (!multiple) {
                    const selected = options.find((o: Option) => o.value === value);
                    setSearchTerm(selected ? selected.label : '');
                } else {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options, multiple]);

    const handleSelect = (opt: Option) => {
        if (multiple) {
             const currentValues = Array.isArray(value) ? [...value] : [];
             if (!currentValues.includes(opt.value)) {
                 currentValues.push(opt.value);
                 onChange?.(currentValues);
             }
             setSearchTerm('');
        } else {
            setSearchTerm(opt.label);
            onChange?.(opt.value);
            setIsOpen(false);
        }
    };

    const handleRemoveTag = (valToRemove: string) => {
        if (multiple && Array.isArray(value)) {
            const newValues = value.filter(v => v !== valToRemove);
            onChange?.(newValues);
        }
    };

    const handleAdd = () => {
        onAdd?.(searchTerm);
        if (multiple) {
             setSearchTerm('');
        } else {
             setIsOpen(false);
        }
    };

    const isSelected = (val: string) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(val);
        }
        return value === val;
    };

    return React.createElement(
      'div',
      {
          ref: containerRef,
          className: containerClass,
          style: containerStyle
      },
      React.createElement('div', { className: 'relative w-full h-full' }, [
          React.createElement('div', {
              className: `fibo-textfield-input flex flex-wrap items-center gap-1 ${isOpen ? 'ring-2 ring-[var(--fibo-primary-container)] border-[var(--fibo-primary)]' : ''}`,
              style: { minHeight: '42px', padding: '4px 8px' }
          }, [
              multiple && Array.isArray(value) && value.map((val: string) => {
                  const opt = options.find((o: Option) => o.value === val);
                  const labelStr = opt ? opt.label : val;
                  return React.createElement('span', {
                      key: val,
                      className: 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] text-xs font-medium px-2 py-1 rounded-md flex items-center'
                  }, [
                      labelStr,
                      React.createElement('button', {
                          type: 'button',
                          className: 'ml-1 hover:text-[var(--fibo-primary)] focus:outline-none',
                          onClick: (e: any) => { e.stopPropagation(); handleRemoveTag(val); }
                      }, '×')
                  ]);
              }),

              React.createElement('input', {
                  key: 'input',
                  id: inputId,
                  className: 'bg-transparent outline-none flex-1 min-w-[60px] text-sm h-8',
                  value: searchTerm,
                  placeholder: (multiple && Array.isArray(value) && value.length > 0) ? '' : (placeholder || ' '),
                  disabled: disabled,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(e.target.value);
                      if (!isOpen) setIsOpen(true);
                  },
                  onFocus: () => setIsOpen(true),
                  ...rest
              })
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
              className: 'absolute z-50 w-full mt-1 bg-[var(--fibo-surface)] border border-[var(--fibo-outline)] rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none left-0'
          }, [
              filteredOptions.length > 0 ?
                filteredOptions.map((opt: Option) => {
                   const selected = isSelected(opt.value);
                   return React.createElement('div', {
                       key: opt.value,
                       className: `px-4 py-2 cursor-pointer text-sm hover:bg-[var(--fibo-primary-container)] hover:text-[var(--fibo-on-primary-container)] ${selected ? 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] font-medium opacity-50' : 'text-[var(--fibo-on-surface)]'}`,
                       onClick: () => !selected && handleSelect(opt)
                   }, opt.label);
                }) :
                React.createElement('div', { className: 'px-4 py-2 text-sm text-gray-500' }, 'No results found.'),

              searchTerm && !filteredOptions.some((o: Option) => o.label.toLowerCase() === searchTerm.toLowerCase()) && onAdd && React.createElement('div', {
                   key: 'add-new',
                   className: 'border-t border-[var(--fibo-outline)] px-4 py-2 cursor-pointer text-sm text-[var(--fibo-primary)] hover:bg-[var(--fibo-primary-container)] font-medium flex items-center',
                   onClick: handleAdd
              }, [
                  React.createElement('span', { className: 'mr-1' }, '+'),
                  `Add "${searchTerm}"`
              ])
          ])
      ]),

      error && React.createElement(
        'span',
        { className: 'text-[var(--fibo-error)] text-xs mt-1 ml-1' },
        error
      )
    );
});

class ComboboxBuilder extends FiboBuilder {
  private _value: string | string[] = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _disabled: boolean = false;
  private _error?: string;
  private _multiple: boolean = false;
  private _options: Option[] = [];
  private _onChange?: (value: string | string[]) => void;
  private _onAdd?: (newLabel: string) => void;

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

  onAdd(handler: (newLabel: string) => void): this {
      this._onAdd = handler;
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
        onAdd: this._onAdd,
        ...this._props
    };

    return React.createElement(ComboboxInner, props);
  }
}

export const Combobox = createBuilder(ComboboxBuilder);

export interface ComboboxProps extends BaseProps {
  value: string | string[];
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  options: Option[];
  onChange?: (value: string | string[]) => void;
  onAdd?: (newLabel: string) => void;
}
