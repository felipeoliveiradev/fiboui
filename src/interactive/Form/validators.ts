import type { FormValues } from './index';

/** One check against a field value. `message` is what the form shows. */
export type FieldRule = {
  check: (value: string, values: FormValues) => boolean;
  message: string;
};

function asText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

export function fieldText(values: FormValues, name: string): string {
  return asText(values[name]);
}

export function required(message = 'Required'): FieldRule {
  return {
    message,
    check: (value) => value.trim().length > 0,
  };
}

export function minLength(min: number, message = `Minimum ${min} characters`): FieldRule {
  return {
    message,
    check: (value) => value.trim().length >= min,
  };
}

export function maxLength(max: number, message = `Maximum ${max} characters`): FieldRule {
  return {
    message,
    check: (value) => value.length <= max,
  };
}

export function email(message = 'Invalid email'): FieldRule {
  return {
    message,
    check: (value) => value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  };
}

export function pattern(re: RegExp, message = 'Invalid format'): FieldRule {
  return {
    message,
    check: (value) => {
      if (value.trim() === '') return true;
      // Clone so `/g` (or sticky) lastIndex does not alternate across calls.
      return new RegExp(re.source, re.flags).test(value);
    },
  };
}

export function min(n: number, message = `Minimum ${n}`): FieldRule {
  return {
    message,
    check: (value) => value.trim() === '' || Number(value) >= n,
  };
}

export function max(n: number, message = `Maximum ${n}`): FieldRule {
  return {
    message,
    check: (value) => value.trim() === '' || Number(value) <= n,
  };
}

/** Escape hatch — return true when the value is valid. */
export function rule(
  check: (value: string, values: FormValues) => boolean,
  message: string
): FieldRule {
  return { check, message };
}

export type FieldSchema = Record<string, FieldRule | FieldRule[]>;

export type FieldErrors = Record<string, string>;

/** First failing rule per field. Empty object means valid. */
export function runFieldRules(
  values: FormValues,
  schema: FieldSchema,
  extra: Map<string, FieldRule[]> = new Map()
): FieldErrors {
  const names = new Set([...Object.keys(schema), ...extra.keys()]);
  const errors: FieldErrors = {};

  for (const name of names) {
    const fromSchema = schema[name];
    const list: FieldRule[] = [
      ...(fromSchema ? (Array.isArray(fromSchema) ? fromSchema : [fromSchema]) : []),
      ...(extra.get(name) ?? []),
    ];
    const value = fieldText(values, name);
    for (const item of list) {
      if (!item.check(value, values)) {
        errors[name] = item.message;
        break;
      }
    }
  }

  return errors;
}
