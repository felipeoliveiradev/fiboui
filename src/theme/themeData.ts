import type { CSSProperties } from 'react';
import type { FiboTheme, ThemeBorderRadius, ThemeColors, ThemeShadows, ThemeSpacing, ThemeTypography } from './types';
import type { TextStyle } from '../core/types';
import { materialTheme } from './material';
import { cupertinoTheme } from './cupertino';
import { webTheme } from './web';
import { noirTheme } from './noir';

/** Built-in presets. `noir` is the dark editorial theme (site / dense apps). */
export const FIBO_THEMES = {
  material: materialTheme,
  cupertino: cupertinoTheme,
  web: webTheme,
  noir: noirTheme,
} as const;

export type FiboThemePreset = keyof typeof FIBO_THEMES;

export type ThemeInput = FiboTheme | FiboThemePreset;

export function resolveTheme(input: ThemeInput): FiboTheme {
  if (typeof input === 'string') {
    const t = FIBO_THEMES[input];
    if (!t) throw new Error(`Unknown fiboui theme preset: ${input}`);
    return t;
  }
  return input;
}

function mergeTextStyle(base: TextStyle, patch?: Partial<TextStyle>): TextStyle {
  return patch ? { ...base, ...patch } : base;
}

function mergeTypography(
  base: ThemeTypography,
  patch?: Partial<Record<keyof ThemeTypography, Partial<TextStyle>>>,
): ThemeTypography {
  if (!patch) return base;
  return {
    h1: mergeTextStyle(base.h1, patch.h1),
    h2: mergeTextStyle(base.h2, patch.h2),
    h3: mergeTextStyle(base.h3, patch.h3),
    h4: mergeTextStyle(base.h4, patch.h4),
    h5: mergeTextStyle(base.h5, patch.h5),
    h6: mergeTextStyle(base.h6, patch.h6),
    body: mergeTextStyle(base.body, patch.body),
    caption: mergeTextStyle(base.caption, patch.caption),
    label: mergeTextStyle(base.label, patch.label),
  };
}

export type FiboThemePatch = {
  name?: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<Record<keyof ThemeTypography, Partial<TextStyle>>>;
  spacing?: Partial<ThemeSpacing>;
  borderRadius?: Partial<ThemeBorderRadius>;
  shadows?: Partial<ThemeShadows>;
  fontFamily?: string;
};

/** Flutter-style copyWith / SwiftUI environment override. */
export function copyWithTheme(base: FiboTheme, patch: FiboThemePatch): FiboTheme {
  return {
    name: (patch.name as FiboTheme['name']) ?? base.name,
    colors: { ...base.colors, ...patch.colors },
    typography: mergeTypography(base.typography, patch.typography),
    spacing: { ...base.spacing, ...patch.spacing },
    borderRadius: { ...base.borderRadius, ...patch.borderRadius },
    shadows: { ...base.shadows, ...patch.shadows },
    fontFamily: patch.fontFamily ?? base.fontFamily,
  };
}

/** Alias — SwiftUI/Flutter mental model. */
export const extendTheme = copyWithTheme;

function textVarPrefix(key: keyof ThemeTypography): string {
  return `--fibo-text-${key}`;
}

/** Flat CSS custom properties for a theme (inline style or :root block). */
export function themeToCssVars(theme: FiboTheme): Record<string, string> {
  const c = theme.colors;
  const vars: Record<string, string> = {
    '--fibo-primary': c.primary,
    '--fibo-on-primary': c.onPrimary,
    '--fibo-secondary': c.secondary,
    '--fibo-on-secondary': c.onSecondary,
    '--fibo-background': c.background,
    '--fibo-on-background': c.onBackground,
    '--fibo-surface': c.surface,
    '--fibo-on-surface': c.onSurface,
    '--fibo-error': c.error,
    '--fibo-font-family': theme.fontFamily,
    '--fibo-space-xs': theme.spacing.xs,
    '--fibo-space-sm': theme.spacing.sm,
    '--fibo-space-md': theme.spacing.md,
    '--fibo-space-lg': theme.spacing.lg,
    '--fibo-space-xl': theme.spacing.xl,
    '--fibo-radius-sm': theme.borderRadius.sm,
    '--fibo-radius-md': theme.borderRadius.md,
    '--fibo-radius-lg': theme.borderRadius.lg,
    '--fibo-radius-full': theme.borderRadius.full,
    '--fibo-shadow-sm': theme.shadows.sm,
    '--fibo-shadow-md': theme.shadows.md,
    '--fibo-shadow-lg': theme.shadows.lg,
  };

  if (c.primaryVariant) vars['--fibo-primary-variant'] = c.primaryVariant;
  if (c.secondaryVariant) vars['--fibo-secondary-variant'] = c.secondaryVariant;
  if (c.success) vars['--fibo-success'] = c.success;
  if (c.warning) vars['--fibo-warning'] = c.warning;
  if (c.info) vars['--fibo-info'] = c.info;
  if (c.onError) vars['--fibo-on-error'] = c.onError;
  if (c.outline) vars['--fibo-outline'] = c.outline;

  (Object.keys(theme.typography) as (keyof ThemeTypography)[]).forEach((key) => {
    const t = theme.typography[key];
    const p = textVarPrefix(key);
    if (t.fontSize != null) vars[`${p}-size`] = String(t.fontSize);
    if (t.fontWeight != null) vars[`${p}-weight`] = String(t.fontWeight);
    if (t.letterSpacing != null) vars[`${p}-tracking`] = String(t.letterSpacing);
    if (t.lineHeight != null) vars[`${p}-height`] = String(t.lineHeight);
    if (t.color != null) vars[`${p}-color`] = String(t.color);
  });

  return vars;
}

/** Inline style object safe for React (CSSProperties + custom props). */
export function themeToInlineStyle(theme: FiboTheme): CSSProperties {
  return themeToCssVars(theme) as CSSProperties;
}

/** CSS rule body for `.fibo-theme-{name}` — SSR-safe, no useEffect. */
export function themeToCssRule(theme: FiboTheme): string {
  const vars = themeToCssVars(theme);
  const decls = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const name = theme.name || 'custom';
  return `.fibo-theme-${name} {\n${decls}\n}`;
}

export function themeClassName(theme: FiboTheme): string {
  return `fibo-theme-${theme.name || 'custom'}`;
}
