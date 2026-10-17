'use client';

import React, { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { Brightness, ThemeType } from './colorEnums';
import { materialTheme } from './material';
import { useFiboTheme } from './provider';
import type { ColorScheme, ThemeData } from './themeTypes';
import type { FiboTheme } from './types';

function typeFromName(name: string): ThemeType {
  if (name === 'cupertino') return ThemeType.Cupertino;
  if (name === 'web') return ThemeType.Web;
  if (name === 'noir') return ThemeType.Noir;
  return ThemeType.Material;
}

function fiboToThemeData(theme: FiboTheme): ThemeData {
  const c = theme.colors;
  return {
    type: typeFromName(theme.name),
    brightness: theme.name === 'noir' ? Brightness.Dark : Brightness.Light,
    colorScheme: {
      primary: c.primary,
      onPrimary: c.onPrimary,
      primaryContainer: c.primaryContainer,
      onPrimaryContainer: c.onPrimaryContainer,
      secondary: c.secondary,
      onSecondary: c.onSecondary,
      secondaryContainer: c.secondaryContainer,
      onSecondaryContainer: c.onSecondaryContainer,
      tertiary: c.tertiary,
      onTertiary: c.onTertiary,
      tertiaryContainer: c.tertiaryContainer,
      onTertiaryContainer: c.onTertiaryContainer,
      error: c.error,
      onError: c.onError,
      errorContainer: c.errorContainer ?? c.error,
      onErrorContainer: c.onErrorContainer ?? c.onError,
      success: c.success,
      warning: c.warning,
      info: c.info,
      background: c.background,
      onBackground: c.onBackground,
      surface: c.surface,
      onSurface: c.onSurface,
      surfaceVariant: c.surfaceVariant,
      onSurfaceVariant: c.onSurfaceVariant,
      surfaceContainerLow: c.surfaceContainerLow ?? c.surface,
      outline: c.outline,
      outlineVariant: c.outlineVariant,
    },
    typography: { fontFamily: theme.fontFamily },
  };
}

const defaultTheme: ThemeData = fiboToThemeData(materialTheme);

const ThemeContext = createContext<ThemeData | null>(null);

export function useTheme(): ThemeData {
  const local = useContext(ThemeContext);
  const fibo = useFiboTheme();
  if (local) return local;
  return fiboToThemeData(fibo.theme);
}

function colorSchemeToVars(scheme: ColorScheme | undefined): Record<string, string> {
  if (!scheme) return {};
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(scheme)) {
    if (value == null || value === '') continue;
    const kebab = key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
    vars[`--fibo-${kebab}`] = value;
  }
  return vars;
}

export interface ThemeProviderProps {
  theme: ThemeData;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps): JSX.Element {
  const scheme = theme.colorScheme ?? {};
  const dark = theme.brightness === Brightness.Dark;
  const name = typeof theme.type === 'string' ? theme.type : ThemeType.Material;
  const fontFamily = theme.typography?.fontFamily;
  const style: CSSProperties = {
    ...colorSchemeToVars(scheme),
    colorScheme: dark ? 'dark' : 'light',
    backgroundColor: scheme.background,
    color: scheme.onBackground,
    ...(fontFamily
      ? ({ fontFamily, ['--fibo-font-family']: fontFamily } as CSSProperties)
      : {}),
    ...({ ['--fibo-theme']: name } as CSSProperties),
  };
  return React.createElement(
    ThemeContext.Provider,
    { value: theme ?? defaultTheme },
    React.createElement(
      'div',
      {
        className: `fibo-theme-${name}`,
        'data-fibo-theme': name,
        style,
      },
      children,
    ),
  );
}
