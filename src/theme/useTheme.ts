import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeData } from './themeTypes';

const ThemeContext = createContext<ThemeData | null>(null);

export function useTheme(): ThemeData {
  const theme = useContext(ThemeContext);
  if (!theme) {

    return {
      type: 'material' as any,
      colorScheme: {},
      brightness: 'light' as any,
    };
  }
  return theme;
}

export interface ThemeProviderProps {
  theme: ThemeData;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps): JSX.Element {
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}
