import { Route } from '../navigation/RouterContext';

const routeRegistry: Route[] = [];

export function Page(path: string, options: { exact?: boolean; meta?: Record<string, any> } = {}): any {
  return function <T extends Function>(target: T): T {

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

export function getRegisteredRoutes(): Route[] {
  return [...routeRegistry];
}

export function clearRoutes(): void {
  routeRegistry.length = 0;
}

export function registerRoute(path: string, component: React.ComponentType, options: { exact?: boolean; meta?: Record<string, any> } = {}): void {
  const route: Route = {
    path,
    component,
    exact: options.exact,
    meta: options.meta,
  };

  routeRegistry.push(route);
}
