import React from 'react';
import { useRouterOptional } from './RouterContext';
import { CurrentRouteContext, useCurrentRoute } from './Router';
import { findMatchingRoute } from './routeMatching';

export const Outlet: React.FC = () => {
  const router = useRouterOptional();
  const parentRoute = useCurrentRoute();

  if (!router || !parentRoute || !parentRoute.children || parentRoute.children.length === 0) {
    return null;
  }

  const { route: childRoute } = findMatchingRoute(parentRoute.children, router.currentPath);

  if (!childRoute) {
    return null;
  }

  const ChildComponent = childRoute.component;
  return (
    <CurrentRouteContext.Provider value={childRoute}>
      <ChildComponent />
    </CurrentRouteContext.Provider>
  );
};
