import { FiboThemeName, TextStyle } from '../core/types';

export interface ThemeColors {
  primary: string;
  primaryVariant?: string;
  primaryContainer?: string;
  onPrimaryContainer?: string;
  secondary: string;
  secondaryVariant?: string;
  secondaryContainer?: string;
  onSecondaryContainer?: string;
  tertiary?: string;
  onTertiary?: string;
  tertiaryContainer?: string;
  onTertiaryContainer?: string;
  background: string;
  surface: string;
  surfaceVariant?: string;
  onSurfaceVariant?: string;
  error: string;
  errorContainer?: string;
  onErrorContainer?: string;
  success?: string;
  warning?: string;
  info?: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  /** Borders / hairlines — maps to `--fibo-outline`. */
  outline?: string;
  outlineVariant?: string;
  /** Maps to `--fibo-surface-container-low` (M3 card surfaces). */
  surfaceContainerLow?: string;
}

export interface ThemeTypography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  label: TextStyle;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBorderRadius {
  /** Maps to `--fibo-radius-xs` when set (CSS sheets already define it). */
  xs?: string;
  sm: string;
  md: string;
  lg: string;
  /** Maps to `--fibo-radius-xl` when set (CSS sheets already define it). */
  xl?: string;
  full: string;
}

/** Maps to `--fibo-elevation-1/2/3` (CSS). `--fibo-shadow-*` is an alias. */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface FiboTheme {
  name: FiboThemeName;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  fontFamily: string;
}
