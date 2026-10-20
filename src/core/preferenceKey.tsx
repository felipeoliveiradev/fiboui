'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';

/**
 * SwiftUI `PreferenceKey` — typed key with default + reduce.
 *
 * ```ts
 * const WidthKey = PreferenceKey({ defaultValue: 0, reduce: (a, b) => Math.max(a, b) })
 * Column()
 *   .onPreferenceChange(WidthKey, (w) => console.log(w))
 *   .children(Box().preference(WidthKey, 120))
 * ```
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
  return {
    __preferenceKey: true,
    id: opts.id ?? Symbol(`pref-${++keySeq}`),
    defaultValue: opts.defaultValue,
    reduce: opts.reduce ?? ((_prev, next) => next),
  };
}

type Contribution = { keyId: string | symbol; value: unknown };

type PrefBus = {
  subscribe: (keyId: string | symbol, listener: () => void) => () => void;
  contribute: (id: string, contribution: Contribution) => () => void;
  read: <T>(key: PreferenceKeyDef<T>) => T;
};

const PrefBusContext = createContext<PrefBus | null>(null);

function createBus(): PrefBus {
  const contributions = new Map<string, Contribution>();
  const listeners = new Map<string | symbol, Set<() => void>>();

  const notify = (keyId: string | symbol) => {
    listeners.get(keyId)?.forEach((fn) => fn());
  };

  return {
    subscribe(keyId, listener) {
      let set = listeners.get(keyId);
      if (!set) {
        set = new Set();
        listeners.set(keyId, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
        if (set!.size === 0) listeners.delete(keyId);
      };
    },
    contribute(id, contribution) {
      contributions.set(id, contribution);
      notify(contribution.keyId);
      return () => {
        if (contributions.get(id) === contribution) {
          contributions.delete(id);
          notify(contribution.keyId);
        }
      };
    },
    read<T>(key: PreferenceKeyDef<T>): T {
      let value = key.defaultValue;
      for (const c of contributions.values()) {
        if (c.keyId !== key.id) continue;
        value = key.reduce(value, c.value as T);
      }
      return value;
    },
  };
}

function PreferenceWriteInner<T>({
  prefKey,
  value,
  children,
}: {
  prefKey: PreferenceKeyDef<T>;
  value: T;
  children: ReactNode;
}) {
  const bus = useContext(PrefBusContext);
  const idRef = useRef(`pw-${Math.random().toString(36).slice(2)}`);

  useLayoutEffect(() => {
    if (!bus) return;
    return bus.contribute(idRef.current, { keyId: prefKey.id, value });
  }, [bus, prefKey, value]);

  return children as ReactElement;
}

function PreferenceReadInner<T>({
  prefKey,
  onChange,
  children,
}: {
  prefKey: PreferenceKeyDef<T>;
  onChange: (value: T) => void;
  children: ReactNode;
}) {
  const parentBus = useContext(PrefBusContext);
  const ownedBus = useMemo(() => createBus(), []);
  // Nesting: reuse parent bus when already inside another reader; else own one.
  const bus = parentBus ?? ownedBus;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emit = useCallback(() => {
    onChangeRef.current(bus.read(prefKey));
  }, [bus, prefKey]);

  useLayoutEffect(() => {
    emit();
    return bus.subscribe(prefKey.id, emit);
  }, [bus, prefKey, emit]);

  return React.createElement(PrefBusContext.Provider, { value: bus }, children);
}

export type PreferenceWriteSpec = {
  key: PreferenceKeyDef<any>;
  value: unknown;
};

export type PreferenceReadSpec = {
  key: PreferenceKeyDef<any>;
  onChange: (value: any) => void;
};

/** Contribute a preference value to the nearest `.onPreferenceChange` ancestor. */
export function wrapPreference(
  child: ReactElement,
  spec: PreferenceWriteSpec
): ReactElement {
  return React.createElement(PreferenceWriteInner as React.FC<any>, {
    prefKey: spec.key,
    value: spec.value,
    children: child,
  });
}

/** Listen for reduced preference values from descendants. */
export function wrapOnPreferenceChange(
  child: ReactElement,
  spec: PreferenceReadSpec
): ReactElement {
  return React.createElement(PreferenceReadInner as React.FC<any>, {
    prefKey: spec.key,
    onChange: spec.onChange,
    children: child,
  });
}

/** Test helper — reduce contributions manually. */
export function reducePreferences<T>(key: PreferenceKeyDef<T>, values: T[]): T {
  return values.reduce((acc, v) => key.reduce(acc, v), key.defaultValue);
}
