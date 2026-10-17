import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  Column,
  copyWithTheme,
  extendTheme,
  materialTheme,
  noirTheme,
  themeClassName,
  themeToCssRule,
  themeToCssVars,
  themeToInlineStyle,
} from '../src';
import type { ColorScheme } from '../src/theme/themeTypes';
import type { ThemeBorderRadius } from '../src/theme/types';

describe('W23-02 themeData / types', () => {
  it('themeToInlineStyle stamps --fibo-theme; themeToCssVars stays sheet-lockstep without it', () => {
    const vars = themeToCssVars(noirTheme);
    const style = themeToInlineStyle(noirTheme) as Record<string, string>;
    expect(vars['--fibo-theme']).toBeUndefined();
    expect(style['--fibo-theme']).toBe('noir');
    expect(style['--fibo-primary']).toBe(vars['--fibo-primary']);
    expect(style['--fibo-elevation-1']).toBe(vars['--fibo-elevation-1']);
  });

  it('.theme("noir") paints --fibo-theme on the host (fluent path, no provider)', () => {
    const html = renderToString(
      Column().theme('noir').children(['x']).build(),
    );
    expect(html).toMatch(/--fibo-theme:\s*noir/);
    expect(html).toContain(themeClassName(noirTheme));
  });

  it('themeClassName / themeToCssRule slug custom names into one CSS ident', () => {
    const t = extendTheme(materialTheme, { name: 'My Brand!' });
    expect(themeClassName(t)).toBe('fibo-theme-my-brand');
    expect(themeClassName(t)).not.toMatch(/\s/);
    expect(themeClassName(materialTheme)).toBe('fibo-theme-material');
    const rule = themeToCssRule(t);
    expect(rule.startsWith('.fibo-theme-my-brand {')).toBe(true);
    expect(rule).not.toMatch(/My Brand/);
  });

  it('copyWithTheme does not let undefined patch keys wipe base tokens', () => {
    const t = copyWithTheme(materialTheme, {
      colors: { primary: undefined, secondary: '#00FF00' },
      fontFamily: undefined,
      typography: { body: { fontSize: undefined, fontWeight: 600 } },
    });
    expect(t.colors.primary).toBe(materialTheme.colors.primary);
    expect(t.colors.secondary).toBe('#00FF00');
    expect(t.fontFamily).toBe(materialTheme.fontFamily);
    expect(t.typography.body.fontSize).toBe(materialTheme.typography.body.fontSize);
    expect(t.typography.body.fontWeight).toBe(600);
  });

  it('themeToCssVars unit-suffixes numeric typography sizes', () => {
    const t = extendTheme(materialTheme, {
      typography: { body: { fontSize: 18, letterSpacing: 0.5 } },
    });
    const vars = themeToCssVars(t);
    expect(vars['--fibo-text-body-size']).toBe('18px');
    expect(vars['--fibo-text-body-tracking']).toBe('0.5px');
    expect(vars['--fibo-text-body-weight']).toBe('400');
  });

  it('themeToCssVars emits radius-xs/xl when the theme defines them', () => {
    const t = extendTheme(materialTheme, {
      borderRadius: { xs: '2px', xl: '24px' } as Partial<ThemeBorderRadius>,
    });
    const vars = themeToCssVars(t);
    expect(vars['--fibo-radius-xs']).toBe('2px');
    expect(vars['--fibo-radius-xl']).toBe('24px');
    expect(vars['--fibo-radius-sm']).toBe(materialTheme.borderRadius.sm);
  });

  it('ColorScheme carries primaryVariant / secondaryVariant like ThemeColors', () => {
    const scheme: ColorScheme = {
      primary: '#6750A4',
      primaryVariant: '#4F378B',
      secondaryVariant: '#4A4458',
    };
    expect(scheme.primaryVariant).toBe('#4F378B');
    expect(scheme.secondaryVariant).toBe('#4A4458');
  });
});
