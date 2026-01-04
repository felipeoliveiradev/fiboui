import React from 'react';
import { useRouter } from './RouterContext';
import { useCurrentRoute } from './Router';
import { findMatchingRoute } from './routeMatching';

/**
 * Outlet Component
 * Renders nested child routes
 */
export const Outlet: React.FC = () => {
  const { currentPath } = useRouter();
  const parentRoute = useCurrentRoute();

  // If no parent route or no children, render nothing
  if (!parentRoute || !parentRoute.children || parentRoute.children.length === 0) {
    return null;
  }

  // Find matching child route
  const { route: childRoute } = findMatchingRoute(parentRoute.children, currentPath);

  // If no matching child route, render nothing
  if (!childRoute) {
    return null;
  }

  // Render the child component
  const ChildComponent = childRoute.component;
  return <ChildComponent />;
};
