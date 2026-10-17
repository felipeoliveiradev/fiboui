import type { CSSProperties } from 'react';
import type { FiboTheme, ThemeBorderRadius, ThemeColors, ThemeShadows, ThemeSpacing, ThemeTypography } from './types';
import type { TextStyle } from '../core/types';
import { normalizeCssValue } from '../core/cssFluent';
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

function definedOnly<T extends object>(patch?: T): Partial<T> {
  if (!patch) return {};
  const out: Partial<T> = {};
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function mergeTextStyle(base: TextStyle, patch?: Partial<TextStyle>): TextStyle {
  return patch ? { ...base, ...definedOnly(patch) } : base;
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
    colors: { ...base.colors, ...definedOnly(patch.colors) },
    typography: mergeTypography(base.typography, patch.typography),
    spacing: { ...base.spacing, ...definedOnly(patch.spacing) },
    borderRadius: { ...base.borderRadius, ...definedOnly(patch.borderRadius) },
    shadows: { ...base.shadows, ...definedOnly(patch.shadows) },
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
    // CSS sheets consume --fibo-elevation-*; keep --fibo-shadow-* as aliases.
    '--fibo-elevation-1': theme.shadows.sm,
    '--fibo-elevation-2': theme.shadows.md,
    '--fibo-elevation-3': theme.shadows.lg,
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

  // M3 container aliases so `.bg('primary-container')` / Button `tonal` resolve
  // under runtime themes (noir / extendTheme) that only define core palette.
  // Named presets set container/variant tokens to the CSS sheets — do not
  // alias primaryVariant onto primary-container (those are different M3 roles).
  vars['--fibo-primary-container'] = c.primaryContainer ?? c.primaryVariant ?? c.primary;
  vars['--fibo-on-primary-container'] = c.onPrimaryContainer ?? c.onPrimary;
  vars['--fibo-secondary-container'] = c.secondaryContainer ?? c.secondaryVariant ?? c.secondary;
  vars['--fibo-on-secondary-container'] = c.onSecondaryContainer ?? c.onSecondary;
  vars['--fibo-tertiary'] = c.tertiary ?? c.secondary;
  vars['--fibo-on-tertiary'] = c.onTertiary ?? c.onSecondary;
  vars['--fibo-tertiary-container'] = c.tertiaryContainer ?? c.secondaryVariant ?? c.secondary;
  vars['--fibo-on-tertiary-container'] = c.onTertiaryContainer ?? c.onSecondary;
  vars['--fibo-surface-variant'] = c.surfaceVariant ?? c.surface;
  vars['--fibo-on-surface-variant'] = c.onSurfaceVariant ?? c.onSurface;
  vars['--fibo-surface-container-low'] = c.surfaceContainerLow ?? c.surface;
  vars['--fibo-error-container'] = c.errorContainer ?? c.error;
  vars['--fibo-on-error-container'] = c.onErrorContainer ?? c.onError;
  if (c.outlineVariant) vars['--fibo-outline-variant'] = c.outlineVariant;
  if (theme.borderRadius?.xs) vars['--fibo-radius-xs'] = theme.borderRadius.xs;
  if (theme.borderRadius?.xl) vars['--fibo-radius-xl'] = theme.borderRadius.xl;

  const typography = theme.typography;
  if (typography) {
    (Object.keys(typography) as (keyof ThemeTypography)[]).forEach((key) => {
      const t = typography[key];
      if (!t) return;
      const p = textVarPrefix(key);
      if (t.fontSize != null) vars[`${p}-size`] = normalizeCssValue('fontSize', t.fontSize);
      if (t.fontWeight != null) vars[`${p}-weight`] = normalizeCssValue('fontWeight', t.fontWeight);
      if (t.letterSpacing != null) vars[`${p}-tracking`] = normalizeCssValue('letterSpacing', t.letterSpacing);
      if (t.lineHeight != null) vars[`${p}-height`] = normalizeCssValue('lineHeight', t.lineHeight);
      if (t.color != null) vars[`${p}-color`] = String(t.color);
    });
  }

  return vars;
}

/** Inline style object safe for React (CSSProperties + custom props). */
export function themeToInlineStyle(theme: FiboTheme): CSSProperties {
  return {
    ...themeToCssVars(theme),
    ['--fibo-theme']: theme.name || 'custom',
  } as CSSProperties;
}

/** CSS class ident for `.fibo-theme-{name}` — lowercase [a-z0-9_-] only. */
function themeNameToken(name: string | undefined | null): string {
  const slug = String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'custom';
}

/** CSS rule body for `.fibo-theme-{name}` — SSR-safe, no useEffect. */
export function themeToCssRule(theme: FiboTheme): string {
  const vars = themeToCssVars(theme);
  const decls = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const name = themeNameToken(theme.name);
  return `.fibo-theme-${name} {\n${decls}\n}`;
}

export function themeClassName(theme: FiboTheme): string {
  return `fibo-theme-${themeNameToken(theme.name)}`;
}
