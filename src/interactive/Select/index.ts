'use client';

import React, { ReactElement, useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { fiboCn as twMerge } from '../../core/cn';
import { BaseProps } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import type { FieldRule } from '../Form/validators';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
}

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
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
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function hiddenSlots(value: string | string[] | undefined, multiple?: boolean): string[] {
  if (multiple) {
    if (Array.isArray(value) && value.length > 0) return value;
    if (typeof value === 'string' && value !== '') return [value];
    return [''];
  }
  return [serializeSelectValue(value)];
}

function sameHiddenValue(a: string | string[], b: string | string[]): boolean {
  const aa = Array.isArray(a) ? a : [a];
  const bb = Array.isArray(b) ? b : [b];
  return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
}

function hiddenInputsIn(host: HTMLElement): HTMLInputElement[] {
  return [...host.querySelectorAll('input[type="hidden"]')] as HTMLInputElement[];
}

function parseHiddenGroup(
  host: HTMLElement | null,
  fallback: HTMLInputElement | null,
  multiple?: boolean
): string | string[] {
  const inputs = host ? hiddenInputsIn(host) : fallback ? [fallback] : [];
  const raw = inputs.map((el) => el.value);
  if (multiple) return [...new Set(raw.filter((v) => v !== ''))];
  return raw[0] ?? '';
}

