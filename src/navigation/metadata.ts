import { Route } from './RouterContext';

export function useRouteMeta<T = Record<string, any>>(): T | undefined {

  return undefined;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  meta?: Record<string, any>;
}

export function generateBreadcrumbs(
  routes: Route[],
  currentPath: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = currentPath.split('/').filter(Boolean);

  let accumulatedPath = '';

  for (const segment of segments) {
    accumulatedPath += `/${segment}`;

    const route = findRouteByPath(routes, accumulatedPath);

    if (route) {
      breadcrumbs.push({
        label: route.meta?.title || segment,
        path: accumulatedPath,
        meta: route.meta,
      });
    } else {

      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: accumulatedPath,
      });
    }
  }

  return breadcrumbs;
}

function findRouteByPath(routes: Route[], path: string): Route | null {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }

    if (route.children) {
      const childRoute = findRouteByPath(route.children, path);
      if (childRoute) {
        return childRoute;
      }
    }
  }

  return null;
}

export function setDocumentTitle(route: Route, appName: string = 'FiboUI'): void {
  const title = route.meta?.title;

  if (title) {
    document.title = `${title} | ${appName}`;
  } else {
    document.title = appName;
  }
}

export function getRouteTitle(route: Route): string | undefined {
  return route.meta?.title;
}

export function requiresAuth(route: Route): boolean {
  return route.meta?.requiresAuth === true;
}

export function getRouteIcon(route: Route): string | undefined {
  return route.meta?.icon;
}

export function getRouteDescription(route: Route): string | undefined {
  return route.meta?.description;
}

export function isHiddenRoute(route: Route): boolean {
  return route.meta?.hidden === true;
}

export function getRouteOrder(route: Route): number {
  return route.meta?.order ?? 0;
}

export function sortRoutesByOrder(routes: Route[]): Route[] {
  return [...routes].sort((a, b) => {
    const orderA = getRouteOrder(a);
    const orderB = getRouteOrder(b);
    return orderA - orderB;
  });
}
