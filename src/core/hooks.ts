import { useState, useEffect } from 'react';
import { Signal, ComputedSignal, Store, Observable } from './state';

export function useSignal<T>(signal: Signal<T> | ComputedSignal<T>): T {
  const [value, setValue] = useState(signal.value);

  useEffect(() => {
    // Initial sync
    setValue(signal.value); 
    
    // Subscribe
    const unsubscribe = signal.subscribe((newVal) => {
      setValue(newVal);
    });
    
    return unsubscribe;
  }, [signal]);

  return value;
}

export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    setState(store.getState());
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [store]);

  return state;
}

export function useObservable<T>(obs: Observable<T>): T {
  const [val, setVal] = useState(obs.get());

  useEffect(() => {
    setVal(obs.get());
    const unsubscribe = obs.subscribe((newVal) => {
      setVal(newVal);
    });
    return unsubscribe;
  }, [obs]);

  return val;
}
