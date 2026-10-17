import { createElement, useState } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from '../src/core/Reveal';
import { ResponsiveWrapper } from '../src/core/ResponsiveWrapper';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubIntersectingObserver() {
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn((node: Element) => {
        (this as unknown as { _cb: IntersectionObserverCallback })._cb(
          [{ isIntersecting: true, target: node } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      });
      unobserve = unobserve;
      disconnect = disconnect;
      constructor(cb: IntersectionObserverCallback) {
        (this as unknown as { _cb: IntersectionObserverCallback })._cb = cb;
      }
    },
  );
  return { unobserve, disconnect };
}

describe('W24-06 Reveal inview survives React className updates', () => {
  it('keeps fibo-inview after parent re-render when once has unobserved', () => {
    const { unobserve } = stubIntersectingObserver();

    function Host({ label }: { label: string }) {
      return createElement(Reveal, { once: true, preset: 'fadeUp' }, label);
    }

    const { rerender, container } = render(createElement(Host, { label: 'one' }));
    const wrap = container.querySelector('[data-fibo-reveal]') as HTMLElement;
    expect(wrap.classList.contains('fibo-inview')).toBe(true);
    expect(unobserve).toHaveBeenCalled();

    rerender(createElement(Host, { label: 'two' }));
    const wrap2 = container.querySelector('[data-fibo-reveal]') as HTMLElement;
    expect(wrap2.classList.contains('fibo-inview')).toBe(true);
    expect(wrap2.textContent).toBe('two');
  });

  it('keeps fibo-inview when preset className updates after once unobserve', () => {
    const { unobserve } = stubIntersectingObserver();

    const { rerender, container } = render(
      createElement(Reveal, { once: true, preset: 'fadeUp' }, 'hero'),
    );
    expect(container.querySelector('[data-fibo-reveal]')!.classList.contains('fibo-inview')).toBe(
      true,
    );
    expect(unobserve).toHaveBeenCalledTimes(1);

    rerender(createElement(Reveal, { once: true, preset: 'slideUp' }, 'hero'));
    const wrap = container.querySelector('[data-fibo-reveal]') as HTMLElement;
    expect(wrap.className).toMatch(/fibo-reveal-slideUp/);
    expect(wrap.classList.contains('fibo-inview')).toBe(true);
  });

  it('keeps fibo-inview when a sibling state update re-renders the tree', () => {
    stubIntersectingObserver();

    function Tree() {
      const [n, setN] = useState(0);
      return createElement(
        'div',
        null,
        createElement(
          'button',
          { type: 'button', onClick: () => setN((v) => v + 1) },
          `tick ${n}`,
        ),
        createElement(Reveal, { once: true, preset: 'fadeIn' }, 'hero'),
      );
    }

    render(createElement(Tree));
    const wrap = document.querySelector('[data-fibo-reveal]') as HTMLElement;
    expect(wrap.classList.contains('fibo-inview')).toBe(true);

    act(() => {
      screen.getByRole('button', { name: /tick/ }).click();
    });
    expect(wrap.classList.contains('fibo-inview')).toBe(true);
    expect(screen.getByRole('button').textContent).toBe('tick 1');
  });
});

describe('W24-06 ResponsiveWrapper live resize', () => {
  it('re-applies mobile styles when innerWidth crosses the md breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });

    const { container } = render(
      createElement(ResponsiveWrapper, {
        responsive: { mobile: { color: 'red' }, desktop: { color: 'blue' } },
        children: createElement('div', { 'data-testid': 'rw', style: { color: 'black' } }, 'x'),
      }),
    );
    const el = container.querySelector('[data-testid="rw"]') as HTMLElement;
    expect(el.style.color).toBe('blue');

    act(() => {
      (window as unknown as { innerWidth: number }).innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
    });
    expect(el.style.color).toBe('red');
  });
});
