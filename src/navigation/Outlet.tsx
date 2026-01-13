import React from 'react';
import { useRouter } from './RouterContext';
import { useCurrentRoute } from './Router';
import { findMatchingRoute } from './routeMatching';

export const Outlet: React.FC = () => {
  const { currentPath } = useRouter();
  const parentRoute = useCurrentRoute();

  if (!parentRoute || !parentRoute.children || parentRoute.children.length === 0) {
    return null;
  }

  const { route: childRoute } = findMatchingRoute(parentRoute.children, currentPath);

  if (!childRoute) {
    return null;
  }

  const ChildComponent = childRoute.component;
  return <ChildComponent />;
};
