import type { ReactNode } from 'react';

/** RSC stubs — real reactive wrappers live in the client bundle.
 *  Request maps (not React context) so the published server bundle stays RSC-safe.
 *  W8-05 reads .state()/.provide() from these maps during the wrapper render.
 */

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

let currentMap = new Map<string, unknown>();
let currentApi: BuilderStateApi | null = null;
let currentProviders = new Map<string, unknown>();

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

function Passthrough({ children }: { children?: ReactNode; value?: unknown }) {
  return children as any;
}

export const StateContext = { Provider: Passthrough };
export const BuilderStateContext = { Provider: Passthrough };
export const ProviderContext = { Provider: Passthrough };

/** First paint of `.state()` — no useState. Setter is a no-op on the server. */
export function StateWrapper({
  stateMap,
  children,
}: {
  stateMap?: unknown;
  children: ReactNode;
}) {
  currentMap = asMap(stateMap);
  currentApi = makeApi(currentMap);
  return children as any;
}

export function ProviderWrapper({
  providers,
  children,
}: {
  providers?: unknown;
  children: ReactNode;
}) {
  currentProviders = asMap(providers);
  return children as any;
}

export function useBuilderState<T = unknown>(key: string): [T | undefined, (value: T) => void] {
  return [currentApi?.get<T>(key), () => undefined];
}

export function useProvider<T>(key: string): T | undefined {
  return currentProviders.get(key) as T | undefined;
}

export function useStateContext() {
  return currentMap;
}

export function peekProviders(): Map<string, unknown> {
  return currentProviders;
}
