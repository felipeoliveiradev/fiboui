import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { Observable, Signal, Tracker } from './state';

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
  stateMap: Map<string, any>;
  children: ReactNode;
}


export function StateWrapper({ stateMap, children }: StateWrapperProps) {
  const [state] = useState(() => new Map(stateMap));

  return (
    <StateContext.Provider value={state}>
      {children}
    </StateContext.Provider>
  );
}





interface ObserverWrapperProps {
  observables: Set<Observable<any>>;
  children: ReactNode;
}


export function ObserverWrapper({ observables, children }: ObserverWrapperProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribers = Array.from(observables).map(obs =>
      obs.subscribe(() => forceUpdate({}))
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [observables]);

  return <>{children}</>;
}





interface SignalWrapperProps {
  signals: Set<Signal<any>>;
  children: ReactNode;
}


export function SignalWrapper({ signals, children }: SignalWrapperProps) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribers = Array.from(signals).map(sig =>
      sig.subscribe(() => forceUpdate({}))
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [signals]);

  return <>{children}</>;
}





interface ProviderWrapperProps {
  providers: Map<string, any>;
  children: ReactNode;
}

export const ProviderContext = createContext<Map<string, any>>(new Map());

export function useProvider<T>(key: string): T | undefined {
  const providers = useContext(ProviderContext);
  return providers.get(key);
}


export function ProviderWrapper({ providers, children }: ProviderWrapperProps) {
  return (
    <ProviderContext.Provider value={providers}>
      {children}
    </ProviderContext.Provider>
  );
}

