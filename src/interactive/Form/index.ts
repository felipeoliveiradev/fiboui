'use client';

import React, { FormEvent, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChildren } from '../../core/types';
import { twMerge } from 'tailwind-merge';
import {
  runFieldRules,
  type FieldErrors,
  type FieldRule,
  type FieldSchema,
} from './validators';

export type { FieldRule, FieldSchema, FieldErrors } from './validators';
export {
  required,
  minLength,
  maxLength,
  email,
  pattern,
  min,
  max,
  rule,
} from './validators';

/** Where failed rules are painted. */
export type FormErrorMode = 'field' | 'below' | 'manual';

const RULES_KEY = '__fiboRules';
const SHOW_ERROR_KEY = '__fiboShowError';
const FIBO_HOST_SELECTOR =
  '.fibo-textfield-container, .fibo-textarea-container, .fibo-checkbox-container, .fibo-switch-container, .fibo-radio-group';

export type FormValues = Record<string, string | string[]>;

/** Handle to the live `<form>` — works after async (event.currentTarget does not). */
export type FormControl = {
  element: HTMLFormElement;
  /** Reset every field, or one named field back to its default. */
  reset(name?: string): void;
  /** Set one named field's current value (uncontrolled inputs). */
  set(name: string, value: string): void;
  /** Last validation messages (empty when valid). */
  errors: FieldErrors;
};

/** Return value is ignored — fluent calls like `todos.add(...)` are fine. */
export type FormSubmitHandler = (
  values: FormValues,
  form: FormControl,
  event: FormEvent<HTMLFormElement>
) => unknown | Promise<unknown>;

/**
 * Runs before `onSubmit`. Return `false` to cancel submit
 * (and skip `onSubmit` / `afterSubmit`).
 */
export type FormBeforeSubmitHandler = (
  values: FormValues,
  form: FormControl,
  event: FormEvent<HTMLFormElement>
) => unknown | Promise<unknown>;

/** Runs after `onSubmit` completes successfully (not called if before cancels). */
export type FormAfterSubmitHandler = (
  values: FormValues,
  form: FormControl,
  event: FormEvent<HTMLFormElement>
) => unknown | Promise<unknown>;

function namedFields(form: HTMLFormElement, name: string) {
  const safe = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/"/g, '\\"');
  return form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `[name="${safe}"]`
  );
}

function escapeName(name: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/"/g, '\\"');
}

function errorId(name: string): string {
  return `fibo-err-${name}`;
}

function isDisabledControl(el: Element): boolean {
  return (
    (el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLButtonElement) &&
    el.disabled
  );
}

/** True when the field exists in the DOM and every named control is disabled. */
function isFieldFullyDisabled(form: HTMLFormElement, name: string): boolean {
  const fields = namedFields(form, name);
  return fields.length > 0 && Array.from(fields).every(isDisabledControl);
}

function clearControlAria(el: HTMLElement) {
  el.removeAttribute('aria-invalid');
  el.removeAttribute('aria-describedby');
}

function setControlInvalid(el: HTMLElement, name: string) {
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', errorId(name));
}

function hostShowError(host: HTMLElement): ((msg: string | null) => void) | undefined {
  return (host as unknown as Record<string, ((msg: string | null) => void) | undefined>)[
    SHOW_ERROR_KEY
  ];
}

export function createFormControl(form: HTMLFormElement): FormControl {
  return {
    element: form,
    reset(name?: string) {
      if (!name) {
        form.reset();
        return;
      }
      namedFields(form, name).forEach((el) => {
        if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
          el.checked = el.defaultChecked;
          el.dispatchEvent(new Event('fibo-sync', { bubbles: true }));
        } else if ('defaultValue' in el) {
          el.value = el.defaultValue ?? '';
        } else {
          el.value = '';
        }
      });
    },
    set(name: string, value: string) {
      namedFields(form, name).forEach((el) => {
        if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
          el.checked = value === 'true' || value === 'on' || value === el.value;
          el.dispatchEvent(new Event('fibo-sync', { bubbles: true }));
        } else {
          el.value = value;
        }
      });
    },
    errors: {},
  };
}

function collectDomRules(form: HTMLFormElement): Map<string, FieldRule[]> {
  const map = new Map<string, FieldRule[]>();
  form.querySelectorAll<HTMLElement>('[name]').forEach((el) => {
    if (isDisabledControl(el)) return;
    const name = (el as HTMLInputElement).name;
    const rules = (el as unknown as Record<string, FieldRule[] | undefined>)[RULES_KEY];
    if (name && rules && rules.length) {
      map.set(name, [...(map.get(name) ?? []), ...rules]);
    }
  });
  return map;
}

