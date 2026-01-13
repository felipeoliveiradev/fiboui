export enum ShadowSize {
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
  Xl = 'xl',
  Xl2 = '2xl',
}

export enum ShadowPreset {
  Card = 'card',
  Button = 'button',
  Modal = 'modal',
  Float = 'float',
  Inner = 'inner',
}

export enum ShadowDirection {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  TopBottom = 'top-bottom',
  LeftRight = 'left-right',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  All = 'all',
}

export type ShadowConfig =
  | ShadowSize
  | ShadowPreset
  | string
  | null
  | [string, number?]
  | [ShadowDirection | string, ShadowSize | string]
  | [ShadowDirection | string, string]
  | [ShadowDirection | string, string, number?]
  | [ShadowDirection | string, ShadowSize | string, string, number?];
