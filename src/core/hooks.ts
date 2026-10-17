'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Signal, ComputedSignal, Store, Observable } from './state';

function subscribeSignal<T>(signal: Signal<T> | ComputedSignal<T>) {
  return (onStoreChange: () => void) => signal.subscribe(onStoreChange);
}

export function useSignal<T>(signal: Signal<T> | ComputedSignal<T>): T {
  const subscribe = useCallback(subscribeSignal(signal), [signal]);
  const getSnapshot = useCallback(() => signal.value, [signal]);
  // Same snapshot on server and client — never reads `window`.
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Subscribe to a `createStore()` instance. Distinct from the class-decorator `useStore`. */
export function useReactiveStore<T>(store: Store<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store]
  );
  const getSnapshot = useCallback(() => store.getState(), [store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** @deprecated Use `useReactiveStore` to avoid colliding with the decorator `useStore`. */
export const useStore = useReactiveStore;

export function useObservable<T>(obs: Observable<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => obs.subscribe(onStoreChange),
    [obs]
  );
  const getSnapshot = useCallback(() => obs.get(), [obs]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
