import { createElement, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultErrorPage, Router, RouterContext, type RouterContextValue } from '../src/navigation';

function stubRouter(overrides: Partial<RouterContextValue> = {}): RouterContextValue {
  return {
    currentPath: '/',
    basename: '',
    navigate: () => undefined,
    goBack: () => undefined,
    replace: () => undefined,
    params: {},
    query: new URLSearchParams(),
    hash: '',
    ...overrides,
  };
}

function withRouter(basename: string, node: ReactNode) {
  return createElement(RouterContext.Provider, { value: stubRouter({ basename }) }, node);
}

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

describe('DefaultErrorPage Go Home basename', () => {
  it('without a Router, Go Home points at /', () => {
    render(createElement(DefaultErrorPage, { error: new Error('boom') }));
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/');
  });

  it('with basename /app, Go Home points at /app not /', () => {
    render(
      withRouter(
        '/app',
        createElement(DefaultErrorPage, { error: new Error('boom') })
      )
    );
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/app');
  });

  it('trailing-slash basename /app/ still goes to /app', () => {
    render(
      withRouter(
        '/app/',
        createElement(DefaultErrorPage, { error: new Error('boom') })
      )
    );
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/app');
  });

  it('Go Home under a crashing Router route uses the mount basename', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.history.pushState({}, '', '/app/crash');
    function Crash(): ReactNode {
      throw new Error('route-boom');
    }
    render(
      createElement(Router, {
        basename: '/app',
        initialPath: '/app/crash',
        routes: [{ path: '/crash', component: Crash }],
      })
    );
    expect(screen.getByText('route-boom')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/app');
    spy.mockRestore();
  });
});

describe('DefaultErrorPage crash UI a11y', () => {
  it('exposes an assertive alert labelled by the heading', () => {
    render(createElement(DefaultErrorPage, { error: new Error('boom') }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    const titleId = alert.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    const heading = document.getElementById(titleId!);
    expect(heading?.textContent).toMatch(/something went wrong/i);
  });

  it('hides the decorative icon from assistive tech', () => {
    render(createElement(DefaultErrorPage, { error: new Error('boom') }));
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('action controls do not submit a form', () => {
    const onReset = vi.fn();
    render(createElement(DefaultErrorPage, { error: new Error('boom'), onReset }));
    expect(screen.getByRole('button', { name: 'Try Again' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Reload Page' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('link', { name: 'Go Home' }).tagName).toBe('A');
  });
});

describe('DefaultErrorPage error message', () => {
  it('renders the thrown error message', () => {
    render(createElement(DefaultErrorPage, { error: new Error('disk full') }));
    expect(screen.getByText('disk full')).toBeTruthy();
  });

  it('shows a fallback when Error.message is empty', () => {
    render(createElement(DefaultErrorPage, { error: new Error('') }));
    expect(screen.getByText(/unexpected error/i)).toBeTruthy();
  });
});

describe('DefaultErrorPage Try Again', () => {
  it('is always present and calls onReset when provided', () => {
    const onReset = vi.fn();
    render(createElement(DefaultErrorPage, { error: new Error('boom'), onReset }));
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('is still present without onReset so a crash page always has a retry CTA', () => {
    render(createElement(DefaultErrorPage, { error: new Error('boom') }));
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeTruthy();
  });
});
