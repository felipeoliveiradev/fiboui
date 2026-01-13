import { Effect, Signal } from './state';

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
  source: Signal<T>,
  callback: (newValue: T, oldValue: T) => void,
  options?: WatchOptions
): () => void {
  let oldValue = source.value;

  if (options?.immediate) {
    callback(source.value, oldValue);
  }

  const unsubscribe = source.subscribe((newValue) => {
    callback(newValue, oldValue);
    oldValue = newValue;
  });

  return () => {
    unsubscribe();
    options?.onDispose?.();
  };
}

export function watchMultiple<T extends any[]>(
  sources: { [K in keyof T]: Signal<T[K]> },
  callback: (values: T) => void,
  options?: WatchOptions
): () => void {
  const getValues = (): T => {
    return sources.map(s => s.value) as T;
  };

  if (options?.immediate) {
    callback(getValues());
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
