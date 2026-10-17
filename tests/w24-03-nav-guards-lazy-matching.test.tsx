import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  composeGuards,
  findMatchingRoute,
  lazyRoute,
  matchPath,
  redirect,
  requireAuth,
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

describe('W24-03 matchPath param / splat / encode', () => {
  it('optional param in the middle backtracks so /:lang?/about matches /about', () => {
    expect(matchPath('/about', '/:lang?/about').match).toBe(true);
    expect(matchPath('/about', '/:lang?/about').params).toEqual({});
    expect(matchPath('/en/about', '/:lang?/about').match).toBe(true);
    expect(matchPath('/en/about', '/:lang?/about').params).toEqual({ lang: 'en' });
    expect(matchPath('/users/edit', '/users/:id?/edit').match).toBe(true);
    expect(matchPath('/users/edit', '/users/:id?/edit').params).toEqual({});
    expect(matchPath('/users/42/edit', '/users/:id?/edit').params).toEqual({ id: '42' });
  });

  it('splat in the middle leaves trailing static segments', () => {
    expect(matchPath('/files/a/b/raw', '/files/*/raw').match).toBe(true);
    expect(matchPath('/files/a/b/raw', '/files/*/raw').params['*']).toBe('a/b');
    expect(matchPath('/files/report.pdf/download', '/files/:rest*/download').match).toBe(true);
    expect(matchPath('/files/report.pdf/download', '/files/:rest*/download').params).toEqual({
      rest: 'report.pdf',
    });
    expect(matchPath('/files/download', '/files/*/download').match).toBe(false);
  });

  it('decodes percent-encoded static segments', () => {
    expect(matchPath('/hello%20world', '/hello world').match).toBe(true);
    expect(matchPath('/caf%C3%A9', '/café').match).toBe(true);
    expect(matchPath('/caf%C3%A9/menu', '/café/:page').params).toEqual({ page: 'menu' });
  });

  it('static index wins over a catch-all * on /', () => {
    const routes = [route('*', { component: Other }), route('/', { component: Leaf })];
    const found = findMatchingRoute(routes, '/');
    expect(found.route?.path).toBe('/');
    expect(found.route?.component).toBe(Leaf);
  });

  it('sibling catch-all still wins when a root layout has no matching child', () => {
    const routes = [
      route('/', { component: Leaf, children: [route('/home', { component: Other })] }),
      route('*', { component: Other }),
    ];
    const found = findMatchingRoute(routes, '/missing');
    expect(found.route?.path).toBe('*');
    expect(found.route?.component).toBe(Other);
  });
});

describe('W24-03 guard redirect query/hash', () => {
  it('requireAuth allows the login pathname when loginPath carries a query', () => {
    expect(requireAuth('/login?from=/app')(route('/login'), null)).toBe(true);
    expect(requireAuth('/login?from=/app')(route('/login/'), null)).toBe(true);
    expect(requireAuth('/login?from=/app')(route('/secret'), null)).toBe('/login?from=/app');
  });

  it('redirect is a no-op when already on the target pathname (query/hash ignored)', () => {
    expect(redirect('/gone?x=1')(route('/gone'), null)).toBe(true);
    expect(redirect('/gone#top')(route('/gone/'), null)).toBe(true);
    expect(redirect('/gone?x=1')(route('/here'), null)).toBe('/gone?x=1');
  });

  it('composeGuards does not emit a self-redirect that only differs by query', async () => {
    const looped = composeGuards(redirect('/login?from=/app'), requireAuth('/login?from=/app'));
    await expect(looped(route('/login'), null)).resolves.toBe(true);
  });
});

describe('W24-03 lazyRoute loader errors', () => {
  it('falsy rejection is shown as an error and can retry', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let fail = true;
    const loader = () =>
      fail
        ? Promise.reject(undefined)
        : Promise.resolve({ default: () => createElement('div', null, 'lazy-ok') });

    const LazyPage = lazyRoute(loader);
    render(createElement(LazyPage));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to load route');

    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(await screen.findByText('lazy-ok')).toBeTruthy();
    spy.mockRestore();
  });
});
