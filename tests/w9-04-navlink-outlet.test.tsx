import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavLink, Outlet, Router } from '../src';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

function mountNav(path: string, node: ReactNode) {
  window.history.pushState({}, '', path);
  return render(
    <Router
      initialPath={path}
      routes={[
        {
          path: '/',
          component: () => node,
          children: [
            { path: '/', component: () => <span>home</span>, exact: true },
            { path: '/dash', component: () => <span>dash</span> },
            { path: '/dashboard', component: () => <span>dashboard</span> },
            { path: '/users', component: () => <span>users</span> },
            { path: '/users/:id', component: () => <span>user</span> },
          ],
        },
      ]}
    />
  );
}

describe('W9-04 Outlet without Router', () => {
  it('renders nothing instead of throwing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Outlet />)).not.toThrow();
    expect(screen.queryByText(/.+/)).toBeNull();
    spy.mockRestore();
  });
});

describe('W9-04 NavLink active class', () => {
  it('does not mark Home (/) active on a nested path', () => {
    mountNav(
      '/dashboard',
      <>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </>
    );
    expect(screen.getByText('Home').className.split(/\s+/)).not.toContain('active');
    expect(screen.getByText('Dashboard').className.split(/\s+/)).toContain('active');
  });

  it('does not treat /dash as a prefix of /dashboard', () => {
    mountNav(
      '/dashboard',
      <>
        <NavLink to="/dash">Dash</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </>
    );
    expect(screen.getByText('Dash').className.split(/\s+/)).not.toContain('active');
    expect(screen.getByText('Dashboard').className.split(/\s+/)).toContain('active');
  });

  it('prefix-matches /users on /users/1 unless exact', () => {
    mountNav(
      '/users/1',
      <>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/users" exact>
          UsersExact
        </NavLink>
      </>
    );
    expect(screen.getByText('Users').className.split(/\s+/)).toContain('active');
    expect(screen.getByText('UsersExact').className.split(/\s+/)).not.toContain('active');
  });

  it('ignores query and hash on to when deciding active', () => {
    mountNav(
      '/users',
      <NavLink to="/users?tab=1#top">Users</NavLink>
    );
    expect(screen.getByText('Users').className.split(/\s+/)).toContain('active');
  });
});
