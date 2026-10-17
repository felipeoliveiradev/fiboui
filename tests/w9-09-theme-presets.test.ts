import { describe, expect, it } from 'vitest';
import { cupertinoTheme } from '../src/theme/cupertino';
import { materialTheme } from '../src/theme/material';
import { noirTheme } from '../src/theme/noir';
import { webTheme } from '../src/theme/web';
import { themeToCssVars } from '../src/theme/themeData';
import type { FiboTheme, ThemeColors } from '../src/theme/types';

const PRESETS: Record<string, FiboTheme> = {
  material: materialTheme,
  cupertino: cupertinoTheme,
  web: webTheme,
  noir: noirTheme,
};

/** M3 roles Button tonal / Combobox / `.bg('tertiary')` / material consumers read. */
const REQUIRED_COLOR_KEYS = [
  'primary',
  'onPrimary',
  'primaryVariant',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryVariant',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'background',
  'onBackground',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'error',
  'onError',
  'success',
  'warning',
  'info',
  'outline',
] as const satisfies readonly (keyof ThemeColors)[];

const REQUIRED_TYPE_KEYS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'caption', 'label'] as const;
const REQUIRED_SPACE = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const REQUIRED_RADIUS = ['sm', 'md', 'lg', 'full'] as const;
const REQUIRED_SHADOW = ['sm', 'md', 'lg'] as const;

/** Role pairs whose JS values are not locked to CSS sheets that fail AA. */
const AA_PAIRS = [
  ['onSecondaryContainer', 'secondaryContainer'],
  ['onTertiary', 'tertiary'],
  ['onTertiaryContainer', 'tertiaryContainer'],
  ['onPrimary', 'primaryVariant'],
  ['onSecondary', 'secondaryVariant'],
] as const satisfies readonly [keyof ThemeColors, keyof ThemeColors][];

function parseColor(raw: string): [number, number, number, number] | null {
  const s = raw.trim();
  const rgba = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgba) return [+rgba[1], +rgba[2], +rgba[3], rgba[4] == null ? 1 : +rgba[4]];
  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (!hex) return null;
  let h = hex[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb: [number, number, number, number]): number {
  return 0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
}

function blend(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number, number] {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}

function contrastRatio(fg: string, bg: string): number {
  const parsedFg = parseColor(fg);
  const parsedBg = parseColor(bg);
  if (!parsedFg || !parsedBg) {
    throw new Error(`unparsed color ${fg} / ${bg}`);
  }
  const F = parsedFg[3] < 1 ? blend(parsedFg, parsedBg) : parsedFg;
  const B = parsedBg[3] < 1 ? blend(parsedBg, [255, 255, 255, 1]) : parsedBg;
  const L1 = luminance(F);
  const L2 = luminance(B);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

describe('W9-09 theme presets', () => {
  it('every preset exposes the same M3 color keys (no cupertino/material drift)', () => {
    for (const [name, theme] of Object.entries(PRESETS)) {
      for (const key of REQUIRED_COLOR_KEYS) {
        const value = theme.colors[key];
        expect(typeof value, `${name}.colors.${key}`).toBe('string');
        expect(String(value).length, `${name}.colors.${key} empty`).toBeGreaterThan(0);
        // Material-shaped consumers call string methods on every role.
        expect(() => value!.slice(0, 1).toLowerCase(), `${name}.colors.${key} crash`).not.toThrow();
      }
    }
  });

  it('required typography / spacing / radius / shadow keys are present', () => {
    for (const [name, theme] of Object.entries(PRESETS)) {
      for (const key of REQUIRED_TYPE_KEYS) {
        expect(theme.typography[key], `${name}.typography.${key}`).toBeTruthy();
        expect(theme.typography[key].fontSize, `${name}.typography.${key}.fontSize`).toBeTruthy();
      }
      for (const key of REQUIRED_SPACE) {
        expect(theme.spacing[key], `${name}.spacing.${key}`).toBeTruthy();
      }
      for (const key of REQUIRED_RADIUS) {
        expect(theme.borderRadius[key], `${name}.borderRadius.${key}`).toBeTruthy();
      }
      for (const key of REQUIRED_SHADOW) {
        expect(theme.shadows[key], `${name}.shadows.${key}`).toBeTruthy();
      }
      expect(theme.fontFamily.length).toBeGreaterThan(0);
    }
  });

  it('container / variant / tertiary roles meet WCAG AA (4.5:1)', () => {
    for (const [name, theme] of Object.entries(PRESETS)) {
      for (const [fgKey, bgKey] of AA_PAIRS) {
        const fg = theme.colors[fgKey];
        const bg = theme.colors[bgKey];
        expect(fg, `${name}.${fgKey}`).toBeTruthy();
        expect(bg, `${name}.${bgKey}`).toBeTruthy();
        const ratio = contrastRatio(fg!, bg!);
        expect(ratio, `${name} ${fgKey} on ${bgKey} (${ratio.toFixed(2)})`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('themeToCssVars uses preset container tokens, not secondary/primary fallbacks', () => {
    for (const [name, theme] of Object.entries(PRESETS)) {
      const vars = themeToCssVars(theme);
      expect(vars['--fibo-secondary-container'], name).toBe(theme.colors.secondaryContainer);
      expect(vars['--fibo-on-secondary-container'], name).toBe(theme.colors.onSecondaryContainer);
      expect(vars['--fibo-tertiary'], name).toBe(theme.colors.tertiary);
      expect(vars['--fibo-on-tertiary'], name).toBe(theme.colors.onTertiary);
      expect(vars['--fibo-tertiary-container'], name).toBe(theme.colors.tertiaryContainer);
      expect(vars['--fibo-on-tertiary-container'], name).toBe(theme.colors.onTertiaryContainer);
      expect(vars['--fibo-primary-container'], name).toBe(theme.colors.primaryContainer);
      expect(vars['--fibo-on-primary-container'], name).toBe(theme.colors.onPrimaryContainer);
      expect(vars['--fibo-surface-variant'], name).toBe(theme.colors.surfaceVariant);
      expect(vars['--fibo-on-surface-variant'], name).toBe(theme.colors.onSurfaceVariant);
      expect(theme.colors.secondaryContainer, `${name} tonal ≠ filled secondary`).not.toBe(
        theme.colors.secondary,
      );
    }
  });
});
