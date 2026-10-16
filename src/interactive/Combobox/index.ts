'use client';

import React, { ReactElement, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';
import type { FieldRule } from '../Form/validators';

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
  name?: string;
  controlled?: boolean;
  rules?: FieldRule[];
}

function serializeComboboxValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

const ComboboxInner = React.memo((props: ComboboxInnerProps) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const listboxId = `${inputId}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
    // Search term stays controlled React state — needed for live filtering UI.
    // Do not try to make the filter box uncontrolled; only the committed value
    // participates in FormData via the hidden input below.
    const [searchTerm, setSearchTerm] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLInputElement>(null);

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
        name,
        controlled = false,
        rules,
    } = props;

    const [localValue, setLocalValue] = useState<string | string[]>(
      () => value ?? (multiple ? [] : '')
    );

    const currentValue = controlled ? (value ?? (multiple ? [] : '')) : localValue;

    useEffect(() => {
        if (!multiple) {
            const selected = options.find((o) => o.value === currentValue);
            if (selected && !isOpen && searchTerm !== selected.label) {
                setSearchTerm(selected.label);
            }
        }
    }, [currentValue, options, isOpen, multiple]);

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
                    const selected = options.find((o) => o.value === currentValue);
                    setSearchTerm(selected ? selected.label : '');
                } else {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [currentValue, options, multiple]);

    useEffect(() => {
        const input = hiddenRef.current;
        if (!input) return;
        if (rules) {
            (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
        }
        const host = input.closest('.fibo-textfield-container') as HTMLElement | null;
        const span = host?.querySelector('.fibo-field-error') as HTMLElement | null;
        if (host) {
            (host as unknown as { __fiboShowError?: (msg: string | null) => void }).__fiboShowError = (
                message
            ) => {
                if (!span) return;
                span.textContent = message ?? '';
                span.style.display = message ? '' : 'none';
            };
        }
    }, [rules]);

    const commitValue = (next: string | string[]) => {
        if (!controlled) {
            setLocalValue(next);
        }
        onChange?.(next);
    };

    const handleSelect = (opt: Option) => {
        if (multiple) {
             const currentValues = Array.isArray(currentValue) ? [...currentValue] : [];
             if (!currentValues.includes(opt.value)) {
                 currentValues.push(opt.value);
                 commitValue(currentValues);
             }
             setSearchTerm('');
        } else {
            setSearchTerm(opt.label);
            commitValue(opt.value);
            setIsOpen(false);
        }
    };

    const handleRemoveTag = (valToRemove: string) => {
        if (multiple && Array.isArray(currentValue)) {
            const newValues = currentValue.filter(v => v !== valToRemove);
            commitValue(newValues);
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
            return Array.isArray(currentValue) && currentValue.includes(val);
        }
        return currentValue === val;
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
          name
            ? React.createElement('input', {
                key: 'hidden',
                ref: hiddenRef,
                type: 'hidden',
                name,
                value: serializeComboboxValue(currentValue),
              })
            : null,

          React.createElement('div', {
              key: 'field',
              className: `fibo-textfield-input flex flex-wrap items-center gap-1 ${isOpen ? 'ring-2 ring-[var(--fibo-primary-container)] border-[var(--fibo-primary)]' : ''}`,
              style: { minHeight: '42px', padding: '4px 8px' }
          }, [
              multiple && Array.isArray(currentValue) && currentValue.map((val: string) => {
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
                  placeholder: (multiple && Array.isArray(currentValue) && currentValue.length > 0) ? '' : (placeholder || ' '),
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

      React.createElement(
        'span',
        {
          className: 'fibo-field-error text-[var(--fibo-error)] text-xs mt-1 ml-1',
          style: { display: error ? '' : 'none' },
          role: 'alert',
        },
        error || ''
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
  private _name?: string;
  private _controlled = false;
  private _rules?: FieldRule[];

  value(val: string | string[]): this {
    this._value = val;
    return this;
  }

  /**
   * Force controlled committed value from `.value()` / parent. Default keeps
   * local selection so FormData / tags update without a parent re-render.
   */
  controlled(enabled: boolean = true): this {
    this._controlled = enabled;
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

  /** HTML `name` — renders a hidden input so `Form` FormData includes the committed value. */
  name(val: string): this {
    this._name = val;
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

  /** Rules collected by `Form` on submit (attached to the hidden named input). */
  rules(...items: FieldRule[]): this {
    this._rules = items;
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
        name: this._name,
        controlled: this._controlled,
        rules: this._rules,
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
  name?: string;
}
