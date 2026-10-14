import { useCallback, useSyncExternalStore } from 'react';
import { Signal, ComputedSignal, Store, Observable } from './state';

function subscribeSignal<T>(signal: Signal<T> | ComputedSignal<T>) {
  return (onStoreChange: () => void) => signal.subscribe(onStoreChange);
}

export function useSignal<T>(signal: Signal<T> | ComputedSignal<T>): T {
  const subscribe = useCallback(subscribeSignal(signal), [signal]);
  return useSyncExternalStore(subscribe, () => signal.value, () => signal.value);
}

/** Subscribe to a `createStore()` instance. Distinct from the class-decorator `useStore`. */
export function useReactiveStore<T>(store: Store<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store]
  );
  return useSyncExternalStore(subscribe, () => store.getState(), () => store.getState());
}

/** @deprecated Use `useReactiveStore` to avoid colliding with the decorator `useStore`. */
export const useStore = useReactiveStore;

export function useObservable<T>(obs: Observable<T>): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => obs.subscribe(onStoreChange),
    [obs]
  );
  return useSyncExternalStore(subscribe, () => obs.get(), () => obs.get());
}
