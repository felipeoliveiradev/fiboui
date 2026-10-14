import { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback, useSyncExternalStore } from 'react';
import { BindableSignal, Observable, Tracker } from './state';

export function Observer({ children }: { children: () => ReactNode }) {
  const [, forceUpdate] = useState({});
  const tracker = useRef<Tracker | null>(null);

  if (!tracker.current) {
    tracker.current = new Tracker(() => {
      forceUpdate({});
    });
  }

  useEffect(() => {
    return () => {
      tracker.current?.dispose();
    }
  }, []);

  let result;
  try {
    result = tracker.current.execute(children);
  } catch (e) {
    console.error("Observer render error", e);
    result = null;
  }
  return <>{result}</>;
}

export const StateContext = createContext<Map<string, any>>(new Map());

export function useStateContext() {
  return useContext(StateContext);
}

interface StateWrapperProps {
  stateMap?: Map<string, any>;
  children: ReactNode;
}

export function StateWrapper({ stateMap = new Map(), children }: StateWrapperProps) {
  const [state] = useState(() => new Map(stateMap));

  return (
    <StateContext.Provider value={state}>
      {children}
    </StateContext.Provider>
  );
}

interface ObserverWrapperProps {
  observables: Set<Observable<any>>;
  children: ReactNode | (() => ReactNode);
}

export function ObserverWrapper({ observables, children }: ObserverWrapperProps) {
  const versionRef = useRef(0);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribers = Array.from(observables).map(obs =>
      obs.subscribe(() => {
        versionRef.current += 1;
        onStoreChange();
      })
    );
    return () => unsubscribers.forEach(unsub => unsub());
  }, [observables]);

  const getSnapshot = useCallback(() => versionRef.current, []);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return <>{typeof children === 'function' ? children() : children}</>;
}

interface SignalWrapperProps {
  signals: Set<BindableSignal<any>>;
  children: ReactNode | (() => ReactNode);
}

export function SignalWrapper({ signals, children }: SignalWrapperProps) {
  const versionRef = useRef(0);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribers = Array.from(signals).map(sig =>
      sig.subscribe(() => {
        versionRef.current += 1;
        onStoreChange();
      })
    );
    return () => unsubscribers.forEach(unsub => unsub());
  }, [signals]);

  const getSnapshot = useCallback(() => versionRef.current, []);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return <>{typeof children === 'function' ? children() : children}</>;
}

interface ProviderWrapperProps {
  providers?: Map<string, any>;
  children: ReactNode;
}

export const ProviderContext = createContext<Map<string, any>>(new Map());

export function useProvider<T>(key: string): T | undefined {
  const providers = useContext(ProviderContext);
  return providers?.get(key);
}

export function ProviderWrapper({ providers = new Map(), children }: ProviderWrapperProps) {
  return (
    <ProviderContext.Provider value={providers}>
      {children}
    </ProviderContext.Provider>
  );
}
