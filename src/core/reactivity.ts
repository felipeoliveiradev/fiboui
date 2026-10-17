import { BindableSignal, Effect } from './state';

export interface EffectOptions {
  onDispose?: () => void;
}

export interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
  onDispose?: () => void;
}

export function effect(fn: () => void, options?: EffectOptions): () => void {
  const eff = new Effect(fn);

  return () => {
    eff.dispose();
    options?.onDispose?.();
  };
}

export function watch<T>(
  source: BindableSignal<T>,
  callback: (newValue: T, oldValue: T) => void,
  options?: WatchOptions
): () => void {
  // Read first so a lazy computed attaches its internal effect.
  let oldValue = source.value;

  if (options?.immediate) {
    callback(source.value, oldValue);
  }

  const unsubscribe = source.subscribe(() => {
    // ComputedSignal.notify delivers the previous snapshot; re-read `.value`.
    const newValue = source.value;
    if (Object.is(newValue, oldValue)) {
      return;
    }
    callback(newValue, oldValue);
    oldValue = newValue;
  });

  return () => {
    unsubscribe();
    options?.onDispose?.();
  };
}

export function watchMultiple<T extends any[]>(
  sources: { [K in keyof T]: BindableSignal<T[K]> },
  callback: (values: T) => void,
  options?: WatchOptions
): () => void {
  const getValues = (): T => {
    return sources.map(s => s.value) as T;
  };

  // Touch every source so lazy computeds track before the first notify.
  const initial = getValues();

  if (options?.immediate) {
    callback(initial);
  }

  const unsubscribes = sources.map(source =>
    source.subscribe(() => {
      callback(getValues());
    })
  );

  return () => {
    unsubscribes.forEach(unsub => unsub());
    options?.onDispose?.();
  };
}

export function watchEffect(fn: () => void, options?: EffectOptions): () => void {
  return effect(fn, options);
}

export type StopHandle = () => void;
