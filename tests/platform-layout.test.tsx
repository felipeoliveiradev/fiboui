import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeyboardInset } from '../src/layout/KeyboardInset';
import { LayoutBuilder } from '../src/layout/LayoutBuilder';
import { NavigationSplitView } from '../src/layout/NavigationSplitView';
import { OrientationBuilder } from '../src/layout/OrientationBuilder';
import { PopScope } from '../src/layout/PopScope';

/**
 * Orientation strategy: jsdom does not provide window.matchMedia.
 * OrientationBuilder treats a missing matchMedia as portrait, so the portrait
 * branch is what renders here. A second case stubs matchMedia with matches:true
 * for `(orientation: portrait)` and expects the same branch.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('OrientationBuilder', () => {
  it('shows the portrait branch when matchMedia is missing', () => {
    expect(typeof window.matchMedia).not.toBe('function');

    render(
      OrientationBuilder()
        .portrait('portrait-branch')
        .landscape('landscape-branch')
    );

    expect(screen.getByText('portrait-branch')).toBeTruthy();
    expect(screen.queryByText('landscape-branch')).toBeNull();
  });

  it('shows the portrait branch when matchMedia matches the portrait query', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('portrait'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }));

    render(
      OrientationBuilder()
        .portrait({ build: () => 'portrait-built' })
        .landscape('landscape-built')
    );

    expect(screen.getByText('portrait-built')).toBeTruthy();
    expect(screen.queryByText('landscape-built')).toBeNull();
  });
});

describe('LayoutBuilder', () => {
  it('renders the builder return value, including a zero size', () => {
    const builder = vi.fn((size: { width: number; height: number }) => {
      return `laid-out-${size.width}x${size.height}`;
    });

    render(LayoutBuilder().builder(builder));

    expect(builder).toHaveBeenCalled();
    const size = builder.mock.lastCall?.[0];
    expect(size).toBeTruthy();
    expect(screen.getByText(`laid-out-${size!.width}x${size!.height}`)).toBeTruthy();
  });
});

describe('KeyboardInset', () => {
  it('renders the child with a numeric data-keyboard-inset', () => {
    render(KeyboardInset().child({ build: () => 'inset-child' }));

    expect(screen.getByText('inset-child')).toBeTruthy();
    const host = document.querySelector('[data-keyboard-inset]') as HTMLElement;
    expect(host).toBeTruthy();
    expect(host.getAttribute('data-keyboard-inset')).toMatch(/^\d+$/);
    if (!window.visualViewport) {
      expect(host.getAttribute('data-keyboard-inset')).toBe('0');
      expect(host.style.paddingBottom).toBe('0px');
    }
  });
});

describe('PopScope', () => {
  it('calls onPop when canPop is false and a popstate is dispatched', () => {
    const onPop = vi.fn();
    render(PopScope().canPop(false).onPop(onPop).child('stay-here'));

    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

    expect(onPop).toHaveBeenCalledTimes(1);
    expect(screen.getByText('stay-here')).toBeTruthy();
  });
});

describe('NavigationSplitView', () => {
  it('compact mode shows only the selected pane', () => {
    render(
      NavigationSplitView()
        .compact(true)
        .pane('detail')
        .sidebar('side-col')
        .content('content-col')
        .detail({ build: () => 'detail-col' })
    );

    expect(screen.getByText('detail-col')).toBeTruthy();
    expect(screen.queryByText('side-col')).toBeNull();
    expect(screen.queryByText('content-col')).toBeNull();
    expect(screen.getByRole('toolbar', { name: 'Panes' })).toBeTruthy();
  });

  it('places role=navigation on the sidebar in the wide layout', () => {
    render(
      NavigationSplitView()
        .sidebar('side-nav')
        .content('mid-col')
        .detail('end-col')
    );

    expect(screen.getByRole('navigation')).toHaveTextContent('side-nav');
    expect(screen.getByText('mid-col')).toBeTruthy();
    expect(screen.getByText('end-col')).toBeTruthy();
  });
});
