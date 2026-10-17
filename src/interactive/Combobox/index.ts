'use client';

import React, { ReactElement, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
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
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function hiddenSlots(value: string | string[] | undefined, multiple?: boolean): string[] {
  if (multiple) {
    if (Array.isArray(value) && value.length > 0) return value;
    if (typeof value === 'string' && value !== '') return [value];
    return [''];
  }
  return [serializeComboboxValue(value)];
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
    const [browseUnlocked, setBrowseUnlocked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLInputElement>(null);
    const syncingRef = useRef(false);
    const selectFrameRef = useRef<number | null>(null);

    const cancelPendingSelect = () => {
        if (selectFrameRef.current == null) return;
        cancelAnimationFrame(selectFrameRef.current);
        selectFrameRef.current = null;
    };

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
    const initialValueRef = useRef(value ?? (multiple ? [] : ''));

    useEffect(() => {
        if (!multiple) {
            const selected = options.find((o) => o.value === currentValue);
            if (selected && !isOpen && searchTerm !== selected.label) {
                setSearchTerm(selected.label);
            }
        }
    }, [currentValue, options, isOpen, multiple]);

    // While browsing a committed single value, list every option until the user types.
    const filteredOptions =
      !multiple && isOpen && !browseUnlocked
        ? options
        : options.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          );

    useEffect(() => {
        setHighlighted(0);
    }, [searchTerm, isOpen]);

    const restoreSearchTerm = () => {
        if (!multiple) {
            const selected = options.find((o) => o.value === currentValue);
            setSearchTerm(selected ? selected.label : '');
        } else {
            setSearchTerm('');
        }
    };

    const closeList = () => {
        setIsOpen(false);
        setBrowseUnlocked(false);
        restoreSearchTerm();
    };

    const openList = () => {
        if (disabled) return;
        setBrowseUnlocked(false);
        setIsOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeList();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            cancelPendingSelect();
        };
    }, [currentValue, options, multiple]);

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
            const first = serializeComboboxValue(initial);
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

    const writeHidden = (next: string | string[]) => {
        const input = hiddenRef.current;
        if (!input) return;
        const first = serializeComboboxValue(next);
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
        if (!controlled) {
            setLocalValue(next);
        }
        writeHidden(next);
        onChange?.(next);
    };

    const handleSelect = (opt: Option) => {
        if (disabled) return;
        if (multiple) {
             const currentValues = Array.isArray(currentValue) ? [...currentValue] : [];
             if (!currentValues.includes(opt.value)) {
                 currentValues.push(opt.value);
                 commitValue(currentValues);
             }
             setSearchTerm('');
             setBrowseUnlocked(false);
        } else {
            setSearchTerm(opt.label);
            commitValue(opt.value);
            setIsOpen(false);
            setBrowseUnlocked(false);
        }
    };

    const handleRemoveTag = (valToRemove: string) => {
        if (disabled) return;
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
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            cancelPendingSelect();
        }
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) openList();
                else if (filteredOptions.length) setHighlighted((i) => (i + 1) % filteredOptions.length);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (!isOpen) openList();
                else if (filteredOptions.length) setHighlighted((i) => (i - 1 + filteredOptions.length) % filteredOptions.length);
                break;
            case 'Enter': {
                if (!isOpen) break;
                const toCommit = filteredOptions[highlighted];
                if (toCommit) {
                    event.preventDefault();
                    handleSelect(toCommit);
                } else if (searchTerm && onAdd) {
                    event.preventDefault();
                    handleAdd();
                }
                break;
            }
            case 'Escape':
                if (!isOpen) break;
                event.preventDefault();
                closeList();
                break;
            case 'Tab':
                closeList();
                break;
            default:
                break;
        }
    };

    const onContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        if (next && containerRef.current?.contains(next)) return;
        if (!next) return;
        closeList();
    };

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
                          disabled: !!disabled,
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
                      cancelPendingSelect();
                      let next = e.target.value;
                      // Closed-field input holds the committed label. A first
                      // keystroke must start a new query (mouseup often collapses
                      // select-all, so the DOM value is `Label` + char).
                      if (!multiple && !browseUnlocked) {
                          const selected = options.find((o) => o.value === currentValue);
                          const label = selected?.label ?? '';
                          if (label.length > 0 && next.length === label.length + 1) {
                              if (next.startsWith(label)) next = next.slice(label.length);
                              else if (next.endsWith(label)) next = next.slice(0, 1);
                          }
                      }
                      setBrowseUnlocked(true);
                      setSearchTerm(next);
                      if (!isOpen) setIsOpen(true);
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      openList();
                      const el = e.currentTarget;
                      cancelPendingSelect();
                      selectFrameRef.current = requestAnimationFrame(() => {
                          selectFrameRef.current = null;
                          if (document.activeElement === el) el.select();
                      });
                  },
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
    bindInterp(this, val);
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    bindInterp(this, val);
    return this;
  }

  /** HTML `name` — renders a hidden input so `Form` FormData includes the committed value. */
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

  onAdd(handler: (newLabel: string) => void): this {
      this._onAdd = handler;
      return this;
  }

  build(): ReactElement {
    const containerClass = twMerge('fibo-textfield-container relative', ...this._classNames);

    const props: ComboboxInnerProps = {
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
