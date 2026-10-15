import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Column, Text, FiboThemeProvider, noirTheme, extendTheme, resolveTheme, themeClassName, themeToCssVars } from '../src';

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
});
