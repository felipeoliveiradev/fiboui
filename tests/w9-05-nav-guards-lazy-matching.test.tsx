import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPath,
  composeGuards,
  findMatchingRoute,
  lazyRoute,
  matchPath,
  redirect,
  requireAuth,
  requireRole,
} from '../src/navigation';
import type { Route } from '../src/navigation';

const Leaf = () => createElement('div', null, 'leaf');
const Other = () => createElement('div', null, 'other');

function route(path: string, extra: Partial<Route> = {}): Route {
  return { path, component: Leaf, ...extra };
}

afterEach(() => {
  cleanup();
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRoles');
  } catch {
    /* jsdom always has storage */
  }
});

describe('matchPath splat / optional / decode', () => {
  it('optional :id? matches with and without the segment', () => {
    expect(matchPath('/users', '/users/:id?').match).toBe(true);
    expect(matchPath('/users', '/users/:id?').params).toEqual({});
    expect(matchPath('/users/42', '/users/:id?').match).toBe(true);
    expect(matchPath('/users/42', '/users/:id?').params).toEqual({ id: '42' });
    expect(matchPath('/users/42/posts', '/users/:id?').match).toBe(false);
  });

  it('named splat :rest* captures remaining segments', () => {
    expect(matchPath('/files/a/b', '/files/:rest*').match).toBe(true);
    expect(matchPath('/files/a/b', '/files/:rest*').params).toEqual({ rest: 'a/b' });
    expect(matchPath('/files', '/files/:rest*').match).toBe(false);
  });

  it('optional named splat :rest*? matches zero remaining segments', () => {
    expect(matchPath('/files', '/files/:rest*?').match).toBe(true);
    expect(matchPath('/files', '/files/:rest*?').params).toEqual({ rest: '' });
    expect(matchPath('/files/a/b', '/files/:rest*?').params).toEqual({ rest: 'a/b' });
  });

  it('decodes percent-encoded param and splat segments', () => {
    expect(matchPath('/users/a%20b', '/users/:id').params).toEqual({ id: 'a b' });
    expect(matchPath('/files/a%2Fb/c', '/files/*').params['*']).toBe('a/b/c');
  });

  it('buildPath substitutes splat and omits missing optional params', () => {
    expect(buildPath('/files/*', { '*': 'a/b' })).toBe('/files/a/b');
    expect(buildPath('/files/:rest*', { rest: 'a/b' })).toBe('/files/a/b');
    expect(buildPath('/users/:id?', { id: '42' })).toBe('/users/42');
    expect(buildPath('/users/:id?', {})).toBe('/users');
  });
});

describe('findMatchingRoute precedence', () => {
  it('static sibling wins over a param route listed first', () => {
    const routes = [route('/users/:id', { component: Leaf }), route('/users/settings', { component: Other })];
    const found = findMatchingRoute(routes, '/users/settings');
    expect(found.route?.path).toBe('/users/settings');
    expect(found.route?.component).toBe(Other);
    expect(found.params).toEqual({});
  });

  it('param route wins over a splat listed first', () => {
    const routes = [route('/files/*', { component: Leaf }), route('/files/:name', { component: Other })];
    const found = findMatchingRoute(routes, '/files/readme');
    expect(found.route?.path).toBe('/files/:name');
    expect(found.params).toEqual({ name: 'readme' });
  });

  it('static leaf wins over a prefix-matching param layout sibling', () => {
    const routes = [
      route('/users/:id', { component: Leaf, children: [route('/users/:id/profile')] }),
      route('/users/settings', { component: Other }),
    ];
    const found = findMatchingRoute(routes, '/users/settings');
    expect(found.route?.path).toBe('/users/settings');
    expect(found.leaf?.path).toBe('/users/settings');
  });
});

describe('guards redirect loops', () => {
  it('requireAuth allows the login route itself when unauthenticated', () => {
    expect(requireAuth('/login')(route('/login'), null)).toBe(true);
    expect(requireAuth('/login')(route('/login/'), null)).toBe(true);
    expect(requireAuth('/login')(route('/secret'), null)).toBe('/login');
  });

  it('requireRole allows the unauthorized route itself', () => {
    expect(requireRole('admin')(route('/unauthorized'), null)).toBe(true);
    expect(requireRole('admin')(route('/admin'), null)).toBe('/unauthorized');
  });

  it('redirect is a no-op when already on the target path', () => {
    expect(redirect('/gone')(route('/gone'), null)).toBe(true);
    expect(redirect('/gone')(route('/here'), null)).toBe('/gone');
  });

  it('composeGuards does not emit a self-redirect', async () => {
    const looped = composeGuards(redirect('/login'), requireAuth('/login'));
    await expect(looped(route('/login'), null)).resolves.toBe(true);
  });
});

describe('lazyRoute ErrorBoundary', () => {
  it('failed import is caught and can retry after the chunk appears', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let fail = true;
    const loader = () =>
      fail
        ? Promise.reject(new Error('chunk-fail'))
        : Promise.resolve({ default: () => createElement('div', null, 'lazy-ok') });

    const LazyPage = lazyRoute(loader);
    render(createElement(LazyPage));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/chunk-fail/);

    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(await screen.findByText('lazy-ok')).toBeTruthy();
    spy.mockRestore();
  });
});
