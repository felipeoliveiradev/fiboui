import { RouteGuard } from './RouterContext';

export function requireAuth(loginPath: string = '/login'): RouteGuard {
  return (_to, _from) => {

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
  return (_to, _from) => {
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
    const confirmed = window.confirm(message);
    return confirmed;
  };
}

export function redirect(path: string): RouteGuard {
  return () => path;
}

export function composeGuards(...guards: RouteGuard[]): RouteGuard {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from);

      if (result === false) {
        return false;
      }

      if (typeof result === 'string') {
        return result;
      }
    }

    return true;
  };
}

function checkAuth(): boolean {

  return !!localStorage.getItem('authToken');
}

function getUserRoles(): string[] {

  const rolesStr = localStorage.getItem('userRoles');
  return rolesStr ? JSON.parse(rolesStr) : [];
}
