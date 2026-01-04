import React, { useState, useEffect, useCallback, ReactNode, Suspense, createContext, useContext } from 'react';
import { RouterContext, Route, NavigateOptions, RouterContextValue } from './RouterContext';
import { findMatchingRoute } from './routeMatching';

interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType;
  loading?: ReactNode;
  basename?: string;
}

// Context for current route (used by Outlet)
export const CurrentRouteContext = createContext<Route | null>(null);

export function useCurrentRoute(): Route | null {
  return useContext(CurrentRouteContext);
}

/**
 * Router Component
 * Provides routing context and handles navigation
 */
export const Router: React.FC<RouterProps> = ({
  routes,
  fallback: FallbackComponent,
  loading,
  basename = ''
}) => {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.replace(basename, '') || '/';
  });

  const [params, setParams] = useState<Record<string, string>>({});
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search));

  // Find matching route
  const { route, params: matchedParams } = findMatchingRoute(routes, currentPath);

  // Update params when route changes
  useEffect(() => {
    setParams(matchedParams);
  }, [currentPath]);

  // Navigate to a new path
  const navigate = useCallback((path: string, options: NavigateOptions = {}) => {
    const fullPath = basename + path;

    if (options.replace) {
      window.history.replaceState(options.state || {}, '', fullPath);
    } else {
      window.history.pushState(options.state || {}, '', fullPath);
    }

    setCurrentPath(path);
    setQuery(new URLSearchParams(window.location.search));
  }, [basename]);

  // Go back in history
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // Replace current path
  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  // Handle browser back/forward buttons
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

  // Render matched route or fallback
  const renderContent = () => {
    if (!route) {
      return FallbackComponent ? <FallbackComponent /> : <div>404 - Page Not Found</div>;
    }

    const Component = route.component;

    // Provide current route to Outlet components
    return (
      <CurrentRouteContext.Provider value={route}>
        <Component />
      </CurrentRouteContext.Provider>
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
