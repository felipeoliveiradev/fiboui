import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Router,
  useLocation,
  useNavigate,
  useParams,
  useQuery,
  useRouter,
} from '../src/navigation';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

function LocationProbe() {
  const loc = useLocation();
  const query = useQuery();
  const params = useParams<{ id?: string }>();
  return createElement(
    'div',
    { 'data-testid': 'loc' },
    `${loc.pathname}|${query.get('tab') ?? ''}|${loc.hash}|${params.id ?? ''}`
  );
}

function GoButton({ to, label = 'go' }: { to: string; label?: string }) {
  const navigate = useNavigate();
  return createElement('button', { type: 'button', onClick: () => void navigate(to) }, label);
}

describe('W9-03 unmatched route', () => {
  it('renders the default 404 instead of a blank page', () => {
    window.history.pushState({}, '', '/nope');
    render(
      createElement(Router, {
        initialPath: '/nope',
        routes: [{ path: '/', component: () => createElement('div', null, 'home') }],
      })
    );
    expect(screen.queryByText('home')).toBeNull();
    expect(screen.getByText(/404/)).toBeTruthy();
    expect(document.body.textContent?.trim()).not.toBe('');
  });

  it('navigate to an unknown path shows 404, not a blank screen', async () => {
    function Home() {
      return createElement('div', null, 'home', createElement(GoButton, { to: '/missing' }));
    }
    render(
      createElement(Router, {
        routes: [{ path: '/', component: Home }],
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    expect(screen.queryByText('home')).toBeNull();
    expect(screen.getByText(/404/)).toBeTruthy();
  });
});

describe('W9-03 params update on navigate', () => {
  it('useParams follows /users/:id when the id changes', async () => {
    function Profile() {
      const { id } = useParams<{ id: string }>();
      return createElement(
        'div',
        null,
        createElement('span', { 'data-testid': 'id' }, id),
        createElement(GoButton, { to: '/users/2', label: 'next' })
      );
    }
    window.history.pushState({}, '', '/users/1');
    render(
      createElement(Router, {
        initialPath: '/users/1',
        routes: [{ path: '/users/:id', component: Profile }],
      })
    );
    expect(screen.getByTestId('id').textContent).toBe('1');
    await act(async () => {
      fireEvent.click(screen.getByText('next'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('id').textContent).toBe('2');
    });
  });
});

describe('W9-03 navigate query/hash', () => {
  it('keeps the route match and updates query + hash (does not 404)', async () => {
    function Page() {
      return createElement(
        'div',
        null,
        createElement(LocationProbe),
        createElement(GoButton, { to: '/users/5?tab=info#bio' })
      );
    }
    render(
      createElement(Router, {
        routes: [
          { path: '/', component: Page },
          { path: '/users/:id', component: Page },
        ],
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('loc').textContent).toBe('/users/5|info|#bio|5');
    });
    expect(screen.queryByText(/404/)).toBeNull();
    expect(window.location.pathname).toBe('/users/5');
    expect(window.location.search).toBe('?tab=info');
    expect(window.location.hash).toBe('#bio');
  });

  it('clears stale hash/query when navigating to a bare path', async () => {
    function Page() {
      return createElement(
        'div',
        null,
        createElement(LocationProbe),
        createElement(GoButton, { to: '/about' })
      );
    }
    window.history.pushState({}, '', '/users/1?tab=old#x');
    render(
      createElement(Router, {
        initialPath: '/users/1',
        initialSearch: '?tab=old',
        initialHash: '#x',
        routes: [
          { path: '/users/:id', component: Page },
          { path: '/about', component: Page },
        ],
      })
    );
    expect(screen.getByTestId('loc').textContent).toBe('/users/1|old|#x|1');
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('loc').textContent).toBe('/about|||');
    });
  });
});

describe('W9-03 basename', () => {
  it('navigate joins basename once and strips it from currentPath', async () => {
    function Page() {
      const { currentPath, basename } = useRouter();
      return createElement(
        'div',
        null,
        createElement('span', { 'data-testid': 'path' }, `${basename}|${currentPath}`),
        createElement(GoButton, { to: '/users' })
      );
    }
    window.history.pushState({}, '', '/app');
    render(
      createElement(Router, {
        basename: '/app',
        initialPath: '/app',
        routes: [
          { path: '/', component: Page },
          { path: '/users', component: Page },
        ],
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/app|/users');
    });
    expect(window.location.pathname).toBe('/app/users');
  });

  it('navigate with a basename-prefixed path does not double the prefix', async () => {
    function Page() {
      const { currentPath } = useRouter();
      return createElement(
        'div',
        null,
        createElement('span', { 'data-testid': 'path' }, currentPath),
        createElement(GoButton, { to: '/app/users' })
      );
    }
    window.history.pushState({}, '', '/app');
    render(
      createElement(Router, {
        basename: '/app',
        initialPath: '/app',
        routes: [
          { path: '/', component: Page },
          { path: '/users', component: Page },
        ],
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/users');
    });
    expect(window.location.pathname).toBe('/app/users');
    expect(window.location.pathname).not.toBe('/app/app/users');
    expect(screen.queryByText(/404/)).toBeNull();
  });
});

describe('W9-03 history leak', () => {
  it('removes the popstate listener on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      createElement(Router, {
        routes: [{ path: '/', component: () => createElement('div', null, 'home') }],
      })
    );
    const added = add.mock.calls.filter((c) => c[0] === 'popstate').map((c) => c[1]);
    expect(added.length).toBeGreaterThanOrEqual(1);
    unmount();
    const removed = remove.mock.calls.filter((c) => c[0] === 'popstate').map((c) => c[1]);
    for (const handler of added) {
      expect(removed).toContain(handler);
    }
    add.mockRestore();
    remove.mockRestore();
  });

  it('does not pushState after unmount during an async beforeEnter', async () => {
    let release!: (value: boolean) => void;
    const gate = new Promise<boolean>((resolve) => {
      release = resolve;
    });
    function Home() {
      return createElement(GoButton, { to: '/b' });
    }
    const { unmount } = render(
      createElement(Router, {
        routes: [
          { path: '/', component: Home },
          { path: '/b', component: () => createElement('div', null, 'B'), beforeEnter: () => gate },
        ],
      })
    );
    fireEvent.click(screen.getByText('go'));
    unmount();
    const spy = vi.spyOn(window.history, 'pushState');
    release(true);
    await act(async () => {
      await gate;
      await Promise.resolve();
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not push a duplicate history entry for the current URL', async () => {
    function Page() {
      return createElement(GoButton, { to: '/stay?x=1#h' });
    }
    window.history.pushState({}, '', '/stay?x=1#h');
    const spy = vi.spyOn(window.history, 'pushState');
    render(
      createElement(Router, {
        initialPath: '/stay',
        initialSearch: '?x=1',
        initialHash: '#h',
        routes: [{ path: '/stay', component: Page }],
      })
    );
    spy.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('W9-03 nested router', () => {
  it('inner basename router matches on first paint (SSR) instead of 404', () => {
    function Shell() {
      return createElement(
        'div',
        null,
        'shell-',
        createElement(Router, {
          basename: '/app',
          routes: [{ path: '/dash', component: () => createElement('span', null, 'dash') }],
        })
      );
    }
    const html = renderToString(
      createElement(Router, {
        initialPath: '/app/dash',
        routes: [{ path: '/app', exact: false, component: Shell }],
      })
    );
    expect(html).toContain('shell-');
    expect(html).toContain('dash');
    expect(html).not.toContain('404');
  });

  it('inner navigate updates the parent path and does not double basename', async () => {
    function InnerPage() {
      const { currentPath } = useRouter();
      return createElement(
        'div',
        null,
        createElement('span', { 'data-testid': 'inner' }, currentPath),
        createElement(GoButton, { to: '/settings' })
      );
    }
    function Shell() {
      const { currentPath } = useRouter();
      return createElement(
        'div',
        null,
        createElement('span', { 'data-testid': 'outer' }, currentPath),
        createElement(Router, {
          basename: '/app',
          routes: [
            { path: '/dash', component: InnerPage },
            { path: '/settings', component: InnerPage },
          ],
        })
      );
    }
    window.history.pushState({}, '', '/app/dash');
    render(
      createElement(Router, {
        initialPath: '/app/dash',
        routes: [{ path: '/app', exact: false, component: Shell }],
      })
    );
    expect(screen.getByTestId('outer').textContent).toBe('/app/dash');
    expect(screen.getByTestId('inner').textContent).toBe('/dash');
    await act(async () => {
      fireEvent.click(screen.getByText('go'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('inner').textContent).toBe('/settings');
    });
    expect(screen.getByTestId('outer').textContent).toBe('/app/settings');
    expect(window.location.pathname).toBe('/app/settings');
    expect(window.location.pathname).not.toBe('/app/app/settings');
  });

  it('nested routers share a single popstate listener', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    function Shell() {
      return createElement(Router, {
        basename: '/app',
        routes: [{ path: '/dash', component: () => createElement('span', null, 'dash') }],
      });
    }
    window.history.pushState({}, '', '/app/dash');
    render(
      createElement(Router, {
        initialPath: '/app/dash',
        routes: [{ path: '/app', exact: false, component: Shell }],
      })
    );
    const net =
      add.mock.calls.filter((c) => c[0] === 'popstate').length -
      remove.mock.calls.filter((c) => c[0] === 'popstate').length;
    expect(net).toBe(1);
    add.mockRestore();
    remove.mockRestore();
  });
});
