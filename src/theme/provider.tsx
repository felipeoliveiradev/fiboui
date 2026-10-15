'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { FiboTheme } from './types';
import type { FiboThemeName } from '../core/types';
import {
  resolveTheme,
  themeClassName,
  themeToInlineStyle,
  type ThemeInput,
} from './themeData';

interface FiboThemeContextValue {
  theme: FiboTheme;
  themeName: string;
  setTheme: (input: ThemeInput) => void;
}

const FiboThemeContext = createContext<FiboThemeContextValue | undefined>(undefined);

function themePropKey(input: ThemeInput): string {
  if (typeof input === 'string') return input;
  return `${input.name}|${input.colors.primary}|${input.colors.background}|${input.fontFamily}`;
}

export interface FiboThemeProviderProps {
  /** Preset name (`"noir"`) or full `FiboTheme` / `extendTheme(...)`. */
  theme?: ThemeInput;
  children: ReactNode;
  /** Extra class on the theme root. */
  className?: string;
  /** Merge into the theme root style (after theme vars). */
  style?: CSSProperties;
}

/**
 * Theme environment (Flutter Theme / SwiftUI Environment).
 * SSR-safe: class + CSS vars on first paint — no documentElement useEffect.
 */
export function FiboThemeProvider({
  theme: themeProp = 'web',
  children,
  className,
  style,
}: FiboThemeProviderProps) {
  const propKey = themePropKey(themeProp);
  const [prevPropKey, setPrevPropKey] = useState(propKey);
  const [local, setLocal] = useState<ThemeInput | null>(null);

  if (propKey !== prevPropKey) {
    setPrevPropKey(propKey);
    setLocal(null);
  }

  const theme = resolveTheme(local ?? themeProp);

  const setTheme = useCallback((input: ThemeInput) => {
    setLocal(input);
  }, []);

  const value = useMemo<FiboThemeContextValue>(
    () => ({
      theme,
      themeName: theme.name,
      setTheme,
    }),
    [theme, setTheme],
  );

  const rootClass = [themeClassName(theme), className].filter(Boolean).join(' ');
  const rootStyle: CSSProperties = {
    ...themeToInlineStyle(theme),
    backgroundColor: theme.colors.background,
    color: theme.colors.onBackground,
    fontFamily: theme.fontFamily,
    ...style,
  };

  return (
    <FiboThemeContext.Provider value={value}>
      <div className={rootClass} data-fibo-theme={theme.name} style={rootStyle}>
        {children}
      </div>
    </FiboThemeContext.Provider>
  );
}

export function useFiboTheme(): FiboThemeContextValue {
  const context = useContext(FiboThemeContext);
  if (!context) {
    throw new Error('useFiboTheme must be used within a FiboThemeProvider');
  }
  return context;
}

/** @deprecated Prefer ThemeInput / FiboThemePreset */
export type { FiboThemeName };
