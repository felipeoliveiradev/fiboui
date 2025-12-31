import { FiboTheme } from './types';

export const cupertinoTheme: FiboTheme = {
  name: 'cupertino',
  colors: {
    primary: '#007AFF',
    secondary: '#AF52DE',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5AC8FA',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
  },
  typography: {
    h1: {
      fontSize: '34px',
      fontWeight: 700,
      letterSpacing: '0.37px',
    },
    h2: {
      fontSize: '28px',
      fontWeight: 700,
      letterSpacing: '0.36px',
    },
    h3: {
      fontSize: '22px',
      fontWeight: 600,
      letterSpacing: '0.35px',
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
    },
    h5: {
      fontSize: '17px',
      fontWeight: 600,
      letterSpacing: '-0.41px',
    },
    h6: {
      fontSize: '15px',
      fontWeight: 600,
      letterSpacing: '-0.24px',
    },
    body: {
      fontSize: '17px',
      fontWeight: 400,
      letterSpacing: '-0.41px',
    },
    caption: {
      fontSize: '13px',
      fontWeight: 400,
      letterSpacing: '-0.08px',
    },
    label: {
      fontSize: '15px',
      fontWeight: 500,
      letterSpacing: '-0.24px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '32px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 2px 8px rgba(0,0,0,0.1)',
    lg: '0 4px 16px rgba(0,0,0,0.12)',
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
};
