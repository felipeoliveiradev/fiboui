'use client';

import React, { useState, useEffect, useCallback, ReactNode, Suspense, createContext, useContext, ErrorInfo } from 'react';
import { RouterContext, Route, NavigateOptions, RouterContextValue, useRouterOptional } from './RouterContext';
import { findMatchingRoute } from './routeMatching';
import { RouteErrorBoundary } from './ErrorBoundary';
import { DefaultErrorPage } from './DefaultErrorPage';
import { DefaultLoader } from './DefaultLoader';

interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType;
  loading?: ReactNode;
  basename?: string;
  /** Request path for SSR. First client render uses this (or `/`), then window after mount. */
  initialPath?: string;
  /** Request search string (`?a=1` or `a=1`) for SSR. */
  initialSearch?: string;
  /** Request hash (`#section` or `section`) for SSR. */
  initialHash?: string;
  errorBoundary?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

function normalizeBasename(basename: string): string {
  if (!basename || basename === '/') return '';
  return basename.endsWith('/') ? basename.slice(0, -1) : basename;
}

/** Strip `basename` only on a path-segment boundary (`/app` must not eat `/application`). */
export function stripBasename(path: string, basename: string): string {
  const base = normalizeBasename(basename);
  const raw = path || '/';
  if (!base) return raw;
  if (raw === base) return '/';
  if (raw.startsWith(`${base}/`)) {
    return raw.slice(base.length) || '/';
  }
  return raw;
}

/** Join basename + path without double slashes or glued segments. */
export function joinBasename(basename: string, path: string): string {
  const base = normalizeBasename(basename);
  if (!path || path === '/') return base || '/';
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (!base) return suffix;
  return `${base}${suffix}`;
}

function normalizeSearch(search: string | undefined): string {
  if (!search) return '';
  return search.startsWith('?') ? search.slice(1) : search;
}

function normalizeHash(hash: string | undefined): string {
  if (!hash) return '';
  return hash.startsWith('#') ? hash : `#${hash}`;
}

interface SplitDest {
  pathname: string;
  search: string;
  hash: string;
  /** False for `?q=1` / `#hash` — keep the current pathname. */
  hasPath: boolean;
  hasSearch: boolean;
  hasHash: boolean;
}

/** Split a navigate target so query/hash never leak into path matching or params. */
function splitDest(raw: string): SplitDest {
  const input = raw ?? '';
  if (!input) {
    return { pathname: '/', search: '', hash: '', hasPath: true, hasSearch: false, hasHash: false };
  }

  let rest = input;
  let hash = '';
  let hasHash = false;
  const hashIdx = rest.indexOf('#');
  if (hashIdx >= 0) {
    hasHash = true;
    hash = rest.slice(hashIdx);
    rest = rest.slice(0, hashIdx);
  }

  let search = '';
  let hasSearch = false;
  const qIdx = rest.indexOf('?');
  if (qIdx >= 0) {
    hasSearch = true;
    search = rest.slice(qIdx + 1);
    rest = rest.slice(0, qIdx);
  }

  const hasPath = rest.length > 0;
  if (hasPath && !rest.startsWith('/')) rest = `/${rest}`;
  return { pathname: hasPath ? rest : '', search, hash, hasPath, hasSearch, hasHash };
}

function composeHref(basename: string, pathname: string, search: string, hash: string): string {
  const path = joinBasename(basename, pathname);
  const q = search ? `?${normalizeSearch(search)}` : '';
  const h = hash ? normalizeHash(hash) : '';
  return `${path}${q}${h}`;
}

function stripKnownBasename(pathname: string, own: string, resolved: string): string {
  const strippedOwn = stripBasename(pathname, own);
  if (strippedOwn !== pathname) return strippedOwn;
  if (resolved && resolved !== own) {
    const strippedResolved = stripBasename(pathname, resolved);
    if (strippedResolved !== pathname) return strippedResolved;
  }
  return pathname;
}

function windowHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

async function runEnterGuards(chain: Route[], from: Route | null): Promise<boolean | string> {
  for (const step of chain) {
    if (!step.beforeEnter) continue;
    const result = await step.beforeEnter(step, from);
    if (result === false) return false;
    if (typeof result === 'string') return result;
  }
  return true;
}

export const CurrentRouteContext = createContext<Route | null>(null);

export function useCurrentRoute(): Route | null {
  return useContext(CurrentRouteContext);
}

