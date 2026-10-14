import { CSSProperties, ReactNode, ReactElement } from 'react';

/** Any fluent builder that can produce a React element. */
export type Buildable = {
  /** @deprecated Builders are React elements; `.build()` is optional. */
  build(): ReactElement;
};

/**
 * A single child accepted by `.children()` / layout slots / JSX / component returns.
 * Builders are React elements — they do not need `.build()`.
 */
export type FiboChild = ReactNode | Buildable;

/** Value accepted by `.children()`: one child, a list, or a lazy factory. */
export type FiboChildren = FiboChild | FiboChild[] | (() => FiboChild | FiboChild[]);

export type FiboThemeName = 'material' | 'cupertino' | 'web';

export interface ResponsiveStyles {
  mobile?: CSSProperties;
  tablet?: CSSProperties;
  desktop?: CSSProperties;
}

export interface BaseProps {
  key?: string | number;
  className?: string;
  style?: CSSProperties;
  responsive?: ResponsiveStyles;
}

export interface ChildrenProps extends BaseProps {
  children?: ReactNode | ReactNode[];
  child?: ReactNode;
}

export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type MainAxisAlignment = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
export type CrossAxisAlignment = Alignment;

export interface LayoutProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  margin?: string | number;
  backgroundColor?: string;
}

export interface EdgeInsets {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  all?: string | number;
  horizontal?: string | number;
  vertical?: string | number;
}

export interface TextStyle {
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
}

export type TextType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label';

export type ButtonVariant = 'elevated' | 'filled' | 'outlined' | 'text';

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export interface FiboComponent<T = any> {
  (props?: T): ReactElement;
}
