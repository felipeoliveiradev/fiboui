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
    return window.location.pathname.replace(basename, '') || '/';
  });

  const [params, setParams] = useState<Record<string, string>>({});
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search));

  const { route, params: matchedParams } = findMatchingRoute(routes, currentPath);

  useEffect(() => {
    setParams(matchedParams);
  }, [currentPath]);

  const navigate = useCallback(async (path: string, options: NavigateOptions = {}) => {
    const { route: nextRoute } = findMatchingRoute(routes, path);

    if (route?.beforeLeave && nextRoute) {
      const leaveResult = await route.beforeLeave(nextRoute, route);

      if (leaveResult === false) {
        return;
      }

      if (typeof leaveResult === 'string') {

        return navigate(leaveResult, options);
      }
    }

    if (nextRoute?.beforeEnter) {
      const enterResult = await nextRoute.beforeEnter(nextRoute, route);

      if (enterResult === false) {
        return;
      }

      if (typeof enterResult === 'string') {

        path = enterResult;
      }
    }

    const fullPath = basename + path;

    if (options.replace) {
      window.history.replaceState(options.state || {}, '', fullPath);
    } else {
      window.history.pushState(options.state || {}, '', fullPath);
    }

    setCurrentPath(path);
    setQuery(new URLSearchParams(window.location.search));
  }, [basename, route, routes]);

  const goBack = useCallback(() => {
    window.history.back();
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
    navigate,
    goBack,
    replace,
    params,
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
