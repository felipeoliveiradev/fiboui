import { ReactNode } from 'react';

/** RSC stubs — real reactive wrappers live in the client bundle. */
export function Observer({ children }: { children: () => ReactNode }) {
  return children();
}

export function SignalWrapper({
  children,
}: {
  signals?: unknown;
  children: () => ReactNode;
}) {
  return children();
}

export function ObserverWrapper({
  children,
}: {
  observables?: unknown;
  children: () => ReactNode;
}) {
  return children();
}

export function StateWrapper({ children }: { stateMap?: unknown; children: ReactNode }) {
  return children as any;
}

export function ProviderWrapper({
  children,
}: {
  providers?: unknown;
  children: ReactNode;
}) {
  return children as any;
}