const SelectInner = React.memo((props: SelectInnerProps) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;
    const listboxId = `${inputId}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const [formError, setFormError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLInputElement>(null);
    const syncingRef = useRef(false);

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
    const initialValueRef = useRef(value ?? (multiple ? [] : ''));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Uncontrolled: DOM owns the hidden value so Form.reset / Form.set stick.
    // Do not pass React `value` on the single hidden — jsdom would restore default on re-render.
    useEffect(() => {
        if (controlled) return;
        const input = hiddenRef.current;
        if (!input) return;
        const host = containerRef.current;

        if (input.getAttribute('data-fibo-seeded') == null) {
            const initialVals = hiddenSlots(initialValueRef.current, multiple);
            const inputs = host ? hiddenInputsIn(host) : [input];
            syncingRef.current = true;
            inputs.forEach((el, i) => {
                const v = initialVals[i] ?? '';
                el.defaultValue = v;
                el.value = v;
            });
            syncingRef.current = false;
            input.setAttribute('data-fibo-seeded', '1');
        }

        const syncFromDom = () => {
            if (syncingRef.current) return;
            const next = parseHiddenGroup(host, input, multiple);
            setLocalValue((prev) => (sameHiddenValue(prev, next) ? prev : next));
        };
        const onFormReset = () => {
            // type=hidden: value reflects the content attribute, so native reset is a no-op.
            const initial = initialValueRef.current;
            const first = serializeSelectValue(initial);
            syncingRef.current = true;
            if (input.value !== first) input.value = first;
            syncingRef.current = false;
            setLocalValue(initial);
        };

        input.addEventListener('fibo-sync', syncFromDom);
        const form = input.closest('form');
        form?.addEventListener('reset', onFormReset);

        const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if (proto?.get && proto.set) {
            Object.defineProperty(input, 'value', {
                configurable: true,
                enumerable: true,
                get() {
                    return proto.get!.call(this);
                },
                set(v: string) {
                    proto.set!.call(this, v);
                    if (syncingRef.current) return;
                    if (multiple) {
                        const next = v === '' ? [] : [v];
                        setLocalValue((prev) => (sameHiddenValue(prev, next) ? prev : next));
                    } else {
                        syncFromDom();
                    }
                },
            });
        }

        return () => {
            input.removeEventListener('fibo-sync', syncFromDom);
            form?.removeEventListener('reset', onFormReset);
            if (proto) {
                Object.defineProperty(input, 'value', {
                    configurable: true,
                    enumerable: proto.enumerable,
                    get: proto.get,
                    set: proto.set,
                });
            }
        };
    }, [controlled, multiple, name]);

    useEffect(() => {
        const input = hiddenRef.current;
        if (!input) return;
        if (rules) {
            (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules = rules;
        } else {
            delete (input as unknown as { __fiboRules?: FieldRule[] }).__fiboRules;
        }
        const host = (input.closest('.fibo-textfield-container') ?? containerRef.current) as
            | HTMLElement
            | null;
        if (host) {
            (host as unknown as { __fiboShowError?: (msg: string | null) => void }).__fiboShowError = (
                message
            ) => {
                setFormError(message);
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

    const writeHidden = (next: string | string[]) => {
        const input = hiddenRef.current;
        if (!input) return;
        const first = serializeSelectValue(next);
        const host = containerRef.current;
        syncingRef.current = true;
        if (input.value !== first) input.value = first;
        if (host && multiple && Array.isArray(next)) {
            hiddenInputsIn(host).forEach((el, i) => {
                const v = next[i] ?? '';
                if (el.value !== v) el.value = v;
            });
        }
        syncingRef.current = false;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const commitValue = (next: string | string[]) => {
        setFormError(null);
        if (!controlled) {
            setLocalValue(next);
        }
        writeHidden(next);
        onChange?.(next);
    };

    const handleSelect = (val: string) => {
        if (disabled) return;
        const opt = options.find((o) => o.value === val);
        if (opt?.disabled) return;

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

        commitValue(next);
    };

    const enabledIndexes = () =>
        options.map((opt, i) => (opt.disabled ? -1 : i)).filter((i) => i >= 0);

    const indexOfCurrent = () => {
        const enabled = enabledIndexes();
        const fallback = enabled[0] ?? 0;
        if (options.length === 0) return 0;
        if (multiple) {
            const selected = Array.isArray(currentValue) ? currentValue : [];
            const idx = options.findIndex((opt) => selected.includes(opt.value) && !opt.disabled);
            return idx >= 0 ? idx : fallback;
        }
        const idx = options.findIndex((opt) => opt.value === currentValue && !opt.disabled);
        return idx >= 0 ? idx : fallback;
    };

    const openList = () => {
        setHighlighted(indexOfCurrent());
        setIsOpen(true);
    };

    const moveHighlight = (delta: number) => {
        const enabled = enabledIndexes();
        if (enabled.length === 0) return;
        setHighlighted((prev) => {
            if (enabled.includes(prev)) {
                const pos = enabled.indexOf(prev);
                return enabled[(pos + delta + enabled.length) % enabled.length];
            }
            if (delta > 0) {
                return enabled.find((i) => i > prev) ?? enabled[0];
            }
            return [...enabled].reverse().find((i) => i < prev) ?? enabled[enabled.length - 1];
        });
    };

    const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) openList();
                else moveHighlight(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) openList();
                else moveHighlight(-1);
                break;
            case 'Home':
                event.preventDefault();
                setHighlighted(enabledIndexes()[0] ?? 0);
                break;
            case 'End': {
                event.preventDefault();
                const enabled = enabledIndexes();
                setHighlighted(enabled[enabled.length - 1] ?? Math.max(0, options.length - 1));
                break;
            }
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!isOpen) {
                    openList();
                } else if (options[highlighted] && !options[highlighted].disabled) {
                    handleSelect(options[highlighted].value);
                }
                break;
            case 'Escape':
                event.preventDefault();
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const onContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        if (next && containerRef.current?.contains(next)) return;
        if (!next) return;
        setIsOpen(false);
    };

    const shownError = (error && error.length > 0 ? error : null) || formError || '';
    const errId = name ? `fibo-err-${name}` : `${inputId}-error`;
    const invalid = shownError.length > 0;

    return React.createElement(
      'div',
      {
          ref: containerRef,
          className: containerClass,
          style: containerStyle,
          onBlur: onContainerBlur,
      },
      React.createElement('div', { className: 'relative w-full h-full' }, [
          ...(name
            ? hiddenSlots(currentValue, multiple).map((v, i) =>
                React.createElement('input', {
                  key: multiple ? `hidden-${i}` : 'hidden',
                  ref: i === 0 ? hiddenRef : undefined,
                  type: 'hidden',
                  name,
                  disabled: !!disabled,
                  ...(controlled
                    ? { value: v }
                    : multiple
                      ? { defaultValue: v }
                      : null),
                })
              )
            : [null]),

          React.createElement('button', {
              key: 'trigger',
              id: inputId,
              type: 'button',
              role: 'combobox',
              'aria-expanded': isOpen,
              'aria-haspopup': 'listbox',
              'aria-controls': listboxId,
              'aria-activedescendant': isOpen && options[highlighted] ? `${listboxId}-opt-${options[highlighted].value}` : undefined,
              'aria-invalid': invalid ? true : undefined,
              'aria-describedby': invalid ? errId : undefined,
              disabled: disabled,
              className: `fibo-textfield-input text-left w-full flex items-center justify-between ${!displayText ? 'text-gray-400' : ''}`,
              onClick: () => {
                if (disabled) return;
                if (isOpen) setIsOpen(false);
                else openList();
              },
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
               const optDisabled = !!opt.disabled;
               return React.createElement('div', {
                   key: opt.value,
                   id: `${listboxId}-opt-${opt.value}`,
                   role: 'option',
                   'aria-selected': selected,
                   'aria-disabled': optDisabled || undefined,
                   className: `px-4 py-2 text-sm flex items-center justify-between ${optDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--fibo-primary-container)] hover:text-[var(--fibo-on-primary-container)]'} ${!optDisabled && (selected || active) ? 'bg-[var(--fibo-primary-container)] text-[var(--fibo-on-primary-container)] font-medium' : 'text-[var(--fibo-on-surface)]'}`,
                   onClick: () => handleSelect(opt.value),
                   onMouseEnter: () => {
                       if (!optDisabled) setHighlighted(index);
                   }
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
          id: errId,
          className: 'fibo-field-error text-[var(--fibo-error)] text-xs mt-1 ml-1',
          style: { display: shownError ? '' : 'none' },
          role: 'alert',
        },
        shownError
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
    bindInterp(this, val);
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    bindInterp(this, val);
    return this;
  }

  /** HTML `name` — renders a hidden input so `Form` FormData includes the selection. */
  name(val: string): this {
    this._name = val;
    return this;
  }

  options(opts: Option[]): this {
      this._options = opts;
      for (const opt of opts) bindInterp(this, opt.label);
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
    bindInterp(this, val);
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
        label: resolveInterp(this._label),
        error: resolveInterp(this._error),
        value: this._value,
        placeholder: resolveInterp(this._placeholder),
        options: this._options.map((opt) => ({
          ...opt,
          label: resolveInterp(opt.label) ?? opt.label,
        })),
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
