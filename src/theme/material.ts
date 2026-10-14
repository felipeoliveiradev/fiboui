import { FiboTheme } from './types';

export const materialTheme: FiboTheme = {
  name: 'material',
  colors: {
    primary: '#6750A4',
    primaryVariant: '#4F378B',
    secondary: '#625B71',
    secondaryVariant: '#4A4458',
    background: '#FFFBFE',
    surface: '#FFFBFE',
    error: '#B3261E',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
  },
  typography: {
    h1: {
      fontSize: '96px',
      fontWeight: 300,
      letterSpacing: '-1.5px',
    },
    h2: {
      fontSize: '60px',
      fontWeight: 300,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontSize: '48px',
      fontWeight: 400,
    },
    h4: {
      fontSize: '34px',
      fontWeight: 400,
      letterSpacing: '0.25px',
    },
    h5: {
      fontSize: '24px',
      fontWeight: 400,
    },
    h6: {
      fontSize: '20px',
      fontWeight: 500,
      letterSpacing: '0.15px',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '0.4px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '1.25px',
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
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 8px rgba(0,0,0,0.12)',
    lg: '0 8px 16px rgba(0,0,0,0.14)',
  },
  fontFamily: 'Roboto, sans-serif',
};
