import { ReactNode } from 'react';
import { ResponsiveStyles } from './types';
import { normalizeFiboChildren } from './children';

export function processChildren(children: ReactNode | ReactNode[]): ReactNode[] {
  return normalizeFiboChildren(children);
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
  responsive?: ResponsiveStyles,
  width?: number
): React.CSSProperties {
  if (!responsive) return baseStyle;

  const viewport =
    width ?? (typeof window !== 'undefined' ? window.innerWidth : undefined);

  if (viewport === undefined) {
    return baseStyle;
  }

  let finalStyle = { ...baseStyle };

  if (viewport < 768 && responsive.mobile) {
    finalStyle = { ...finalStyle, ...responsive.mobile };
  } else if (viewport >= 768 && viewport < 1024 && responsive.tablet) {
    finalStyle = { ...finalStyle, ...responsive.tablet };
  } else if (viewport >= 1024 && responsive.desktop) {
    finalStyle = { ...finalStyle, ...responsive.desktop };
  }

  return finalStyle;
}

export function normalizeValue(value: string | number, unit = 'px'): string {
  return typeof value === 'number' ? `${value}${unit}` : value;
}

import React, { memo } from 'react';

export function createFiboComponent<P extends object>(
  component: (props: P) => React.ReactNode,
  propsAreEqual?: (prev: P, next: P) => boolean
) {
  const Memoized = memo(component, propsAreEqual);

  return (props: P) => React.createElement(Memoized, props as any);
}
