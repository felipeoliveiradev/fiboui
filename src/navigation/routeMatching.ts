import { Route } from './RouterContext';

/**
 * Match a path against a route pattern
 * Supports dynamic segments like /users/:id
 */
export function matchPath(
  pathname: string,
  pattern: string
): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  // Different number of parts = no match (unless pattern has wildcards)
  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    // Dynamic segment (starts with :)
    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      continue;
    }

    // Static segment must match exactly
    if (patternPart !== pathPart) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

/**
 * Find the best matching route for a given pathname
 */
export function findMatchingRoute(
  routes: Route[],
  pathname: string
): { route: Route | null; params: Record<string, string> } {
  for (const route of routes) {
    const { match, params } = matchPath(pathname, route.path);

    if (match) {
      return { route, params };
    }

    // Check nested routes
    if (route.children) {
      const childResult = findMatchingRoute(route.children, pathname);
      if (childResult.route) {
        return childResult;
      }
    }
  }

  return { route: null, params: {} };
}

/**
 * Build a path from a pattern and params
 */
export function buildPath(pattern: string, params: Record<string, string> = {}): string {
  let path = pattern;

  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });

  return path;
}
