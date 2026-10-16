'use client';

import React, { ReactElement, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';
import type { FieldRule } from '../Form/validators';

interface Option {
  label: string;
  value: string;
}

interface SelectInnerProps {
  containerClass?: string;
  containerStyle?: React.CSSProperties;
  label?: string;
  error?: string;
  value?: string | string[];
  options?: Option[];
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  id?: string;
  name?: string;
  controlled?: boolean;
  rules?: FieldRule[];
}

function serializeSelectValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

const SelectInner = React.memo((props: SelectInnerProps) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const listboxId = `${inputId}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
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
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const isSelected = (val: string) => {
        if (multiple) {
            return Array.isArray(currentValue) && currentValue.includes(val);
        }
        return currentValue === val;
    };

    let displayText = '';
    if (multiple) {
        if (Array.isArray(currentValue) && currentValue.length > 0) {
           displayText = options
               .filter((opt) => currentValue.includes(opt.value))
               .map((opt) => opt.label)
               .join(', ');
        }
    } else {
        const selectedOption = options.find((opt) => opt.value === currentValue);
        displayText = selectedOption ? selectedOption.label : '';
    }

    const handleSelect = (val: string) => {
        if (disabled) return;

        let next: string | string[];
        if (multiple) {
            const currentValues = Array.isArray(currentValue) ? [...currentValue] : [];
            const index = currentValues.indexOf(val);
            if (index > -1) {
                currentValues.splice(index, 1);
            } else {
                currentValues.push(val);
            }
            next = currentValues;
        } else {
            next = val;
            setIsOpen(false);
        }

        if (!controlled) {
            setLocalValue(next);
        }
        onChange?.(next);
    };

    const moveHighlight = (delta: number) => {
        if (options.length === 0) return;
        setHighlighted((prev) => (prev + delta + options.length) % options.length);
    };

    const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) setIsOpen(true);
                else moveHighlight(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) setIsOpen(true);
                else moveHighlight(-1);
                break;
            case 'Home':
                event.preventDefault();
                setHighlighted(0);
                break;
            case 'End':
                event.preventDefault();
                setHighlighted(Math.max(0, options.length - 1));
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else if (options[highlighted]) {
                    handleSelect(options[highlighted].value);
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
                value: serializeSelectValue(currentValue),
              })
            : null,

          React.createElement('button', {
              key: 'trigger',
              id: inputId,
              type: 'button',
              role: 'combobox',
              'aria-expanded': isOpen,
              'aria-haspopup': 'listbox',
              'aria-controls': listboxId,
              'aria-activedescendant': isOpen && options[highlighted] ? `${listboxId}-opt-${options[highlighted].value}` : undefined,
              disabled: disabled,
              className: `fibo-textfield-input text-left w-full flex items-center justify-between ${!displayText ? 'text-gray-400' : ''}`,
              onClick: () => !disabled && setIsOpen(!isOpen),
              onKeyDown: onTriggerKeyDown,
          }, [
              React.createElement('span', { key: 'text', className: 'truncate' }, displayText || placeholder || ' '),
              React.createElement('svg', {
                  key: 'icon',
                  className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  'aria-hidden': true
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
              id: listboxId,
              role: 'listbox',
              'aria-multiselectable': multiple || undefined,
              className: 'absolute z-50 w-full mt-1 bg-[var(--fibo-surface)] border border-[var(--fibo-outline)] rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none'
          }, options.map((opt, index) => {
               const selected = isSelected(opt.value);
               const active = index === highlighted;
               return React.createElement('div', {
                   key: opt.value,
                   id: `${listboxId}-opt-${opt.value}`,
                   role: 'option',
                   'aria-selected': selected,
                   className: `px-4 py-2 cursor-pointer text-sm hover:bg-[var(--fibo-primary-container)] hover:text-[var(--fibo-on-primary-container)] flex items-center justify-between ${selected || active ? 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] font-medium' : 'text-[var(--fibo-on-surface)]'}`,
                   onClick: () => handleSelect(opt.value),
                   onMouseEnter: () => setHighlighted(index)
               }, [
                   React.createElement('span', { key: 'label' }, opt.label),
                   selected && React.createElement('svg', {
                       key: 'check',
                       className: "w-4 h-4 text-[var(--fibo-primary)]",
                       viewBox: "0 0 20 20",
                       fill: "currentColor",
                       'aria-hidden': true
                   }, React.createElement('path', { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }))
               ])
          }))
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

class SelectBuilder extends FiboBuilder {
  private _value: string | string[] = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _disabled: boolean = false;
  private _error?: string;
  private _multiple: boolean = false;
  private _options: Option[] = [];
  private _onChange?: (value: string | string[]) => void;
  private _name?: string;
  private _controlled = false;
  private _rules?: FieldRule[];

  value(val: string | string[]): this {
    this._value = val;
    return this;
  }

  /**
   * Force controlled selection from `.value()` / parent. Default keeps local
   * selection state so FormData / display update without a parent re-render.
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

  /** HTML `name` — renders a hidden input so `Form` FormData includes the selection. */
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

  build(): ReactElement {
    const containerClass = twMerge('fibo-textfield-container relative', ...this._classNames);

    const props: SelectInnerProps = {
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
        name: this._name,
        controlled: this._controlled,
        rules: this._rules,
        ...(this._props as SelectInnerProps)
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
  name?: string;
}
