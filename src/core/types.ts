import { CSSProperties, ReactNode } from 'react';

/** Any fluent builder that can produce a React element. */
export type Buildable = {
  /** @deprecated Builders are React elements; `.build()` is optional. */
  build(): ReactNode;
};

/**
 * A single child accepted by `.children()` / layout slots / JSX / component returns.
 * Builders are React elements — they do not need `.build()`.
 */
export type FiboChild = ReactNode | Buildable;

/** Value accepted by `.children()`: one child, a list, or a lazy factory. */
export type FiboChildren = FiboChild | readonly FiboChild[] | (() => FiboChild | readonly FiboChild[]);

export type FiboThemeName = 'material' | 'cupertino' | 'web' | 'noir';

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
  children?: FiboChildren;
  child?: FiboChild;
}

export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type MainAxisAlignment = 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
export type CrossAxisAlignment = Alignment;

/**
 * Screen-axis alignment for `.alignX()` / `.alignY()`.
 * Always means left–right (X) or top–bottom (Y), not main/cross flex axis.
 * Space values (`between`, …) pack along that screen axis when it is the flex
 * main axis; on the cross axis they fall back to `start`.
 */
export type AlignAxis =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline'
  | 'between'
  | 'around'
  | 'evenly'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'spaceBetween'
  | 'spaceAround'
  | 'spaceEvenly';

/** Map screen-axis values onto Flutter main-axis packing. */
export function toMainAxis(alignment: AlignAxis): MainAxisAlignment {
  if (alignment === 'start' || alignment === 'center' || alignment === 'end') return alignment;
  if (alignment === 'between' || alignment === 'space-between' || alignment === 'spaceBetween') {
    return 'spaceBetween';
  }
  if (alignment === 'around' || alignment === 'space-around' || alignment === 'spaceAround') {
    return 'spaceAround';
  }
  if (alignment === 'evenly' || alignment === 'space-evenly' || alignment === 'spaceEvenly') {
    return 'spaceEvenly';
  }
  return 'start';
}

/** Map screen-axis values onto Flutter cross-axis alignment. */
export function toCrossAxis(alignment: AlignAxis): CrossAxisAlignment {
  if (
    alignment === 'start' ||
    alignment === 'center' ||
    alignment === 'end' ||
    alignment === 'stretch'
  ) {
    return alignment;
  }
  return 'start';
}

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

export interface FiboComponent<T = Record<string, never>> {
  (props?: T): ReactNode;
  displayName?: string;
}
