import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render as viteRender } from '../examples/ssr-fixtures/vite/entry-server';
import { injectSsrMarkup } from '../examples/ssr-fixtures/vite/inject.js';

const ROOT = resolve(__dirname, '..');

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

describe('W25-08 SSR fixtures leftover', () => {
  it('injectSsrMarkup keeps $& $$ $` $\' in HTML and style tags', () => {
    const template = '<head><!--app-styles--></head><div id="root"><!--app-html--></div>';
    const html = 'Price $10 — keep $& and $$ and $` and $\' end';
    const styles = '<style id="fibo-dynamic-styles">.x{content:"$&"}</style>';
    const out = injectSsrMarkup(template, html, styles);
    expect(out).toContain(html);
    expect(out).toContain(styles);
    expect(out).not.toContain('<!--app-html-->');
    expect(out).not.toContain('<!--app-styles-->');
  });

  it('Vite entry-server HTML survives template inject (no $ specials eaten)', () => {
    const { html, styles } = viteRender();
    const template = read('examples/ssr-fixtures/vite/index.html');
    const out = injectSsrMarkup(template, html, styles);
    expect(out).toContain(html);
    expect(out).toContain(styles);
    expect(out).toContain('id="ssr-root"');
    expect(out).toContain('Hydration audit');
  });

  it('Vite server.js uses injectSsrMarkup, not String.replace $ patterns', () => {
    const server = read('examples/ssr-fixtures/vite/server.js');
    expect(server).toMatch(/injectSsrMarkup\s*\(/);
    expect(server).not.toMatch(/\.replace\(\s*['"]<!--app-html-->['"]\s*,\s*html\s*\)/);
    expect(server).not.toMatch(/\.replace\(\s*['"]<!--app-styles-->['"]\s*,\s*styles\s*\)/);
  });

  it('Vite SSR 500 responses are text/plain (no HTML sniff / stack XSS)', () => {
    const server = read('examples/ssr-fixtures/vite/server.js');
    expect(server).toMatch(/text\/plain;\s*charset=utf-8/);
  });

  it('Vite config dedupes react so file: linked fiboui does not pull a second copy', () => {
    const vite = read('examples/ssr-fixtures/vite/vite.config.ts');
    expect(vite).toMatch(/dedupe\s*:/);
    expect(vite).toMatch(/['"]react['"]/);
    expect(vite).toMatch(/['"]react-dom['"]/);
  });

  it('inject helper is SSR-safe (no window/document)', () => {
    const src = read('examples/ssr-fixtures/vite/inject.js');
    expect(src).not.toMatch(/\bwindow\./);
    expect(src).not.toMatch(/\bdocument\./);
  });

  it('Next tsconfig does not alias fiboui to a .d.ts (keeps react-server export)', () => {
    const ts = JSON.parse(read('examples/ssr-fixtures/next/tsconfig.json')) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const fibo = ts.compilerOptions?.paths?.fiboui;
    expect(fibo, 'paths.fiboui overrides package exports').toBeUndefined();
  });
});
