import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, ButtonVariant, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { twMerge } from 'tailwind-merge';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function bindInterpTree(host: FiboBuilder, node: unknown): void {
  if (typeof node === 'function') {
    try {
      bindInterpTree(host, (node as () => unknown)());
    } catch {
      /* factory may need mount */
    }
    return;
  }
  if (typeof node === 'string') {
    bindInterp(host, node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) bindInterpTree(host, item);
  }
}

function resolveInterpChild(child: ReactNode): ReactNode {
  return typeof child === 'string' && hasInterpMarks(child)
    ? resolveInterpString(child)
    : child;
}

type ExtendedButtonVariant = ButtonVariant | 'ghost' | 'soft' | 'outline' | 'text' | 'raw' | 'solid';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ButtonShape = 'default' | 'pill' | 'square' | 'rect' | 'rounded' | 'sharp';
type ButtonTone = 'default' | 'inverse';
type ButtonMotion = 'default' | 'none';
type HtmlButtonType = 'button' | 'submit' | 'reset';

/** Invalid `<button type>` (e.g. `.type('email')`) is the Submit Button state in HTML. */
function asHtmlButtonType(value: unknown): HtmlButtonType {
  return value === 'submit' || value === 'reset' || value === 'button' ? value : 'button';
}

const ButtonInner = React.memo((props: any) => {
  const {
    text,
    variant,
    size,
    onPress,
    onHover,
    disabled,
    icon,
    shape,
    shadow,
    tone,
    motion,
    expand,
    className,
    style,
    type: htmlType = 'button',
    bare,
    onClick: restOnClick,
    ...rest
  } = props;
  const hostType = asHtmlButtonType(htmlType);

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-[21px] py-[8px] text-[10px] gap-[6px] h-auto tracking-[0.12em] font-normal',
    sm: 'px-[14px] py-[6px] text-[13px] gap-[6px] h-[32px]',
    md: 'px-[22px] py-[10px] text-[15px] gap-[8px] h-[44px]',
    lg: 'px-[32px] py-[16px] text-[17px] gap-[10px] h-[56px]'
  };

  let shapeClass = 'rounded-[14px]';
  if (shape === 'pill') shapeClass = 'rounded-full';
  else if (shape === 'square') shapeClass = 'rounded-[12px]';
  else if (shape === 'rect') shapeClass = 'rounded-[2px]';
  else if (shape === 'rounded') shapeClass = 'rounded-[8px]';
  else if (shape === 'sharp') shapeClass = 'rounded-none';

  const inverse = tone === 'inverse';

  let variantClass = '';
  if (variant === 'ghost') {
    variantClass = inverse
      ? 'bg-transparent text-white shadow-none border border-transparent'
      : 'bg-transparent text-[var(--fibo-on-surface)] shadow-none border border-transparent hover:bg-[color-mix(in_srgb,var(--fibo-on-surface)_8%,transparent)]';
  }
  else if (variant === 'text') {
    variantClass = inverse
      ? 'bg-transparent text-white shadow-none border-none px-2'
      : 'bg-transparent text-[var(--fibo-on-surface)] shadow-none border-none px-2 hover:bg-[color-mix(in_srgb,var(--fibo-on-surface)_8%,transparent)]';
  }
  else if (variant === 'soft') {
    variantClass =
      'bg-[color-mix(in_srgb,var(--fibo-primary)_12%,transparent)] text-[var(--fibo-primary)] shadow-none border-none hover:bg-[color-mix(in_srgb,var(--fibo-primary)_18%,transparent)]';
  }
  else if (variant === 'outline' || variant === 'outlined') {
    variantClass = inverse
      ? 'bg-black text-white shadow-none border border-[#3b3b3b]'
      : 'bg-transparent border-[1.5px] border-[var(--fibo-outline,rgba(0,0,0,0.12))] text-[var(--fibo-on-surface)] shadow-none hover:bg-[color-mix(in_srgb,var(--fibo-on-surface)_6%,transparent)]';
  }
  else if (variant === 'solid') {
    variantClass = inverse
      ? 'bg-[#f2f2f2] text-black shadow-none border border-[#f2f2f2]'
      : 'bg-[var(--fibo-primary)] text-[var(--fibo-on-primary)] shadow-none border-none hover:opacity-90';
  }
  else if (variant === 'filled' || variant === 'primary') {
    variantClass = 'bg-[var(--fibo-primary)] text-[var(--fibo-on-primary)] shadow-sm border-none hover:opacity-90 active:opacity-100';
  }
  else if (variant === 'elevated') {
    variantClass = 'bg-[var(--fibo-surface)] text-[var(--fibo-primary)] shadow-md border-none hover:shadow-lg';
  }
  else if (variant === 'tonal') {
    variantClass = 'bg-[var(--fibo-secondary-container)] text-[var(--fibo-on-secondary-container)] shadow-sm border-none';
  }
  else if (variant === 'raw') {
    variantClass = 'bg-transparent border-none shadow-none p-0 h-auto gap-0 text-inherit font-inherit hover:bg-transparent';
    shapeClass = '';
  }

  if (shadow === 'soft' && variant !== 'raw') {
    variantClass += ' shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)]';
  }

  const userStyle: React.CSSProperties = style || {};
  const skipSizeClass =
    userStyle.padding !== undefined ||
    userStyle.paddingTop !== undefined ||
    userStyle.paddingBottom !== undefined ||
    userStyle.paddingLeft !== undefined ||
    userStyle.paddingRight !== undefined ||
    userStyle.fontSize !== undefined ||
    userStyle.height !== undefined;
  const skipShapeClass = userStyle.borderRadius !== undefined;
  const skipWeightClass = userStyle.fontWeight !== undefined || size === 'xs' || inverse;

  const quiet = variant === 'raw' || motion === 'none' || inverse || size === 'xs' || bare;
  if (bare) {
    variantClass = '';
    shapeClass = '';
  } else if (disabled) {
    variantClass = variantClass.replace(/\s*(hover|active):\S+/g, '').trim();
  }

  const mergedClassName = twMerge(
    'fibo-button',
    bare ? '' : 'relative overflow-hidden',
    `inline-flex items-center justify-center whitespace-nowrap`,
    skipWeightClass || bare ? '' : 'font-semibold',
    // Resting scale(1) so active:scale eases instead of snapping from none.
    quiet || disabled ? '' : 'scale-100 active:scale-[0.96] transform transition-transform duration-200 ease-out',
    disabled ? 'cursor-not-allowed opacity-60 pointer-events-none' : 'cursor-pointer',
    variant === 'raw' || bare || skipSizeClass ? '' : sizeClasses[size as ButtonSize],
    variant === 'raw' || bare || skipShapeClass ? '' : shapeClass,
    expand ? 'flex-1 w-full' : '',
    `fibo-button-${variant}`,
    variantClass,
    className
  );

  const childrenElements = [];

  if (icon) {
    childrenElements.push(icon);
  }
  if (text) {
    childrenElements.push(text);
  }

  if (props.children) {
    if (Array.isArray(props.children)) {
      childrenElements.push(...props.children);
    } else {
      childrenElements.push(props.children);
    }
  }

  return React.createElement(
    'button',
    {
      className: mergedClassName,
      onMouseEnter: onHover
        ? () => {
            if (!disabled) onHover();
          }
        : rest.onMouseEnter,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
          if (
            !quiet &&
            document.documentElement.classList.contains('fibo-theme-material') &&
            variant !== 'raw'
          ) {
            const target = e.currentTarget;
            import('../../core/effects').then(({ createRipple }) => {
              createRipple(e, target);
            });
          }
          onPress?.();
          restOnClick?.(e);
        }
      },
      disabled: disabled,
      ...rest,
      type: hostType,
      style: userStyle,
    },
    ...childrenElements
  );
});

