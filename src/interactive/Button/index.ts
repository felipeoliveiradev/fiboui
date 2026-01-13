import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, ButtonVariant } from '../../core/types';
import { twMerge } from 'tailwind-merge';

type ExtendedButtonVariant = ButtonVariant | 'ghost' | 'soft' | 'outline' | 'text' | 'raw';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'default' | 'pill' | 'square';

const ButtonInner = React.memo((props: any) => {
  const {
    text,
    variant,
    size,
    onPress,
    disabled,
    icon,
    shape,
    shadow,
    className,
    style,
    ...rest
  } = props;

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-[14px] py-[6px] text-[13px] gap-[6px] h-[32px]',
    md: 'px-[22px] py-[10px] text-[15px] gap-[8px] h-[44px]',
    lg: 'px-[32px] py-[16px] text-[17px] gap-[10px] h-[56px]'
  };

  let shapeClass = 'rounded-[14px]';
  if (shape === 'pill') shapeClass = 'rounded-full';
  else if (shape === 'square') shapeClass = 'rounded-[12px]';

  let variantClass = '';
  if (variant === 'ghost') {
    variantClass = 'bg-transparent text-gray-600 shadow-none border border-transparent hover:bg-gray-100';
  }
  else if (variant === 'text') {
    variantClass = 'bg-transparent text-gray-600 shadow-none border-none px-2 hover:bg-gray-100';
  }
  else if (variant === 'soft') {
    variantClass = 'bg-indigo-50 text-indigo-600 shadow-none border-none hover:bg-indigo-100';
  }
  else if (variant === 'outline') {
    variantClass = 'bg-transparent border-[1.5px] border-gray-200 text-gray-700 shadow-none hover:bg-gray-50';
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

  const mergedClassName = twMerge(
    'fibo-button',
    variant === 'raw' ? 'inline-flex cursor-pointer' : 'inline-flex items-center justify-center font-semibold whitespace-nowrap active:scale-[0.96] transform transition-all duration-200 ease-out',
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    variant === 'raw' ? '' : sizeClasses[size as ButtonSize],
    variant === 'raw' ? '' : shapeClass,
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
      style: style,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
          if (document.documentElement.classList.contains('fibo-theme-material') && variant !== 'raw') {
            import('../../core/effects').then(({ createRipple }) => {
              createRipple(e, e.currentTarget);
            });
          }
          onPress?.();
        }
      },
      disabled: disabled,
      ...rest,
    },
    ...childrenElements
  );
});

class ButtonBuilder extends FiboBuilder {
  private _text: string | (() => string) = '';
  private _variant: ExtendedButtonVariant = 'elevated';
  private _size: ButtonSize = 'md';
  private _onPress?: () => void;
  private _disabled: boolean = false;
  private _icon?: ReactNode;
  private _shape: ButtonShape = 'default';
  private _shadow: 'none' | 'soft' = 'none';

  constructor(text: string | (() => string) = '') {
    super();
    this.text(text);
  }

  text(value: string | (() => string)): this {
    this._text = value;
    if (typeof value === 'function') {
      this.observer();
    }
    return this;
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

  build(): ReactElement {
    const builderClasses = this.getClassName();
    const finalText = typeof this._text === 'function' ? this._text() : this._text;

    const props = {
      text: finalText,
      variant: this._variant,
      size: this._size,
      onPress: this._onPress,
      disabled: this._disabled,
      icon: this._icon,
      shape: this._shape,
      shadow: this._shadow,
      className: builderClasses,
      style: this.getStyle(),
      children: this.processChildren(),
      ...this._props
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
  disabled?: boolean;
  icon?: ReactNode;
  shape?: ButtonShape;
  shadow?: 'none' | 'soft';
}