function paintFieldError(form: HTMLFormElement, name: string, message: string, mode: FormErrorMode) {
  if (mode === 'manual') return;
  const el = namedFields(form, name)[0];
  if (!el) return;
  const host = (el.closest(FIBO_HOST_SELECTOR) ?? el.parentElement ?? el) as HTMLElement &
    Record<string, ((msg: string | null) => void) | undefined>;
  const errId = errorId(name);

  if (mode === 'field' && typeof host[SHOW_ERROR_KEY] === 'function') {
    host[SHOW_ERROR_KEY]!(message || null);
    const fieldErr = host.querySelector('.fibo-field-error') as HTMLElement | null;
    if (fieldErr) fieldErr.id = errId;
    const generic = host.nextElementSibling;
    if (generic?.classList.contains('fibo-form-error')) generic.remove();
    if (message) setControlInvalid(el, name);
    else clearControlAria(el);
    return;
  }

  if (typeof host[SHOW_ERROR_KEY] === 'function') {
    host[SHOW_ERROR_KEY]!(null);
  }

  let node = host.nextElementSibling as HTMLElement | null;
  if (!message) {
    if (node?.classList.contains('fibo-form-error')) node.remove();
    clearControlAria(el);
    return;
  }
  if (!node?.classList.contains('fibo-form-error')) {
    node = document.createElement('p');
    node.className = 'fibo-form-error';
    node.setAttribute('data-for', name);
    node.style.margin = '4px 0 0';
    node.style.fontSize = '12px';
    node.style.color = 'var(--fibo-error, #b91c1c)';
    host.insertAdjacentElement('afterend', node);
  }
  node.id = errId;
  node.textContent = message;
  setControlInvalid(el, name);
}

function clearPaintedErrorForField(form: HTMLFormElement, name: string) {
  const safe = escapeName(name);
  form.querySelectorAll(`.fibo-form-error[data-for="${safe}"]`).forEach((n) => n.remove());
  namedFields(form, name).forEach((el) => {
    clearControlAria(el);
    const host = el.closest(FIBO_HOST_SELECTOR) as HTMLElement | null;
    if (host) hostShowError(host)?.(null);
  });
}

function clearPaintedErrors(form: HTMLFormElement) {
  form.querySelectorAll('.fibo-form-error').forEach((n) => n.remove());
  form.querySelectorAll<HTMLElement>(FIBO_HOST_SELECTOR).forEach((host) => {
    hostShowError(host)?.(null);
  });
  form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach(clearControlAria);
}

/** Flatten FormData into a plain object (multi-value keys → string[]). */
export function formDataToValues(fd: FormData): FormValues {
  const out: FormValues = {};
  fd.forEach((entry, key) => {
    const v = typeof entry === 'string' ? entry : entry.name;
    if (Object.prototype.hasOwnProperty.call(out, key)) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, v] : [prev, v];
    } else {
      out[key] = v;
    }
  });
  return out;
}

function filterDisabledSchema(
  form: HTMLFormElement,
  schema: FieldSchema,
  extra: Map<string, FieldRule[]>
): { schema: FieldSchema; extra: Map<string, FieldRule[]> } {
  const nextSchema: FieldSchema = {};
  for (const [name, rules] of Object.entries(schema)) {
    if (!isFieldFullyDisabled(form, name)) nextSchema[name] = rules;
  }
  const nextExtra = new Map<string, FieldRule[]>();
  for (const [name, rules] of extra) {
    if (!isFieldFullyDisabled(form, name)) nextExtra.set(name, rules);
  }
  return { schema: nextSchema, extra: nextExtra };
}