class ButtonBuilder extends FiboBuilder {
  private _text: string | (() => string) = '';
  private _variant: ExtendedButtonVariant = 'elevated';
  private _size: ButtonSize = 'md';
  private _onPress?: () => void;
  private _onHover?: () => void;
  private _disabled: boolean = false;
  private _icon?: ReactNode;
  private _shape: ButtonShape = 'default';
  private _shadow: 'none' | 'soft' = 'none';
  private _tone: ButtonTone = 'default';
  private _motion: ButtonMotion = 'default';
  private _expand = false;
  private _htmlType: HtmlButtonType = 'button';
  private _htmlTypeExplicit = false;

  constructor(text: string | (() => string) = '') {
    super();
    this.text(text);
  }

  text(value: string | (() => string)): this {
    this._text = value;
    if (typeof value === 'function') {
      this.observer();
    } else {
      bindInterp(this, value);
    }
    return this;
  }

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  variant(variant: ExtendedButtonVariant): this {
    this._variant = variant;
    return this;
  }

  clean(): this {
    this._variant = 'raw';
    return this;
  }

  size(size: ButtonSize): this {
    this._size = size;
    return this;
  }

  onPress(handler: () => void): this {
    this._onPress = handler;
    return this;
  }

  onHover(handler: () => void): this {
    this._onHover = handler;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
    return this;
  }

