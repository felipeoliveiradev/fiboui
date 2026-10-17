import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { Router, useLocation, useNavigate, useParams, useQuery } from '../src/navigation';

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

function Page() {
  return createElement(
    'div',
    null,
    createElement(LocationProbe),
    createElement(GoButton, { to: '#bio', label: 'hash' }),
    createElement(GoButton, { to: '?tab=info', label: 'query' }),
    createElement(GoButton, { to: '/?tab=root', label: 'root' })
  );
}

const routes = [
  { path: '/', component: Page },
  { path: '/users/:id', component: Page },
];

describe('W24-01 navigate query/hash-only keeps the current route', () => {
  it('navigate("#bio") does not match "/" — keeps path, query, and params', async () => {
    window.history.pushState({}, '', '/users/5?tab=info');
    render(
      createElement(Router, {
        initialPath: '/users/5',
        initialSearch: '?tab=info',
        routes,
      })
    );
    expect(screen.getByTestId('loc').textContent).toBe('/users/5|info||5');
    await act(async () => {
      fireEvent.click(screen.getByText('hash'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('loc').textContent).toBe('/users/5|info|#bio|5');
    });
    expect(window.location.pathname).toBe('/users/5');
    expect(window.location.search).toBe('?tab=info');
    expect(window.location.hash).toBe('#bio');
  });

  it('navigate("?tab=info") does not match "/" — keeps path and params, clears hash', async () => {
    window.history.pushState({}, '', '/users/5#old');
    render(
      createElement(Router, {
        initialPath: '/users/5',
        initialHash: '#old',
        routes,
      })
    );
    expect(screen.getByTestId('loc').textContent).toBe('/users/5||#old|5');
    await act(async () => {
      fireEvent.click(screen.getByText('query'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('loc').textContent).toBe('/users/5|info||5');
    });
    expect(window.location.pathname).toBe('/users/5');
    expect(window.location.search).toBe('?tab=info');
    expect(window.location.hash).toBe('');
  });

  it('navigate("/?tab=root") still goes to the explicit "/" path', async () => {
    window.history.pushState({}, '', '/users/5');
    render(
      createElement(Router, {
        initialPath: '/users/5',
        routes,
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByText('root'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('loc').textContent).toBe('/|root||');
    });
    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('?tab=root');
  });
});

describe('W24-01 SSR initialPath query/hash', () => {
  it('seeds useLocation from ? and # embedded in initialPath', () => {
    const html = renderToString(
      createElement(Router, {
        initialPath: '/users/5?tab=info#bio',
        routes: [{ path: '/users/:id', component: LocationProbe }],
      })
    );
    expect(html).toContain('/users/5|info|#bio|5');
    expect(html).not.toContain('404');
  });
});