const FormInner = React.memo((props: {
  className?: string;
  style?: React.CSSProperties;
  gap?: number | string;
  onSubmitForm?: FormSubmitHandler;
  beforeSubmit?: FormBeforeSubmitHandler;
  afterSubmit?: FormAfterSubmitHandler;
  validation?: FieldSchema;
  errorMode?: FormErrorMode;
  onInvalid?: (errors: FieldErrors, form: FormControl) => unknown;
  action?: string;
  method?: string;
  noValidate?: boolean;
  children?: ReactNode;
  [key: string]: unknown;
}) => {
  const {
    className,
    style,
    gap,
    onSubmitForm,
    beforeSubmit,
    afterSubmit,
    validation,
    errorMode = 'field',
    onInvalid,
    action,
    method = 'post',
    noValidate = true,
    children,
    ...rest
  } = props;

  const mergedStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    ...(gap != null
      ? { gap: typeof gap === 'number' ? `${gap}px` : gap }
      : null),
    ...style,
  };

  const handleLiveClear = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      )
    ) {
      return;
    }
    const name = target.name;
    if (!name) return;
    clearPaintedErrorForField(e.currentTarget, name);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = formDataToValues(new FormData(form));

    const control = createFormControl(form);
    clearPaintedErrors(form);

    const { schema, extra } = filterDisabledSchema(
      form,
      validation ?? {},
      collectDomRules(form)
    );
    const errors = runFieldRules(values, schema, extra);
    control.errors = errors;
    if (Object.keys(errors).length > 0) {
      for (const [name, message] of Object.entries(errors)) {
        paintFieldError(form, name, message, errorMode);
      }
      onInvalid?.(errors, control);
      return;
    }

    void (async () => {
      if (beforeSubmit) {
        const allow = await beforeSubmit(values, control, e);
        if (allow === false) return;
      }

      if (onSubmitForm) {
        await onSubmitForm(values, control, e);
      }

      if (afterSubmit) {
        await afterSubmit(values, control, e);
      }
    })();
  };

  return React.createElement(
    'form',
    {
      className: twMerge('fibo-form', className),
      style: mergedStyle,
      action,
      method,
      ...rest,
      // After rest so callers cannot strip validation / live-clear wiring.
      noValidate,
      onSubmit: handleSubmit,
      onInputCapture: handleLiveClear,
      onChangeCapture: handleLiveClear,
    },
    children
  );
});

FormInner.displayName = 'Form';

/**
 * Native `<form>` wrapper — Flutter/SwiftUI-ish.
 * Fields stay uncontrolled; submit reads FormData (needs `.name()` on inputs).
 *
 * ```ts
 * Form()
 *   .validation({ title: [required('Required'), minLength(2)] })
 *   .onSubmit((values) => todos.add({ title: String(values.title) }))
 *   .afterSubmit((_values, form) => form.reset())          // all fields
 *   .afterSubmit((_values, form) => form.reset('title'))   // one field
 *   .afterSubmit((_values, form) => form.set('title', '')) // set one field
 *   .children([TextField().name('title'), Button('Save').submit()])
 * ```
 */
class FormBuilder extends FiboBuilder {
  private _gap?: number | string;
  private _onSubmit?: FormSubmitHandler;
  private _beforeSubmit?: FormBeforeSubmitHandler;
  private _afterSubmit?: FormAfterSubmitHandler;
  private _validation?: FieldSchema;
  private _errorMode: FormErrorMode = 'field';
  private _onInvalid?: (errors: FieldErrors, form: FormControl) => unknown;
  private _action?: string;
  private _method: string = 'post';

  gap(value: number | string): this {
    this._gap = value;
    return this;
  }

  spacing(value: number | string): this {
    return this.gap(value);
  }

  onSubmit(handler: FormSubmitHandler): this {
    this._onSubmit = handler;
    return this;
  }

  beforeSubmit(handler: FormBeforeSubmitHandler): this {
    this._beforeSubmit = handler;
    return this;
  }

  afterSubmit(handler: FormAfterSubmitHandler): this {
    this._afterSubmit = handler;
    return this;
  }

  /**
   * Rules per field name. Combined with `TextField().rules(...)`.
   * Failed submit skips `before` / `onSubmit` / `after`.
   *
   * `.errorMode('field')` — TextField's own error line (default)
   * `.errorMode('below')` — message under the control
   * `.errorMode('manual')` — only `.onInvalid(errors)`
   */
  validation(schema: FieldSchema): this {
    this._validation = schema;
    return this;
  }

  errorMode(mode: FormErrorMode): this {
    this._errorMode = mode;
    return this;
  }

  /** Custom placement. Still receives errors when mode is `field` or `below`. */
  onInvalid(handler: (errors: FieldErrors, form: FormControl) => unknown): this {
    this._onInvalid = handler;
    return this;
  }

  action(url: string): this {
    this._action = url;
    return this;
  }

  method(m: 'get' | 'post' | string): this {
    this._method = m;
    return this;
  }

  items(children: FiboChildren): this {
    return this.children(children);
  }

  build(): ReactElement {
    return React.createElement(FormInner, {
      className: this.getClassName(),
      style: this.getStyle(),
      gap: this._gap,
      onSubmitForm: this._onSubmit,
      beforeSubmit: this._beforeSubmit,
      afterSubmit: this._afterSubmit,
      validation: this._validation,
      errorMode: this._errorMode,
      onInvalid: this._onInvalid,
      action: this._action,
      method: this._method,
      children: this.processChildren(),
      ...this._props,
    });
  }
}

export const Form = createBuilder(FormBuilder);

export interface FormProps extends BaseProps {
  gap?: number | string;
  onSubmit?: FormSubmitHandler;
  beforeSubmit?: FormBeforeSubmitHandler;
  afterSubmit?: FormAfterSubmitHandler;
  action?: string;
  method?: string;
}
