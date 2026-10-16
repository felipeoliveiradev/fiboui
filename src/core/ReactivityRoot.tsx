'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { createReactivityRoot, ReactivityScope } from './state';

const defaultScope = createReactivityRoot();

export const ReactivityScopeContext = createContext<ReactivityScope>(defaultScope);

export function useReactivityScope(): ReactivityScope {
  return useContext(ReactivityScopeContext);
}

interface ReactivityRootProps {
  children: ReactNode;
  scope?: ReactivityScope;
}

/** Isolates `activeEffect` for one React tree / island. */
export function ReactivityRoot({ children, scope }: ReactivityRootProps) {
  const local = useRef(scope ?? createReactivityRoot()).current;
  return (
    <ReactivityScopeContext.Provider value={local}>
      {children}
    </ReactivityScopeContext.Provider>
  );
}
