import { Route } from '../navigation/RouterContext';

// Global route registry
const routeRegistry: Route[] = [];

/**
 * @Page decorator
 * Registers a component as a route
 */
export function Page(path: string, options: { exact?: boolean; meta?: Record<string, any> } = {}): any {
  return function <T extends Function>(target: T): T {
    // Register the route
    const route: Route = {
      path,
      component: target as any,
      exact: options.exact,
      meta: options.meta,
    };

    routeRegistry.push(route);

    return target;
  };
}

/**
 * Get all registered routes
 */
export function getRegisteredRoutes(): Route[] {
  return [...routeRegistry];
}

/**
 * Clear all registered routes (useful for testing)
 */
export function clearRoutes(): void {
  routeRegistry.length = 0;
}

/**
 * Register routes manually (alternative to decorator)
 */
export function registerRoute(path: string, component: React.ComponentType, options: { exact?: boolean; meta?: Record<string, any> } = {}): void {
  const route: Route = {
    path,
    component,
    exact: options.exact,
    meta: options.meta,
  };

  routeRegistry.push(route);
}
