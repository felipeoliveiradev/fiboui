import React, { ReactElement, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';

interface Option {
  label: string;
  value: string;
}

interface ComboboxInnerProps {
  containerClass?: string;
  containerStyle?: React.CSSProperties;
  label?: string;
  error?: string;
  value?: string | string[];
  options?: Option[];
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
  onAdd?: (newLabel: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  id?: string;
}

const ComboboxInner = React.memo((props: ComboboxInnerProps) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const listboxId = `${inputId}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlighted, setHighlighted] = useState(0);
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
    } = props;

    useEffect(() => {
        if (!multiple) {
            const selected = options.find((o) => o.value === value);
            if (selected && !isOpen && searchTerm !== selected.label) {
                setSearchTerm(selected.label);
            }
        }
    }, [value, options, isOpen, multiple]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setHighlighted(0);
    }, [searchTerm, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (!multiple) {
                    const selected = options.find((o) => o.value === value);
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

    const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) setIsOpen(true);
                else if (filteredOptions.length) setHighlighted((i) => (i + 1) % filteredOptions.length);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) setIsOpen(true);
                else if (filteredOptions.length) setHighlighted((i) => (i - 1 + filteredOptions.length) % filteredOptions.length);
                break;
            case 'Enter':
                event.preventDefault();
                if (filteredOptions[highlighted]) {
                    handleSelect(filteredOptions[highlighted]);
                } else if (searchTerm && onAdd) {
                    handleAdd();
                }
                break;
            case 'Escape':
                event.preventDefault();
                setIsOpen(false);
                break;
            default:
                break;
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
          React.createElement('div', {
              key: 'field',
              className: `fibo-textfield-input flex flex-wrap items-center gap-1 ${isOpen ? 'ring-2 ring-[var(--fibo-primary-container)] border-[var(--fibo-primary)]' : ''}`,
              style: { minHeight: '42px', padding: '4px 8px' }
          }, [
              multiple && Array.isArray(value) && value.map((val: string) => {
                  const opt = options.find((o) => o.value === val);
                  const labelStr = opt ? opt.label : val;
                  return React.createElement('span', {
                      key: val,
                      className: 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] text-xs font-medium px-2 py-1 rounded-md flex items-center'
                  }, [
                      labelStr,
                      React.createElement('button', {
                          type: 'button',
                          className: 'ml-1 hover:text-[var(--fibo-primary)] focus:outline-none',
                          'aria-label': `Remove ${labelStr}`,
                          onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleRemoveTag(val); }
                      }, '×')
                  ]);
              }),

              React.createElement('input', {
                  key: 'input',
                  id: inputId,
                  role: 'combobox',
                  'aria-expanded': isOpen,
                  'aria-controls': listboxId,
                  'aria-autocomplete': 'list',
                  'aria-activedescendant': isOpen && filteredOptions[highlighted] ? `${listboxId}-opt-${filteredOptions[highlighted].value}` : undefined,
                  className: 'bg-transparent outline-none flex-1 min-w-[60px] text-sm h-8',
                  value: searchTerm,
                  placeholder: (multiple && Array.isArray(value) && value.length > 0) ? '' : (placeholder || ' '),
                  disabled: disabled,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(e.target.value);
                      if (!isOpen) setIsOpen(true);
                  },
                  onFocus: () => setIsOpen(true),
                  onKeyDown: onInputKeyDown,
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
              id: listboxId,
              role: 'listbox',
              'aria-multiselectable': multiple || undefined,
              className: 'absolute z-50 w-full mt-1 bg-[var(--fibo-surface)] border border-[var(--fibo-outline)] rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none left-0'
          }, [
              ...(filteredOptions.length > 0
                ? filteredOptions.map((opt, index) => {
                   const selected = isSelected(opt.value);
                   const active = index === highlighted;
                   return React.createElement('div', {
                       key: opt.value,
                       id: `${listboxId}-opt-${opt.value}`,
                       role: 'option',
                       'aria-selected': selected,
                       className: `px-4 py-2 cursor-pointer text-sm hover:bg-[var(--fibo-primary-container)] hover:text-[var(--fibo-on-primary-container)] ${selected || active ? 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] font-medium' : 'text-[var(--fibo-on-surface)]'} ${selected ? 'opacity-50' : ''}`,
                       onClick: () => !selected && handleSelect(opt),
                       onMouseEnter: () => setHighlighted(index)
                   }, opt.label);
                })
                : [React.createElement('div', { key: 'empty', className: 'px-4 py-2 text-sm text-gray-500' }, 'No results found.')]),

              searchTerm && !filteredOptions.some((o) => o.label.toLowerCase() === searchTerm.toLowerCase()) && onAdd
                ? React.createElement('div', {
                   key: 'add-new',
                   role: 'option',
                   'aria-selected': false,
                   className: 'border-t border-[var(--fibo-outline)] px-4 py-2 cursor-pointer text-sm text-[var(--fibo-primary)] hover:bg-[var(--fibo-primary-container)] font-medium flex items-center',
                   onClick: handleAdd
              }, [
                  React.createElement('span', { key: 'plus', className: 'mr-1' }, '+'),
                  `Add "${searchTerm}"`
              ])
                : null
          ])
      ]),

      error && React.createElement(
        'span',
        { className: 'text-[var(--fibo-error)] text-xs mt-1 ml-1', role: 'alert' },
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

    const props: ComboboxInnerProps = {
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
        ...(this._props as ComboboxInnerProps)
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
