import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../examples/animation/src/App';
import { mount } from '../src';

const ROOT = resolve(__dirname, '..');

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

describe('W15-03 animation example entry', () => {
  beforeEach(() => {
    if (typeof IntersectionObserver === 'undefined') {
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
  });

  afterEach(() => {
    cleanup();
    document.getElementById('root')?.remove();
  });

  it('main.tsx does not call mount when document is undefined', () => {
    const src = read('examples/animation/src/main.tsx');
    expect(src).toMatch(/typeof document === ['"]undefined['"]/);
    expect(src).toMatch(/\bmount\s*\(/);
    expect(src).not.toMatch(/^mount\s*\(/m);
  });

  it('App.tsx does not read document or window at module scope', () => {
    const src = read('examples/animation/src/App.tsx');
    expect(src).not.toMatch(/\bdocument\./);
    expect(src).not.toMatch(/\bwindow\./);
  });

  it('App mounts into #root without throwing', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);

    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount('#root', App);
    });

    expect(host.textContent).toContain('FiboUI motion');
    expect(host.querySelector('#fade-in')).toBeTruthy();
    expect(host.querySelector('#hover-btn')).toBeTruthy();
    expect(host.querySelector('#footer')).toBeTruthy();
    act(() => {
      root.unmount();
    });
  });
});
