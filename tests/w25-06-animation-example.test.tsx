import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../examples/animation/src/App';
import { mount } from '../src';

const ROOT = resolve(__dirname, '..');

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function injectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => {
      const el = node as HTMLStyleElement;
      const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
      return `${el.textContent ?? ''}\n${rules}`;
    })
    .join('\n');
}

function stubIntersectionObserver() {
  if (typeof IntersectionObserver !== 'undefined') return;
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  } as unknown as typeof IntersectionObserver;
}

describe('W25-06 animation example leftovers', () => {
  beforeEach(() => {
    stubIntersectionObserver();
  });

  afterEach(() => {
    cleanup();
    document.getElementById('root')?.remove();
  });

  function mountApp() {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount('#root', App);
    });
    return { host, unmount: () => act(() => root.unmount()) };
  }

  it('page scroll-progress fill sits in .demo-track so the bar is visible at rest', () => {
    const { host, unmount } = mountApp();
    const progress = host.querySelector('#progress') as HTMLElement | null;
    expect(progress, '#progress').toBeTruthy();
    expect(progress!.className).toMatch(/fibo-scroll-progress/);
    expect(progress!.className).toMatch(/demo-bar/);
    expect(
      progress!.closest('.demo-track'),
      'progress fill must sit in .demo-track (unused CSS otherwise leaves scaleX(0) invisible)',
    ).toBeTruthy();
    unmount();
  });

  it('demo-track CSS pins the page bar while scrolling', () => {
    const css = read('examples/animation/src/demo.css');
    expect(css).toMatch(/\.demo-track\s*\{[^}]*position:\s*sticky/s);
  });

  it('hover compose CSS is scale + translate3d (library no longer emits translateY)', () => {
    const { unmount } = mountApp();
    const css = injectedCss();
    expect(css).toMatch(/scale\(1\.05\)\s+translate3d\(0,\s*-4px,\s*0\)/);
    expect(css).not.toMatch(/scale\(1\.05\)\s+translateY\(-4px\)/);
    unmount();
  });

  it('e2e hover compose assertion matches translate3d, not stale translateY', () => {
    const spec = read('examples/animation/e2e/animation.spec.ts');
    expect(spec).toContain('translate3d');
    expect(spec).not.toContain('translateY');
  });

  it('hover-btn live-updates the bound hover count', () => {
    const { host, unmount } = mountApp();
    const btn = host.querySelector('#hover-btn') as HTMLButtonElement | null;
    expect(btn, '#hover-btn').toBeTruthy();
    const before = btn!.textContent ?? '';
    expect(before).toMatch(/Hover me \(\d+\)/);
    const n = Number(before.match(/\((\d+)\)/)?.[1]);
    act(() => {
      fireEvent.mouseEnter(btn!);
    });
    expect(btn!.textContent).toBe(`Hover me (${n + 1})`);
    unmount();
  });

  it('hover-btn press toggles the presence panel', () => {
    const { host, unmount } = mountApp();
    const btn = host.querySelector('#hover-btn') as HTMLButtonElement;
    const shown = () => host.querySelector('#panel');
    expect(shown(), 'panel starts open').toBeTruthy();
    act(() => {
      fireEvent.click(btn);
    });
    const exiting = host.querySelector('[data-fibo-presence="exit"]');
    expect(exiting, 'exit phase').toBeTruthy();
    act(() => {
      fireEvent.animationEnd(exiting as HTMLElement);
    });
    expect(shown(), 'panel unmounted after exit').toBeNull();
    unmount();
  });
});
