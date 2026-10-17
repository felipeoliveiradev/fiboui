import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link, NavLink, Outlet, Router, useParams, useRouteMeta } from '../src';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

describe('W24-02 Link without Router', () => {
  it('renders native http(s) href without throwing', () => {
    expect(() => render(<Link to="https://example.com/x">Go</Link>)).not.toThrow();
    expect(screen.getByText('Go')).toHaveAttribute('href', 'https://example.com/x');
  });

  it('renders in-app href without throwing so the browser can follow it', () => {
    expect(() => render(<Link to="/settings">Go</Link>)).not.toThrow();
    expect(screen.getByText('Go')).toHaveAttribute('href', '/settings');
  });

  it('still strips javascript: href without a Router', () => {
    expect(() => render(<Link to="javascript:alert(1)">Go</Link>)).not.toThrow();
    expect(screen.getByText('Go').getAttribute('href') ?? '').not.toMatch(/javascript/i);
    expect(fireEvent.click(screen.getByText('Go'))).toBe(false);
  });
});

describe('W24-02 Link href + basename', () => {
  function mount(to: string, extra?: Record<string, unknown>) {
    return render(
      <Router
        basename="/app"
        initialPath="/app"
        routes={[
          {
            path: '/',
            component: () => (
              <Link to={to} {...extra}>
                Go
              </Link>
            ),
          },
        ]}
      />
    );
  }

  it('prefixes basename onto in-app href', () => {
    mount('/users');
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app/users');
  });

  it('does not double-prefix when to already includes basename', () => {
    mount('/app/users');
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app/users');
    expect(screen.getByText('Go').getAttribute('href')).not.toBe('/app/app/users');
  });

  it('keeps query and hash after joining basename', () => {
    mount('/users?tab=1#bio');
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app/users?tab=1#bio');
  });

  it('keeps query when to is the basename root', () => {
    mount('/app?tab=1');
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app?tab=1');
  });

  it('keeps tel/sms native (no basename prefix)', () => {
    const { unmount } = mount('tel:+15551212');
    expect(screen.getByText('Go')).toHaveAttribute('href', 'tel:+15551212');
    unmount();
    mount('sms:+15551212');
    expect(screen.getByText('Go')).toHaveAttribute('href', 'sms:+15551212');
  });
});

describe('W24-02 NavLink active', () => {
  it('sets aria-current=page only on the active link', () => {
    window.history.pushState({}, '', '/users');
    render(
      <Router
        initialPath="/users"
        routes={[
          {
            path: '/users',
            component: () => (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/users">Users</NavLink>
              </>
            ),
          },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
  });

  it('treats a basename-prefixed to as the same route for active + href', () => {
    window.history.pushState({}, '', '/app/users');
    render(
      <Router
        basename="/app"
        initialPath="/app/users"
        routes={[
          {
            path: '/users',
            component: () => (
              <>
                <NavLink to="/users">Users</NavLink>
                <NavLink to="/app/users">UsersPrefixed</NavLink>
              </>
            ),
          },
        ]}
      />
    );
    const users = screen.getByRole('link', { name: 'Users' });
    const prefixed = screen.getByRole('link', { name: 'UsersPrefixed' });
    expect(users.className.split(/\s+/)).toContain('active');
    expect(prefixed.className.split(/\s+/)).toContain('active');
    expect(users).toHaveAttribute('href', '/app/users');
    expect(prefixed).toHaveAttribute('href', '/app/users');
    expect(users).toHaveAttribute('aria-current', 'page');
    expect(prefixed).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark /dash active on /dashboard (segment boundary)', () => {
    window.history.pushState({}, '', '/dashboard');
    render(
      <Router
        initialPath="/dashboard"
        routes={[
          {
            path: '/dashboard',
            component: () => (
              <>
                <NavLink to="/dash">Dash</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </>
            ),
          },
        ]}
      />
    );
    expect(screen.getByText('Dash').className.split(/\s+/)).not.toContain('active');
    expect(screen.getByText('Dashboard').className.split(/\s+/)).toContain('active');
  });
});

describe('W24-02 nested Outlet', () => {
  it('paints three layout levels and the leaf meta/params', () => {
    window.history.pushState({}, '', '/app/settings/42');

    function AppLayout() {
      return <div>app-<Outlet /></div>;
    }
    function SettingsLayout() {
      const meta = useRouteMeta<{ title?: string }>();
      return (
        <div>
          settings-{meta?.title ?? 'none'}-
          <Outlet />
        </div>
      );
    }
    function Profile() {
      const { id } = useParams<{ id: string }>();
      const meta = useRouteMeta<{ title?: string }>();
      return (
        <span>
          profile-{id}-{meta?.title ?? 'none'}
        </span>
      );
    }

    render(
      <Router
        initialPath="/app/settings/42"
        routes={[
          {
            path: '/app',
            component: AppLayout,
            children: [
              {
                path: '/app/settings',
                component: SettingsLayout,
                meta: { title: 'Settings' },
                children: [
                  {
                    path: '/app/settings/:id',
                    component: Profile,
                    meta: { title: 'Profile' },
                  },
                ],
              },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText(/app-/)).toBeTruthy();
    expect(screen.getByText(/settings-Settings-/)).toBeTruthy();
    expect(screen.getByText('profile-42-Profile')).toBeTruthy();
  });

  it('leaves Outlet empty when no child matches (no throw)', () => {
    window.history.pushState({}, '', '/app/missing');
    function AppLayout() {
      return (
        <div>
          shell
          <Outlet />
        </div>
      );
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <Router
        initialPath="/app/missing"
        fallback={() => <div>404</div>}
        routes={[
          {
            path: '/app',
            component: AppLayout,
            children: [{ path: '/app/dash', component: () => <span>dash</span> }],
          },
        ]}
      />
    );
    expect(screen.getByText('shell')).toBeTruthy();
    expect(screen.queryByText('dash')).toBeNull();
    spy.mockRestore();
  });
});
