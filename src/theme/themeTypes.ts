import { ThemeType, ThemeMode, Brightness } from './colorEnums';


export interface ColorScheme {
  
  primary?: string;
  onPrimary?: string;
  primaryContainer?: string;
  onPrimaryContainer?: string;

  
  secondary?: string;
  onSecondary?: string;
  secondaryContainer?: string;
  onSecondaryContainer?: string;

  
  tertiary?: string;
  onTertiary?: string;
  tertiaryContainer?: string;
  onTertiaryContainer?: string;

  
  error?: string;
  onError?: string;

  
  background?: string;
  onBackground?: string;
  surface?: string;
  onSurface?: string;
  surfaceVariant?: string;
  onSurfaceVariant?: string;

  
  outline?: string;
}


export interface Typography {
  fontFamily?: string;
}


export interface Spacing {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}


export interface BorderRadius {
  none?: string;
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  full?: string;
}


export interface ThemeData {
  
  type?: ThemeType;

  
  colorScheme?: ColorScheme;

  
  brightness?: Brightness;

  
  typography?: Typography;

  
  spacing?: Spacing;

  
  borderRadius?: BorderRadius;

  
  extensions?: Record<string, any>;
}


export interface ThemeConfig {
  
  theme?: ThemeData;

  
  darkTheme?: ThemeData;

  
  themeMode?: ThemeMode;
}
