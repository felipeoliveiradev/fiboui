import type { ReactElement } from 'react';

/**
 * RSC stand-in for `core/preferenceKey`.
 * Preference read/write hosts pass children through — no bus, no context.
 */

export type PreferenceKeyDef<T> = {
  readonly __preferenceKey: true;
  readonly id: string | symbol;
  readonly defaultValue: T;
  reduce: (value: T, nextValue: T) => T;
};

let keySeq = 0;

export function PreferenceKey<T>(opts: {
  id?: string;
  defaultValue: T;
  reduce?: (value: T, nextValue: T) => T;
}): PreferenceKeyDef<T> {
  keySeq += 1;
  return {
    __preferenceKey: true,
    id: opts.id ?? `pref-${keySeq}`,
    defaultValue: opts.defaultValue,
    reduce: opts.reduce ?? ((_prev, next) => next),
  };
}

export type PreferenceWriteSpec = {
  key: PreferenceKeyDef<unknown>;
  value: unknown;
};

export type PreferenceReadSpec = {
  key: PreferenceKeyDef<unknown>;
  onChange: (value: unknown) => void;
};

export function wrapPreference(child: ReactElement, _spec: PreferenceWriteSpec): ReactElement {
  return child;
}

export function wrapOnPreferenceChange(
  child: ReactElement,
  _spec: PreferenceReadSpec
): ReactElement {
  return child;
}

export function reducePreferences<T>(key: PreferenceKeyDef<T>, values: T[]): T {
  return values.reduce((acc, v) => key.reduce(acc, v), key.defaultValue);
}
