import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { themeClassName } from '../src/theme/themeData';
import { cupertinoTheme, materialTheme, noirTheme, webTheme } from '../src';

const ROOT = resolve(__dirname, '..');

function readCss(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
}

const THEME_SHEETS = {
  material: { theme: materialTheme, file: 'src/styles/themes/material.css' },
  cupertino: { theme: cupertinoTheme, file: 'src/styles/themes/cupertino.css' },
  web: { theme: webTheme, file: 'src/styles/themes/web.css' },
  noir: { theme: noirTheme, file: 'src/styles/themes/noir.css' },
} as const;

describe('W23-05 styles / .fibo-theme-* cascade', () => {
  it('noir sheet is unlayered like the other presets (layer would lose to Tailwind utilities)', () => {
    // base.css @import's theme sheets BEFORE `@tailwind utilities`.
    // An `@layer fibo.theme` declared there is an *earlier* layer than
    // utilities, so later-layer `bg-[var(--fibo-primary)]` beats
    // `.fibo-theme-noir .fibo-button-filled:hover { background-color }`.
    // Material/cupertino/web stay unlayered and win. Noir must too.
    const noir = readCss('src/styles/themes/noir.css');
    expect(noir).toContain('.fibo-theme-noir .fibo-button-filled:hover');
    expect(noir).not.toMatch(/@layer\s+[\w.-]+\s*\{/);
    for (const { file } of Object.values(THEME_SHEETS)) {
      expect(readCss(file), file).not.toMatch(/@layer\s+[\w.-]+\s*\{/);
    }
  });

  it('each preset CSS root selector matches themeClassName() / .fibo-theme-*', () => {
    for (const [name, { theme, file }] of Object.entries(THEME_SHEETS)) {
      const css = readCss(file);
      const cls = themeClassName(theme);
      expect(cls, name).toBe(`fibo-theme-${name}`);
      expect(css, file).toContain(`.${cls}`);
      expect(css, file).toMatch(
        new RegExp(`:root:has\\(\\.${cls}\\)\\s*,\\s*\\.${cls}\\s*\\{`),
      );
    }
  });

  it('style-entry still side-effects base.css (themes + reset + motion)', () => {
    const entry = readFileSync(resolve(ROOT, 'src/style-entry.ts'), 'utf8');
    expect(entry).toMatch(/import\s+['"]\.\/styles\/base\.css['"]/);
    const base = readCss('src/styles/base.css');
    expect(base).toMatch(/@import\s+['"]\.\/themes\/noir\.css['"]/);
    expect(base).toMatch(/\.fibo-reset[\s\S]*all:\s*unset/);
  });
});
