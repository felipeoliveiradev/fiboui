import { ReactNode } from 'react';
import { ResponsiveStyles } from './types';

export function processChildren(children: ReactNode | ReactNode[]): ReactNode[] {
  const childArray = Array.isArray(children) ? children : [children];
  
  return childArray.map((child) => {
    if (child && typeof child === 'object' && 'build' in child) {
      return (child as any).build();
    }
    return child;
  });
}

export function mergeStyles(...styles: (React.CSSProperties | undefined)[]): React.CSSProperties {
  return styles.reduce<React.CSSProperties>((acc, style) => {
    if (style) {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
}

export function applyResponsiveStyles(
  baseStyle: React.CSSProperties,
  responsive?: ResponsiveStyles
): React.CSSProperties {
  if (!responsive) return baseStyle;

  let finalStyle = { ...baseStyle };

  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    
    if (width < 768 && responsive.mobile) {
      finalStyle = { ...finalStyle, ...responsive.mobile };
    } else if (width >= 768 && width < 1024 && responsive.tablet) {
      finalStyle = { ...finalStyle, ...responsive.tablet };
    } else if (width >= 1024 && responsive.desktop) {
      finalStyle = { ...finalStyle, ...responsive.desktop };
    }
  }

  return finalStyle;
}

export function normalizeValue(value: string | number, unit = 'px'): string {
  return typeof value === 'number' ? `${value}${unit}` : value;
}
