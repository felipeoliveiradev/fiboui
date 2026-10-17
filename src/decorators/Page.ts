import type { ComponentType } from 'react';
import type { Route } from '../navigation/RouterContext';

const routeRegistry: Route[] = [];

function assertPagePath(path: unknown): asserts path is string {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('Page(path) requires a non-empty path string — use @Page("/route")');
  }
}

function assertPageComponent(component: unknown): asserts component is ComponentType {
  if (typeof component !== 'function') {
    throw new Error('@Page() must decorate a component function or class');
  }
}

function pushRoute(
  path: string,
  component: ComponentType,
  options: { exact?: boolean; meta?: Record<string, any> },
): void {
  routeRegistry.push({
    path,
    component,
    exact: options.exact,
    meta: options.meta,
  });
}

export function Page(path: string, options: { exact?: boolean; meta?: Record<string, any> } = {}): any {
  assertPagePath(path);
  const opts = options ?? {};
  return function <T extends Function>(target: T): T {
    assertPageComponent(target);
    pushRoute(path, target as unknown as ComponentType, opts);
    return target;
  };
}

export function getRegisteredRoutes(): Route[] {
  return [...routeRegistry];
}

export function clearRoutes(): void {
  routeRegistry.length = 0;
}

export function registerRoute(
  path: string,
  component: ComponentType,
  options: { exact?: boolean; meta?: Record<string, any> } = {},
): void {
  assertPagePath(path);
  assertPageComponent(component);
  pushRoute(path, component, options ?? {});
}
