import { Route } from './RouterContext';

export function matchPath(
  pathname: string,
  pattern: string
): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      continue;
    }

    if (patternPart !== pathPart) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export function findMatchingRoute(
  routes: Route[],
  pathname: string
): { route: Route | null; params: Record<string, string> } {
  for (const route of routes) {
    const { match, params } = matchPath(pathname, route.path);

    if (match) {
      return { route, params };
    }

    if (route.children) {
      const childResult = findMatchingRoute(route.children, pathname);
      if (childResult.route) {
        return childResult;
      }
    }
  }

  return { route: null, params: {} };
}

export function buildPath(pattern: string, params: Record<string, string> = {}): string {
  let path = pattern;

  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });

  return path;
}
