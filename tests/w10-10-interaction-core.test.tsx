import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIBO_INTERACTION_FX_CSS } from '../src/core/interactionFxCss';
import { promoteSurfaceLonghandsInStyle } from '../src/core/smoothInteraction';
import { Reveal } from '../src/core/Reveal';
import { ResponsiveWrapper } from '../src/core/ResponsiveWrapper';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function fiboFxHostBlock(): string {
  const m = FIBO_INTERACTION_FX_CSS.match(/\.fibo-fx\s*\{([^}]*)\}/);
  expect(m).toBeTruthy();
  return m![1];
}

describe('W10-10 resting transform', () => {
  it('does not set a resting transform on .fibo-fx (hover would replace the matrix)', () => {
    const host = fiboFxHostBlock();
    expect(host).not.toMatch(/transform\s*:/);
    expect(host).toMatch(/backface-visibility:\s*hidden/);
  });
});

describe('W10-10 hover longhands', () => {
  it('promotes modern color functions that use / alpha to backgroundColor', () => {
    const rgb = promoteSurfaceLonghandsInStyle({ background: 'rgb(0 0 0 / 0.5)' });
    expect(rgb.background).toBeUndefined();
    expect(rgb.backgroundColor).toBe('rgb(0 0 0 / 0.5)');

    const oklch = promoteSurfaceLonghandsInStyle({
      background: 'oklch(0.7 0.15 180 / 0.9)',
    });
    expect(oklch.background).toBeUndefined();
    expect(oklch.backgroundColor).toBe('oklch(0.7 0.15 180 / 0.9)');
  });

  it('does not promote background:none into invalid background-color:none', () => {
    const next = promoteSurfaceLonghandsInStyle({ background: 'none' });
    expect(next.backgroundColor).toBeUndefined();
    expect(next.background).toBe('none');
  });

  it('still leaves gradient / image shorthands alone', () => {
    const gradient = 'linear-gradient(90deg, #000, #fff)';
    expect(promoteSurfaceLonghandsInStyle({ background: gradient }).background).toBe(gradient);
    const image = 'url(/card.png) center / cover';
    expect(promoteSurfaceLonghandsInStyle({ background: image }).background).toBe(image);
  });
});

describe('W10-10 Reveal IO unobserve', () => {
  it('unobserves after the first intersect when once is true', () => {
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    let cb: IntersectionObserverCallback | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn((node: Element) => {
          cb?.(
            [{ isIntersecting: true, target: node } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        });
        unobserve = unobserve;
        disconnect = disconnect;
        constructor(callback: IntersectionObserverCallback) {
          cb = callback;
        }
      },
    );

    render(createElement(Reveal, { once: true, preset: 'fadeUp' }, 'later'));
    expect(unobserve).toHaveBeenCalledTimes(1);
  });

  it('does not unobserve when once is false; leaves viewport removes fibo-inview', () => {
    const unobserve = vi.fn();
    let cb: IntersectionObserverCallback | undefined;
    let observed: Element | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn((node: Element) => {
          observed = node;
        });
        unobserve = unobserve;
        disconnect = vi.fn();
        constructor(callback: IntersectionObserverCallback) {
          cb = callback;
        }
      },
    );

    render(createElement(Reveal, { once: false, preset: 'fadeUp' }, 'toggle'));
    const observer = { unobserve } as unknown as IntersectionObserver;
    act(() => {
      cb?.(
        [{ isIntersecting: true, target: observed! } as IntersectionObserverEntry],
        observer,
      );
    });
    expect(observed!.classList.contains('fibo-inview')).toBe(true);
    expect(unobserve).not.toHaveBeenCalled();
    act(() => {
      cb?.(
        [{ isIntersecting: false, target: observed! } as IntersectionObserverEntry],
        observer,
      );
    });
    expect(observed!.classList.contains('fibo-inview')).toBe(false);
  });

  it('unobserve uses the callback observer so constructor-sync polyfills do not TDZ', () => {
    const unobserve = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        unobserve = unobserve;
        disconnect = vi.fn();
        observe = vi.fn();
        constructor(callback: IntersectionObserverCallback) {
          const target = document.createElement('div');
          callback(
            [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
        }
      },
    );

    expect(() =>
      render(createElement(Reveal, { once: true }, 'sync')),
    ).not.toThrow();
    expect(unobserve).toHaveBeenCalled();
  });
});

describe('W10-10 ResponsiveWrapper SSR', () => {
  it('renderToString uses the 1024 desktop snapshot, not jsdom innerWidth', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      get: () => 375,
    });
    const html = renderToString(
      createElement(ResponsiveWrapper, {
        responsive: { mobile: { color: 'red' }, desktop: { color: 'blue' } },
        children: createElement('div', { id: 'rw', style: {} }, 'x'),
      }),
    );
    expect(html).toMatch(/color:\s*blue/);
    expect(html).not.toMatch(/color:\s*red/);
  });
});
