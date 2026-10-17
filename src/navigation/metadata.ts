import { Route } from './RouterContext';
import { useCurrentRoute } from './Router';
import { findMatchingRoute, matchPath } from './routeMatching';

export function useRouteMeta<T = Record<string, any>>(): T | undefined {
  const route = useCurrentRoute();
  return route?.meta as T | undefined;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  meta?: Record<string, any>;
}

function stripSearchAndHash(path: string): string {
  let next = path || '/';
  const hashIdx = next.indexOf('#');
  if (hashIdx >= 0) next = next.slice(0, hashIdx);
  const qIdx = next.indexOf('?');
  if (qIdx >= 0) next = next.slice(0, qIdx);
  return next || '/';
}

export function generateBreadcrumbs(
  routes: Route[],
  currentPath: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = stripSearchAndHash(currentPath).split('/').filter(Boolean);

  let accumulatedPath = '';

  for (const segment of segments) {
    accumulatedPath += `/${segment}`;

    const { leaf, route } = findMatchingRoute(routes, accumulatedPath);
    const matched = leaf ?? route;
    // Prefix layouts match unmatched children; only use meta.title on an exact path match.
    const exact = matched != null && matchPath(accumulatedPath, matched.path, true).match;

    if (matched && exact) {
      breadcrumbs.push({
        label: matched.meta?.title || segment,
        path: accumulatedPath,
        meta: matched.meta,
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

export function setDocumentTitle(route: Route, appName: string = 'FiboUI'): void {
  if (typeof document === 'undefined') return;
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
