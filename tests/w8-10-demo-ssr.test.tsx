import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render as viteRender } from '../examples/ssr-fixtures/vite/entry-server';
import { App as SsrFixtureApp } from '../examples/ssr-fixtures/shared/App';
import { getStyleTag } from '../src';

const ROOT = resolve(__dirname, '..');

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function hydrationWarnings(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls
    .map((args) => args.map(String).join(' '))
    .filter((msg) =>
      /hydrat|did not match|Minified React error #418|#419|#423|unique key|each child/i.test(msg)
    );
}

describe('W8-10 demo.tsx', () => {
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
    const hosted = (window as Window & { _reactRoot?: Root })._reactRoot;
    hosted?.unmount();
    delete (window as Window & { _reactRoot?: Root })._reactRoot;
    document.getElementById('root')?.remove();
    cleanup();
  });

  it('mounts Gallery into #root without throwing', async () => {
    const el = document.createElement('div');
    el.id = 'root';
    document.body.appendChild(el);

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await act(async () => {
      await import('../src/demo');
    });
    spy.mockRestore();

    expect(el.textContent).toContain('Latest Drops');
    expect(el.textContent).toContain('Form Elements');
    expect(el.querySelectorAll('button').length).toBeGreaterThan(3);
  });
});

describe('W8-10 SSR fixtures', () => {
  it('Vite entry-server render() paints the shared tree and style tag', () => {
    const { html, styles } = viteRender();
    expect(html).toContain('Hydration audit');
    expect(html).toContain('id="ssr-root"');
    expect(html).toContain('id="go"');
    expect(styles).toContain('id="fibo-dynamic-styles"');
    expect(styles).toMatch(/scale\(1\.0[24]\)/);
  });

  it('Vite client hydrate tree matches entry-server HTML', async () => {
    const { html } = viteRender();
    function Root() {
      useEffect(() => {
        (window as Window & { __FIBO_HYDRATED__?: boolean }).__FIBO_HYDRATED__ = true;
      }, []);
      return createElement(SsrFixtureApp);
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    let root: Root | undefined;
    await act(async () => {
      root = hydrateRoot(container, createElement(Root));
    });
    const warnings = hydrationWarnings(spy);
    await act(async () => {
      root?.unmount();
    });
    container.remove();
    spy.mockRestore();
    expect(warnings).toEqual([]);
  });

  it('server-side fixture modules never touch window or document', () => {
    const serverFiles = [
      'examples/ssr-fixtures/shared/App.tsx',
      'examples/ssr-fixtures/vite/entry-server.tsx',
      'examples/ssr-fixtures/vite/server.js',
      'examples/ssr-fixtures/next/app/page.tsx',
      'examples/ssr-fixtures/next/app/layout.tsx',
    ];
    for (const file of serverFiles) {
      const src = read(file);
      expect(src, file).not.toMatch(/\bwindow\./);
      expect(src, file).not.toMatch(/\bdocument\./);
    }
  });

  it('demo module load does not throw when document is undefined', async () => {
    vi.resetModules();
    const docDesc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const winDesc = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined });
    try {
      await expect(import('../src/demo')).resolves.toBeTruthy();
    } finally {
      if (docDesc) Object.defineProperty(globalThis, 'document', docDesc);
      if (winDesc) Object.defineProperty(globalThis, 'window', winDesc);
    }
  });

  it('Vite entry-client does not read document at module scope', () => {
    const client = read('examples/ssr-fixtures/vite/entry-client.tsx');
    expect(client).toMatch(/typeof document === ['"]undefined['"]/);
    expect(client).not.toMatch(/^(const|let|var) root = document\.getElementById/m);
  });

  it('playwright config waits on 127.0.0.1 and pins Next hostname', () => {
    const cfg = read('examples/ssr-fixtures/playwright.config.ts');
    const pkg = read('examples/ssr-fixtures/package.json');
    expect(cfg).toContain("testDir: './tests'");
    expect(cfg).toMatch(/baseURL:\s*'http:\/\/127\.0\.0\.1:4173'/);
    expect(cfg).toContain("url: 'http://127.0.0.1:4173'");
    expect(cfg).toContain("url: 'http://127.0.0.1:3015'");
    expect(cfg).toMatch(/reuseExistingServer:\s*false/);
    expect(pkg).toMatch(/next start \.\/next .*127\.0\.0\.1/);
  });
});

describe('W8-10 shared App SSR without document', () => {
  it('renderToString(App) does not throw when document is undefined', () => {
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
    try {
      const html = renderToString(createElement(SsrFixtureApp));
      expect(html).toContain('Hydration audit');
      const tag = getStyleTag();
      expect(tag).toContain('fibo-dynamic-styles');
    } finally {
      if (desc) Object.defineProperty(globalThis, 'document', desc);
    }
  });
});