  icon(icon: ReactNode): this {
    this._icon = icon;
    return this;
  }

  shape(value: ButtonShape): this {
    this._shape = value;
    return this;
  }

  shadow(value: 'none' | 'soft'): this {
    this._shadow = value;
    return this;
  }

  tone(value: ButtonTone): this {
    this._tone = value;
    return this;
  }

  motion(value: ButtonMotion): this {
    this._motion = value;
    return this;
  }

  expand(value: boolean = true): this {
    this._expand = value;
    return this;
  }

  /**
   * HTML button type. `.type('submit')` is what people write inside a Form.
   * React still reads `element.type` as the component: a string sets this,
   * a props object renders the button.
   */
  type(value: 'button' | 'submit' | 'reset'): this {
    this._htmlType = asHtmlButtonType(value);
    this._htmlTypeExplicit = true;
    return this;
  }

  htmlType(value: 'button' | 'submit' | 'reset'): this {
    this._htmlType = asHtmlButtonType(value);
    this._htmlTypeExplicit = true;
    return this;
  }

  /** Shortcut for `.htmlType('submit')` inside a `Form`. */
  submit(): this {
    this._htmlType = 'submit';
    this._htmlTypeExplicit = true;
    return this;
  }

  /** Shortcut for `.htmlType('reset')`. */
  reset(): this {
    this._htmlType = 'reset';
    this._htmlTypeExplicit = true;
    return this;
  }

  private resolvedHtmlType(): HtmlButtonType {
    if (this._htmlTypeExplicit) return asHtmlButtonType(this._htmlType);
    return asHtmlButtonType(this._props?.type ?? this._htmlType);
  }

  build(): ReactElement {
    const builderClasses = this.getClassName();
    const rawText = typeof this._text === 'function' ? this._text() : this._text;
    const finalText =
      typeof rawText === 'string' && hasInterpMarks(rawText)
        ? resolveInterpString(rawText)
        : rawText;

    const props = {
      text: finalText,
      variant: this._variant,
      size: this._size,
      onPress: this._onPress,
      onHover: this._onHover,
      disabled: this._disabled,
      icon: this._icon,
      shape: this._shape,
      shadow: this._shadow,
      tone: this._tone,
      motion: this._motion,
      expand: this._expand,
      className: builderClasses,
      style: this.getStyle(),
      children: this.processChildren().map(resolveInterpChild),
      ...this._props,
      type: this.resolvedHtmlType(),
      bare: this.isReset(),
    };

    return React.createElement(ButtonInner, props);
  }
}

export const Button = createBuilder(ButtonBuilder);

export interface ButtonProps extends BaseProps {
  text: string;
  variant?: ExtendedButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  shape?: ButtonShape;
  shadow?: 'none' | 'soft';
  tone?: ButtonTone;
  motion?: ButtonMotion;
  expand?: boolean;
}
