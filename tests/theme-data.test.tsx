import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import {
  Column,
  Text,
  FiboThemeProvider,
  cupertinoTheme,
  materialTheme,
  noirTheme,
  webTheme,
  extendTheme,
  resolveTheme,
  themeClassName,
  themeToCssVars,
} from '../src';

function firstCssVars(source: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const re = /--fibo-([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const key = match[1];
    if (vars[key] == null) vars[key] = match[2].trim();
  }
  return vars;
}

function hexNorm(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return trimmed.toUpperCase();
  return trimmed;
}

const THEME_SHEETS = {
  material: { theme: materialTheme, file: 'src/styles/themes/material.css' },
  cupertino: { theme: cupertinoTheme, file: 'src/styles/themes/cupertino.css' },
  web: { theme: webTheme, file: 'src/styles/themes/web.css' },
  noir: { theme: noirTheme, file: 'src/styles/themes/noir.css' },
} as const;

const TOKEN_PAIRS = [
  ['primary', 'primary'],
  ['secondary', 'secondary'],
  ['background', 'background'],
  ['surface', 'surface'],
  ['on-primary', 'onPrimary'],
  ['on-secondary', 'onSecondary'],
  ['on-background', 'onBackground'],
  ['on-surface', 'onSurface'],
] as const;

describe('themeData / fluent .theme()', () => {
  it('resolves presets including noir', () => {
    expect(resolveTheme('noir').name).toBe('noir');
    expect(resolveTheme('noir').colors.background).toBe('#0A0A0B');
    expect(resolveTheme(noirTheme).name).toBe('noir');
  });

  it('extendTheme / copyWith merges colors and typography', () => {
    const t = extendTheme(noirTheme, {
      colors: { primary: '#FF00AA' },
      typography: { body: { fontSize: '18px' } },
    });
    expect(t.colors.primary).toBe('#FF00AA');
    expect(t.colors.background).toBe(noirTheme.colors.background);
    expect(t.typography.body.fontSize).toBe('18px');
    expect(t.typography.h1.fontSize).toBe(noirTheme.typography.h1.fontSize);
  });

  it('themeToCssVars emits fibo tokens + text variant vars', () => {
    const vars = themeToCssVars(noirTheme);
    expect(vars['--fibo-primary']).toBe('#F4F4F6');
    expect(vars['--fibo-text-h1-size']).toContain('clamp');
    expect(vars['--fibo-text-body-color']).toBe('var(--fibo-secondary)');
  });

  it('.theme("noir") paints class + CSS vars on SSR (no useEffect)', () => {
    const html = renderToString(
      Column()
        .theme('noir')
        .children([Text('Hello').type('h1')])
        .build(),
    );
    expect(html).toContain(themeClassName(noirTheme));
    expect(html).toContain('--fibo-primary');
    expect(html).toContain('--fibo-background');
    expect(html).toContain('fibo-text-h1');
  });

  it('FiboThemeProvider is SSR-safe with theme="noir"', () => {
    const html = renderToString(
      <FiboThemeProvider theme="noir">{Text('Body').type('body')}</FiboThemeProvider>,
    );
    expect(html).toContain('fibo-theme-noir');
    expect(html).toContain('data-fibo-theme="noir"');
    expect(html).toContain('--fibo-on-background');
  });

  it('FiboThemeProvider default matches base.css --fibo-theme material', () => {
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');
    expect(base).toMatch(/--fibo-theme:\s*'material'/);
    const html = renderToString(<FiboThemeProvider>{Text('Body').type('body')}</FiboThemeProvider>);
    expect(html).toContain('fibo-theme-material');
    expect(html).toContain('data-fibo-theme="material"');
    expect(html).toContain('#6750A4');
  });

  it('JS theme objects agree with CSS sheets on primary/secondary/background/surface/on-*', () => {
    for (const [name, { theme, file }] of Object.entries(THEME_SHEETS)) {
      const css = firstCssVars(readFileSync(resolve(__dirname, '..', file), 'utf8'));
      for (const [cssKey, jsKey] of TOKEN_PAIRS) {
        expect(css[cssKey], `${name} CSS --fibo-${cssKey}`).toBeTruthy();
        expect(hexNorm(theme.colors[jsKey]), `${name} JS ${jsKey}`).toBe(hexNorm(css[cssKey]));
      }
      expect(css.error, `${name} CSS --fibo-error`).toBeTruthy();
      expect(hexNorm(theme.colors.error), `${name} JS error`).toBe(hexNorm(css.error));
      expect(css['on-error'], `${name} CSS --fibo-on-error`).toBeTruthy();
      expect(hexNorm(theme.colors.onError), `${name} JS onError`).toBe(hexNorm(css['on-error']));
    }
  });

  it('themeToCssVars container tokens match CSS sheets, not primaryVariant/surface', () => {
    for (const [name, { theme, file }] of Object.entries(THEME_SHEETS)) {
      const css = firstCssVars(readFileSync(resolve(__dirname, '..', file), 'utf8'));
      const vars = themeToCssVars(theme);
      if (css['primary-container']) {
        expect(hexNorm(vars['--fibo-primary-container']), `${name} primary-container`).toBe(
          hexNorm(css['primary-container']),
        );
      }
      if (css['on-primary-container']) {
        expect(hexNorm(vars['--fibo-on-primary-container']), `${name} on-primary-container`).toBe(
          hexNorm(css['on-primary-container']),
        );
      }
      if (css['surface-variant']) {
        expect(hexNorm(vars['--fibo-surface-variant']), `${name} surface-variant`).toBe(
          hexNorm(css['surface-variant']),
        );
      }
      if (css['on-surface-variant']) {
        expect(hexNorm(vars['--fibo-on-surface-variant']), `${name} on-surface-variant`).toBe(
          hexNorm(css['on-surface-variant']),
        );
      }
      if (css.outline) {
        expect(hexNorm(vars['--fibo-outline']), `${name} outline`).toBe(hexNorm(css.outline));
      }
      if (css['radius-sm']) {
        expect(vars['--fibo-radius-sm'], `${name} radius-sm`).toBe(css['radius-sm']);
      }
      if (css['radius-md']) {
        expect(vars['--fibo-radius-md'], `${name} radius-md`).toBe(css['radius-md']);
      }
      if (css['radius-lg']) {
        expect(vars['--fibo-radius-lg'], `${name} radius-lg`).toBe(css['radius-lg']);
      }
    }
    const materialVars = themeToCssVars(materialTheme);
    expect(materialVars['--fibo-primary-container']).not.toBe(materialTheme.colors.primaryVariant);
    expect(materialVars['--fibo-surface-variant']).not.toBe(materialTheme.colors.surface);
  });

  it('base.css does not redeclare theme tokens after importing sheets', () => {
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');
    const withoutComments = base.replace(/\/\*[\s\S]*?\*\//g, '');
    const afterImports = withoutComments.replace(/@import[^;]+;/g, '');
    expect(afterImports).toMatch(/--fibo-theme:\s*'material'/);
    expect(afterImports).not.toMatch(/\.fibo-theme-material\s*\{[^}]*--fibo-primary\s*:/);
    expect(afterImports).not.toMatch(/\.fibo-theme-web\s*\{[^}]*--fibo-primary\s*:/);
    expect(afterImports).not.toMatch(/\.fibo-theme-cupertino\s*\{[^}]*--fibo-primary\s*:/);
  });

  it('themeToCssVars emits CSS elevation tokens, with shadow aliases', () => {
    for (const [name, { theme, file }] of Object.entries(THEME_SHEETS)) {
      const css = firstCssVars(readFileSync(resolve(__dirname, '..', file), 'utf8'));
      const vars = themeToCssVars(theme);
      expect(css['elevation-1'], `${name} CSS --fibo-elevation-1`).toBeTruthy();
      expect(css['elevation-2'], `${name} CSS --fibo-elevation-2`).toBeTruthy();
      expect(css['elevation-3'], `${name} CSS --fibo-elevation-3`).toBeTruthy();
      expect(vars['--fibo-elevation-1'], `${name} JS elevation-1`).toBe(css['elevation-1']);
      expect(vars['--fibo-elevation-2'], `${name} JS elevation-2`).toBe(css['elevation-2']);
      expect(vars['--fibo-elevation-3'], `${name} JS elevation-3`).toBe(css['elevation-3']);
      expect(theme.shadows.sm, `${name} JS shadows.sm`).toBe(css['elevation-1']);
      expect(theme.shadows.md, `${name} JS shadows.md`).toBe(css['elevation-2']);
      expect(theme.shadows.lg, `${name} JS shadows.lg`).toBe(css['elevation-3']);
      expect(vars['--fibo-shadow-sm'], `${name} shadow-sm alias`).toBe(vars['--fibo-elevation-1']);
      expect(vars['--fibo-shadow-md'], `${name} shadow-md alias`).toBe(vars['--fibo-elevation-2']);
      expect(vars['--fibo-shadow-lg'], `${name} shadow-lg alias`).toBe(vars['--fibo-elevation-3']);
    }
  });
});
