import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FiboTheme } from './types';
import { FiboThemeName } from '../core/types';
import { materialTheme } from './material';
import { cupertinoTheme } from './cupertino';
import { webTheme } from './web';

interface FiboThemeContextValue {
  theme: FiboTheme;
  themeName: FiboThemeName;
  setTheme: (name: FiboThemeName) => void;
}

const FiboThemeContext = createContext<FiboThemeContextValue | undefined>(undefined);

const themes: Record<FiboThemeName, FiboTheme> = {
  material: materialTheme,
  cupertino: cupertinoTheme,
  web: webTheme,
};

interface FiboThemeProviderProps {
  theme?: FiboThemeName;
  children: ReactNode;
}

export function FiboThemeProvider({
  theme: initialTheme = 'material',
  children
}: FiboThemeProviderProps) {
  const [themeName, setThemeName] = useState<FiboThemeName>(initialTheme);
  const [theme, setThemeObject] = useState<FiboTheme>(themes[initialTheme]);

  useEffect(() => {
    setThemeName(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    const newTheme = themes[themeName];
    setThemeObject(newTheme);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      root.classList.remove('fibo-theme-material', 'fibo-theme-cupertino', 'fibo-theme-web');

      root.classList.add(`fibo-theme-${themeName}`);

      root.style.setProperty('--fibo-primary', newTheme.colors.primary);
      root.style.setProperty('--fibo-secondary', newTheme.colors.secondary);
      root.style.setProperty('--fibo-background', newTheme.colors.background);
      root.style.setProperty('--fibo-surface', newTheme.colors.surface);
      root.style.setProperty('--fibo-error', newTheme.colors.error);
      root.style.setProperty('--fibo-font-family', newTheme.fontFamily);
    }
  }, [themeName]);

  const value: FiboThemeContextValue = {
    theme,
    themeName,
    setTheme: setThemeName,
  };

  const vars = [
    `--fibo-primary:${theme.colors.primary}`,
    `--fibo-secondary:${theme.colors.secondary}`,
    `--fibo-background:${theme.colors.background}`,
    `--fibo-surface:${theme.colors.surface}`,
    `--fibo-error:${theme.colors.error}`,
    `--fibo-font-family:${theme.fontFamily}`,
  ].join(';');

  return (
    <FiboThemeContext.Provider value={value}>
      <div className={`fibo-theme-${themeName}`} data-fibo-theme={themeName}>
        <style
          data-fibo-theme-vars="1"
          dangerouslySetInnerHTML={{ __html: `:root{${vars}}` }}
        />
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
