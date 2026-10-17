import React, { memo, ReactNode, CSSProperties } from 'react';
import { ResponsiveStyles } from './types';
import type { FiboChildren } from './types';
import { normalizeFiboChildren } from './children';
import { FIBO_BREAKPOINTS } from './breakpoints';

export function processChildren(children: FiboChildren | undefined | null): ReactNode[] {
  return normalizeFiboChildren(children);
}

export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties {
  return styles.reduce<CSSProperties>((acc, style) => {
    if (style) {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
}

export function applyResponsiveStyles(
  baseStyle: CSSProperties,
  responsive?: ResponsiveStyles,
  width?: number
): CSSProperties {
  if (!responsive) return baseStyle;

  if (width === undefined) {
    return baseStyle;
  }
  const viewport = width;
  const md = FIBO_BREAKPOINTS.md;
  const lg = FIBO_BREAKPOINTS.lg;

  let finalStyle = { ...baseStyle };

  if (viewport < md && responsive.mobile) {
    finalStyle = { ...finalStyle, ...responsive.mobile };
  } else if (viewport >= md && viewport < lg && responsive.tablet) {
    finalStyle = { ...finalStyle, ...responsive.tablet };
  } else if (viewport >= lg && responsive.desktop) {
    finalStyle = { ...finalStyle, ...responsive.desktop };
  }

  return finalStyle;
}

export function normalizeValue(value: string | number, unit = 'px'): string {
  return typeof value === 'number' ? `${value}${unit}` : value;
}

export function createFiboComponent<P extends object>(
  component: (props: P) => React.ReactNode,
  propsAreEqual?: ((prev: P, next: P) => boolean) | false
) {
  if (propsAreEqual === false) {
    const Open = component as React.FC<P>;
    return (props: P) => React.createElement(Open, props as any);
  }

  const Memoized = memo(component, propsAreEqual);

  return (props: P) => React.createElement(Memoized, props as any);
}
