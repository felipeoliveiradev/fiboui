import { FiboThemeName, TextStyle } from '../core/types';

export interface ThemeColors {
  primary: string;
  primaryVariant?: string;
  secondary: string;
  secondaryVariant?: string;
  background: string;
  surface: string;
  error: string;
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
  sm: string;
  md: string;
  lg: string;
  full: string;
}

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
