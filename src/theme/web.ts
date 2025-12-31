import { FiboTheme } from './types';

export const webTheme: FiboTheme = {
  name: 'web',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#06B6D4',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#111827',
    onSurface: '#374151',
    onError: '#FFFFFF',
  },
  typography: {
    h1: {
      fontSize: '60px',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '36px',
      fontWeight: 700,
    },
    h4: {
      fontSize: '30px',
      fontWeight: 600,
    },
    h5: {
      fontSize: '24px',
      fontWeight: 600,
    },
    h6: {
      fontSize: '20px',
      fontWeight: 600,
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    caption: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.4',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  fontFamily: 'Inter, system-ui, sans-serif',
};
