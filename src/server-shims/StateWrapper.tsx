import { createContext, createElement, useContext, type ReactNode } from 'react';

/** RSC stubs — real reactive wrappers live in the client bundle. */
function renderChild(children: ReactNode | (() => ReactNode)) {
  return typeof children === 'function' ? children() : children;
}

function asMap(value: unknown): Map<string, unknown> {
  return value instanceof Map ? value : new Map();
}

interface BuilderStateApi {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  map: Map<string, unknown>;
}

function makeApi(map: Map<string, unknown>): BuilderStateApi {
  return {
    map,
    get: <T,>(key: string) => map.get(key) as T | undefined,
    set: () => undefined,
  };
}

export function Observer({ children }: { children: ReactNode | (() => ReactNode) }) {
  return renderChild(children);
}

export function SignalWrapper({
  children,
}: {
  signals?: unknown;
  children: ReactNode | (() => ReactNode);
}) {
  return renderChild(children);
}

export function ObserverWrapper({
  children,
}: {
  observables?: unknown;
  children: ReactNode | (() => ReactNode);
}) {
  return renderChild(children);
}

export const StateContext = createContext<Map<string, unknown>>(new Map());
export const BuilderStateContext = createContext<BuilderStateApi | null>(null);
export const ProviderContext = createContext<Map<string, unknown>>(new Map());

/** First paint of `.state()` — no useState. Setter is a no-op on the server. */
export function StateWrapper({
  stateMap,
  children,
}: {
  stateMap?: unknown;
  children: ReactNode;
}) {
  const map = asMap(stateMap);
  return createElement(
    BuilderStateContext.Provider,
    { value: makeApi(map) },
    createElement(StateContext.Provider, { value: map }, children),
  );
}

export function ProviderWrapper({
  providers,
  children,
}: {
  providers?: unknown;
  children: ReactNode;
}) {
  return createElement(ProviderContext.Provider, { value: asMap(providers) }, children);
}

export function useBuilderState<T = unknown>(key: string): [T | undefined, (value: T) => void] {
  const api = useContext(BuilderStateContext);
  return [api?.get<T>(key), () => undefined];
}

export function useProvider<T>(key: string): T | undefined {
  const providers = useContext(ProviderContext);
  return providers?.get(key) as T | undefined;
}

export function useStateContext() {
  return useContext(StateContext);
}