export const Router: React.FC<RouterProps> = ({
  routes,
  fallback: FallbackComponent,
  loading,
  basename = '',
  initialPath = '/',
  initialSearch = '',
  initialHash = '',
  errorBoundary,
  onError
}) => {
  const parent = useRouterOptional();
  const resolvedBasename = parent ? joinBasename(parent.basename, basename) : basename;
  const initialDest = splitDest(initialPath);

  const [ownPath, setOwnPath] = useState(() => {
    if (parent) return stripBasename(parent.currentPath, basename);
    return stripBasename(initialDest.pathname || '/', basename);
  });
  const [ownQuery, setOwnQuery] = useState(
    () => new URLSearchParams(normalizeSearch(initialSearch || initialDest.search))
  );
  const [ownHash, setOwnHash] = useState(() => normalizeHash(initialHash || initialDest.hash));
  const [enterBlocked, setEnterBlocked] = useState(false);
  const aliveRef = React.useRef(true);

  const currentPath = parent ? stripBasename(parent.currentPath, basename) : ownPath;
  const query = parent ? parent.query : ownQuery;
  const hash = parent ? parent.hash : ownHash;
  const pathRef = React.useRef(currentPath);
  pathRef.current = currentPath;
  const searchRef = React.useRef(query.toString());
  searchRef.current = query.toString();
  const hashRef = React.useRef(hash);
  hashRef.current = hash;

  const matched = findMatchingRoute(routes, currentPath);
  const route = matched.route;
  const matchedParams = matched.params;
  const leafRef = React.useRef(matched.leaf);
  leafRef.current = matched.leaf;

  const parentNavigate = parent?.navigate;
  const parentGoBack = parent?.goBack;
  const parentPath = parent?.currentPath;
  const nested = parent != null;

  const navigate = useCallback(async (path: string, options: NavigateOptions = {}) => {
    const dest = splitDest(path);
    let pathname = dest.hasPath
      ? stripKnownBasename(dest.pathname, basename, resolvedBasename)
      : pathRef.current;
    let search = dest.hasSearch ? dest.search : dest.hasPath ? '' : searchRef.current;
    let nextHash = dest.hasHash ? dest.hash : dest.hasPath || dest.hasSearch ? '' : hashRef.current;

    const currentLeaf = leafRef.current;
    const next = findMatchingRoute(routes, pathname);
    const pathChanged = pathname !== pathRef.current;

    if (pathChanged && currentLeaf?.beforeLeave && next.route) {
      const leaveResult = await currentLeaf.beforeLeave(next.leaf ?? next.route, currentLeaf);

      if (leaveResult === false) {
        return;
      }

      if (typeof leaveResult === 'string') {
        return navigate(leaveResult, options);
      }
    }

    if (pathChanged && next.chain.length) {
      const enterResult = await runEnterGuards(next.chain, currentLeaf);
      if (enterResult === false) {
        return;
      }
      if (typeof enterResult === 'string') {
        const redirected = splitDest(enterResult);
        pathname = redirected.hasPath
          ? stripKnownBasename(redirected.pathname, basename, resolvedBasename)
          : pathname;
        search = redirected.hasSearch ? redirected.search : redirected.hasPath ? '' : search;
        nextHash = redirected.hasHash
          ? redirected.hash
          : redirected.hasPath || redirected.hasSearch
            ? ''
            : nextHash;
      }
    }

    if (!aliveRef.current) return;

    if (parentNavigate) {
      const parentDest = composeHref(basename, pathname, search, nextHash);
      return parentNavigate(parentDest, options);
    }

    const fullPath = composeHref(basename, pathname, search, nextHash);

    if (typeof window !== 'undefined' && windowHref() !== fullPath) {
      if (options.replace) {
        window.history.replaceState(options.state || {}, '', fullPath);
      } else {
        window.history.pushState(options.state || {}, '', fullPath);
      }
    }

    if (!aliveRef.current) return;

    setEnterBlocked(false);
    setOwnQuery(new URLSearchParams(search));
    setOwnHash(nextHash ? normalizeHash(nextHash) : '');
    setOwnPath(pathname);
  }, [basename, resolvedBasename, routes, parentNavigate]);

  const goBack = useCallback(() => {
    if (parentGoBack) {
      parentGoBack();
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, [parentGoBack]);

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (nested) {
      let cancelled = false;
      const path = stripBasename(parentPath ?? '/', basename);
      const next = findMatchingRoute(routes, path);
      if (!next.chain.some((step) => step.beforeEnter)) {
        setEnterBlocked(false);
        return;
      }
      void (async () => {
        const result = await runEnterGuards(next.chain, leafRef.current);
        if (cancelled) return;
        if (result === false) {
          setEnterBlocked(true);
          return;
        }
        if (typeof result === 'string') {
          void navigate(result, { replace: true });
          return;
        }
        setEnterBlocked(false);
      })();
      return () => {
        cancelled = true;
      };
    }

    if (typeof window === 'undefined') return;
    let cancelled = false;

    const applyWindowLocation = async (from: Route | null) => {
      const path = stripBasename(window.location.pathname, basename);
      const next = findMatchingRoute(routes, path);

      if (next.chain.some((step) => step.beforeEnter)) {
        const result = await runEnterGuards(next.chain, from);
        if (cancelled) return;
        if (result === false) {
          setEnterBlocked(true);
          return;
        }
        if (typeof result === 'string') {
          void navigate(result, { replace: true });
          return;
        }
      }

      if (cancelled) return;
      setEnterBlocked(false);
      setOwnPath(path);
      setOwnQuery(new URLSearchParams(window.location.search));
      setOwnHash(window.location.hash || '');
    };

    void applyWindowLocation(null);

    const onPop = () => {
      void applyWindowLocation(leafRef.current);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      cancelled = true;
      window.removeEventListener('popstate', onPop);
    };
  }, [basename, routes, navigate, nested, parentPath]);

  const contextValue: RouterContextValue = {
    currentPath,
    basename: parent ? resolvedBasename : basename,
    navigate,
    goBack,
    replace,
    params: matchedParams,
    query,
    hash,
  };

  const renderContent = () => {
    if (enterBlocked || !route) {
      return FallbackComponent ? <FallbackComponent /> : <div>404 - Page Not Found</div>;
    }

    const Component = route.component;

    const content = (
      <CurrentRouteContext.Provider value={route}>
        <Component />
      </CurrentRouteContext.Provider>
    );

    return (
      <RouteErrorBoundary
        key={currentPath}
        fallback={errorBoundary || <DefaultErrorPage />}
        onError={onError}
      >
        {content}
      </RouteErrorBoundary>
    );
  };

  return (
    <RouterContext.Provider value={contextValue}>
      <Suspense fallback={loading ?? <DefaultLoader />}>
        {renderContent()}
      </Suspense>
    </RouterContext.Provider>
  );
};
