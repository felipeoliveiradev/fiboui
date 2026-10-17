import { RouteGuard } from './RouterContext';

function samePath(a: string, b: string): boolean {
  const norm = (p: string) => {
    const cut = (p ?? '').split(/[?#]/, 1)[0];
    if (!cut || cut === '/') return '/';
    return cut.length > 1 && cut.endsWith('/') ? cut.slice(0, -1) : cut;
  };
  return norm(a) === norm(b);
}

export function requireAuth(loginPath: string = '/login'): RouteGuard {
  return (to, _from) => {
    if (samePath(to.path, loginPath)) {
      return true;
    }

    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
      return loginPath;
    }

    return true;
  };
}

export function requireRole(
  role: string | string[],
  unauthorizedPath: string = '/unauthorized'
): RouteGuard {
  return (to, _from) => {
    if (samePath(to.path, unauthorizedPath)) {
      return true;
    }

    const userRoles = getUserRoles();
    const requiredRoles = Array.isArray(role) ? role : [role];

    const hasRole = requiredRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      return unauthorizedPath;
    }

    return true;
  };
}

export function confirmLeave(message: string = 'Are you sure you want to leave?'): RouteGuard {
  return (_to, _from) => {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true;
    }
    return window.confirm(message);
  };
}

export function redirect(path: string): RouteGuard {
  return (to) => (samePath(to.path, path) ? true : path);
}

export function composeGuards(...guards: RouteGuard[]): RouteGuard {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from);

      if (result === false) {
        return false;
      }

      if (typeof result === 'string') {
        if (samePath(result, to.path)) {
          continue;
        }
        return result;
      }
    }

    return true;
  };
}

function checkAuth(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return !!localStorage.getItem('authToken');
  } catch {
    return false;
  }
}

function getUserRoles(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const rolesStr = localStorage.getItem('userRoles');
    if (!rolesStr) return [];
    const parsed = JSON.parse(rolesStr);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
