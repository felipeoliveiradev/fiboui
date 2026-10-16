'use client';

import React, { createContext, useContext } from 'react';

export type RouteGuard = (
  to: Route,
  from: Route | null
) => boolean | string | Promise<boolean | string>;

export interface Route {
  path: string;
  component: React.ComponentType<any>;
  children?: Route[];
  exact?: boolean;
  meta?: Record<string, any>;
  beforeEnter?: RouteGuard;
  beforeLeave?: RouteGuard;
}

export interface RouterContextValue {
  currentPath: string;
  basename: string;
  navigate: (path: string, options?: NavigateOptions) => void;
  goBack: () => void;
  replace: (path: string) => void;
  params: Record<string, string>;
  query: URLSearchParams;
  hash: string;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

export const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
}

export function useRouterOptional(): RouterContextValue | null {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { params } = useRouter();
  return params as T;
}

export function useQuery(): URLSearchParams {
  const { query } = useRouter();
  return query;
}

export function useLocation() {
  const { currentPath, query, hash } = useRouter();
  const search = query?.toString?.() ?? '';
  return {
    pathname: currentPath,
    search: search ? `?${search}` : '',
    hash: hash ?? '',
  };
}
