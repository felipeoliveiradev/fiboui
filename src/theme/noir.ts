import { FiboTheme } from './types';

/**
 * Obsidian editorial dark — Fibonacci site / dense dashboards.
 * Apply fluently: `Column().theme("noir")` or `FiboThemeProvider({ theme: "noir" })`.
 */
export const noirTheme: FiboTheme = {
  name: 'noir',
  colors: {
    primary: '#F4F4F6',
    onPrimary: '#0A0A0B',
    primaryVariant: '#C8C8D0',
    primaryContainer: '#2A2A32',
    onPrimaryContainer: '#F4F4F6',
    secondary: '#8E8E9A',
    onSecondary: '#F4F4F6',
    secondaryVariant: '#4E4E57',
    secondaryContainer: '#222228',
    onSecondaryContainer: '#E4E4EA',
    tertiary: '#D4A017',
    onTertiary: '#0A0A0B',
    tertiaryContainer: '#3A2E10',
    onTertiaryContainer: '#F5E6B8',
    background: '#0A0A0B',
    onBackground: '#F4F4F6',
    surface: '#141417',
    onSurface: '#F4F4F6',
    surfaceVariant: '#1C1C22',
    onSurfaceVariant: '#C8C8D0',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#94A3B8',
    onError: '#0A0A0B',
    outline: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    h1: {
      fontSize: 'clamp(38px, 4.4vw, 60px)',
      fontWeight: 300,
      letterSpacing: '0.03em',
      lineHeight: 1.12,
      color: 'var(--fibo-on-background)',
    },
    h2: {
      fontSize: 'clamp(28px, 3.2vw, 44px)',
      fontWeight: 300,
      letterSpacing: '0.03em',
      lineHeight: 1.18,
      color: 'var(--fibo-on-background)',
    },
    h3: {
      fontSize: '16px',
      fontWeight: 500,
      letterSpacing: '0.01em',
      color: 'var(--fibo-on-background)',
    },
    h4: {
      fontSize: '15px',
      fontWeight: 500,
      color: 'var(--fibo-on-background)',
    },
    h5: {
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--fibo-on-background)',
    },
    h6: {
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--fibo-on-background)',
    },
    body: {
      fontSize: '13.5px',
      fontWeight: 400,
      lineHeight: 1.7,
      color: 'var(--fibo-secondary)',
    },
    caption: {
      fontSize: '12.5px',
      fontWeight: 400,
      lineHeight: 1.4,
      color: 'var(--fibo-secondary)',
    },
    label: {
      fontSize: '11.5px',
      fontWeight: 500,
      letterSpacing: '0.02em',
      color: 'var(--fibo-secondary)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
  borderRadius: {
    sm: '6px',
    md: '14px',
    lg: '18px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 0 rgba(255, 255, 255, 0.04)',
    md: '0 12px 40px rgba(0, 0, 0, 0.45)',
    lg: '0 30px 80px rgba(0, 0, 0, 0.75)',
  },
  fontFamily:
    'var(--font-sans-loaded, "Plus Jakarta Sans"), system-ui, -apple-system, sans-serif',
};
