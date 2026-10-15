import { createContext, useContext, useState, useEffect, useRef, useCallback, useSyncExternalStore, ReactNode } from 'react';
import { BindableSignal, Observable, Tracker, runInScope } from './state';
import { useReactivityScope } from './ReactivityRoot';

export function Observer({ children }: { children: () => ReactNode }) {
  const versionRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());
  const tracker = useRef<Tracker | null>(null);

  if (!tracker.current) {
    tracker.current = new Tracker(() => {
      versionRef.current += 1;
      listenersRef.current.forEach((listener) => listener());
    });
  }

  const subscribe = useCallback((onStoreChange: () => void) => {
    listenersRef.current.add(onStoreChange);
    return () => {
      listenersRef.current.delete(onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => versionRef.current, []);
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    return () => {
      tracker.current?.dispose();
    };
  }, []);

  const scope = useReactivityScope();

  let result: ReactNode = null;
  try {
    result = runInScope(scope, () => tracker.current!.execute(children));
  } catch {
    result = null;
  }
  return <>{result}</>;
}

export const StateContext = createContext<Map<string, unknown>>(new Map());

interface BuilderStateApi {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  map: Map<string, unknown>;
}

export const BuilderStateContext = createContext<BuilderStateApi | null>(null);

export function useStateContext() {
  return useContext(StateContext);
}

export function useBuilderState<T = unknown>(key: string): [T | undefined, (value: T) => void] {
  const api = useContext(BuilderStateContext);
  if (!api) {
    throw new Error('useBuilderState must be used under a builder that called .state()');
  }
  return [api.get<T>(key), (value: T) => api.set(key, value)];
}

interface StateWrapperProps {
  stateMap?: Map<string, unknown>;
  children: ReactNode;
}

export function StateWrapper({ stateMap = new Map(), children }: StateWrapperProps) {
  const [state, setState] = useState(() => new Map(stateMap));

  const api: BuilderStateApi = {
    map: state,
    get: <T,>(key: string) => state.get(key) as T | undefined,
    set: <T,>(key: string, value: T) => {
      setState((prev) => {
        if (Object.is(prev.get(key), value)) {
          return prev;
        }
        const next = new Map(prev);
        next.set(key, value);
        return next;
      });
    },
  };

  return (
    <BuilderStateContext.Provider value={api}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </BuilderStateContext.Provider>
  );
}

interface ObserverWrapperProps {
  observables: Set<Observable<unknown>>;
  children: ReactNode | (() => ReactNode);
}

export function ObserverWrapper({ observables, children }: ObserverWrapperProps) {
  const versionRef = useRef(0);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribers = Array.from(observables).map((obs) =>
      obs.subscribe(() => {
        versionRef.current += 1;
        onStoreChange();
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [observables]);

  const getSnapshot = useCallback(() => versionRef.current, []);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return <>{typeof children === 'function' ? children() : children}</>;
}

interface SignalWrapperProps {
  signals: Set<BindableSignal<unknown>>;
  children: ReactNode | (() => ReactNode);
}

export function SignalWrapper({ signals, children }: SignalWrapperProps) {
  const versionRef = useRef(0);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribers = Array.from(signals).map((sig) =>
      sig.subscribe(() => {
        versionRef.current += 1;
        onStoreChange();
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [signals]);

  const getSnapshot = useCallback(() => versionRef.current, []);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return <>{typeof children === 'function' ? children() : children}</>;
}

interface ProviderWrapperProps {
  providers?: Map<string, unknown>;
  children: ReactNode;
}

export const ProviderContext = createContext<Map<string, unknown>>(new Map());

export function useProvider<T>(key: string): T | undefined {
  const providers = useContext(ProviderContext);
  return providers?.get(key) as T | undefined;
}

export function ProviderWrapper({ providers = new Map(), children }: ProviderWrapperProps) {
  return (
    <ProviderContext.Provider value={providers}>
      {children}
    </ProviderContext.Provider>
  );
}
