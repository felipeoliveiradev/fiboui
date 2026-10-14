import React, { useState, useEffect, useCallback, ReactNode, Suspense, createContext, useContext, ErrorInfo } from 'react';
import { RouterContext, Route, NavigateOptions, RouterContextValue } from './RouterContext';
import { findMatchingRoute } from './routeMatching';
import { RouteErrorBoundary } from './ErrorBoundary';
import { DefaultErrorPage } from './DefaultErrorPage';

interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType;
  loading?: ReactNode;
  basename?: string;
  errorBoundary?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
  errorBoundary,
  onError
}) => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname.replace(basename, '') || '/';
  });

  const [query, setQuery] = useState(() =>
    typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  );

  const { route, params: matchedParams } = findMatchingRoute(routes, currentPath);
  const routeRef = React.useRef(route);
  routeRef.current = route;

  const navigate = useCallback(async (path: string, options: NavigateOptions = {}) => {
    const currentRoute = routeRef.current;
    const { route: nextRoute } = findMatchingRoute(routes, path);

    if (currentRoute?.beforeLeave && nextRoute) {
      const leaveResult = await currentRoute.beforeLeave(nextRoute, currentRoute);

      if (leaveResult === false) {
        return;
      }

      if (typeof leaveResult === 'string') {

        return navigate(leaveResult, options);
      }
    }

    if (nextRoute?.beforeEnter) {
      const enterResult = await nextRoute.beforeEnter(nextRoute, currentRoute);

      if (enterResult === false) {
        return;
      }

      if (typeof enterResult === 'string') {

        path = enterResult;
      }
    }

    const fullPath = basename + path;

    if (typeof window !== 'undefined') {
      if (options.replace) {
        window.history.replaceState(options.state || {}, '', fullPath);
      } else {
        window.history.pushState(options.state || {}, '', fullPath);
      }
      setQuery(new URLSearchParams(window.location.search));
    }

    setCurrentPath(path);
  }, [basename, routes]);

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname.replace(basename, '') || '/';
      setCurrentPath(newPath);
      setQuery(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [basename]);

  const contextValue: RouterContextValue = {
    currentPath,
    basename,
    navigate,
    goBack,
    replace,
    params: matchedParams,
    query,
  };

  const renderContent = () => {
    if (!route) {
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
        fallback={errorBoundary || <DefaultErrorPage />}
        onError={onError}
      >
        {content}
      </RouteErrorBoundary>
    );
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {loading ? (
        <Suspense fallback={loading}>
          {renderContent()}
        </Suspense>
      ) : (
        renderContent()
      )}
    </RouterContext.Provider>
  );
};
