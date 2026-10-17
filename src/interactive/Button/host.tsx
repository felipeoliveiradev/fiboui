import React, { ReactElement, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonVariant } from '../../core/types';

export type ExtendedButtonVariant =
  | ButtonVariant
  | 'ghost'
  | 'soft'
  | 'outline'
  | 'text'
  | 'raw'
  | 'solid';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill' | 'square' | 'rect' | 'rounded' | 'sharp';
export type ButtonTone = 'default' | 'inverse';
export type ButtonMotion = 'default' | 'none';
export type HtmlButtonType = 'button' | 'submit' | 'reset';

/** Invalid `<button type>` (e.g. `.type('email')`) is the Submit Button state in HTML. */
export function asHtmlButtonType(value: unknown): HtmlButtonType {
  return value === 'submit' || value === 'reset' || value === 'button' ? value : 'button';
}

function dropEventHandlers<T extends Record<string, unknown>>(rest: T): T {
  const next: Record<string, unknown> = { ...rest };
  for (const key of Object.keys(next)) {
    if (key.startsWith('on') && typeof next[key] === 'function') {
      delete next[key];
    }
  }
  return next as T;
}

/** Hook-free host. Client island attaches click/hover; RSC omits handlers. */
export function renderButtonHost(props: any, interactive: boolean): ReactElement {
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
    children,
    ...rest
  } = props;
  const hostType = asHtmlButtonType(htmlType);

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-[21px] py-[8px] text-[10px] gap-[6px] h-auto tracking-[0.12em] font-normal',
    sm: 'px-[14px] py-[6px] text-[13px] gap-[6px] h-[32px]',
    md: 'px-[22px] py-[10px] text-[15px] gap-[8px] h-[44px]',
    lg: 'px-[32px] py-[16px] text-[17px] gap-[10px] h-[56px]',
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
  } else if (variant === 'text') {
    variantClass = inverse
      ? 'bg-transparent text-white shadow-none border-none px-2'
      : 'bg-transparent text-[var(--fibo-on-surface)] shadow-none border-none px-2 hover:bg-[color-mix(in_srgb,var(--fibo-on-surface)_8%,transparent)]';
  } else if (variant === 'soft') {
    variantClass =
      'bg-[color-mix(in_srgb,var(--fibo-primary)_12%,transparent)] text-[var(--fibo-primary)] shadow-none border-none hover:bg-[color-mix(in_srgb,var(--fibo-primary)_18%,transparent)]';
  } else if (variant === 'outline' || variant === 'outlined') {
    variantClass = inverse
      ? 'bg-black text-white shadow-none border border-[#3b3b3b]'
      : 'bg-transparent border-[1.5px] border-[var(--fibo-outline,rgba(0,0,0,0.12))] text-[var(--fibo-on-surface)] shadow-none hover:bg-[color-mix(in_srgb,var(--fibo-on-surface)_6%,transparent)]';
  } else if (variant === 'solid') {
    variantClass = inverse
      ? 'bg-[#f2f2f2] text-black shadow-none border border-[#f2f2f2]'
      : 'bg-[var(--fibo-primary)] text-[var(--fibo-on-primary)] shadow-none border-none hover:opacity-90';
  } else if (variant === 'filled' || variant === 'primary') {
    variantClass =
      'bg-[var(--fibo-primary)] text-[var(--fibo-on-primary)] shadow-sm border-none hover:opacity-90 active:opacity-100';
  } else if (variant === 'elevated') {
    variantClass =
      'bg-[var(--fibo-surface)] text-[var(--fibo-primary)] shadow-md border-none hover:shadow-lg';
  } else if (variant === 'tonal') {
    variantClass =
      'bg-[var(--fibo-secondary-container)] text-[var(--fibo-on-secondary-container)] shadow-sm border-none';
  } else if (variant === 'raw') {
    variantClass =
      'bg-transparent border-none shadow-none p-0 h-auto gap-0 text-inherit font-inherit hover:bg-transparent';
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
    quiet || disabled
      ? ''
      : 'scale-100 active:scale-[0.96] transform transition-transform duration-200 ease-out',
    disabled ? 'cursor-not-allowed opacity-60 pointer-events-none' : 'cursor-pointer',
    variant === 'raw' || bare || skipSizeClass ? '' : sizeClasses[size as ButtonSize],
    variant === 'raw' || bare || skipShapeClass ? '' : shapeClass,
    expand ? 'flex-1 w-full' : '',
    `fibo-button-${variant}`,
    variantClass,
    className,
  );

  const childrenElements: ReactNode[] = [];

  if (icon) {
    childrenElements.push(icon);
  }
  if (text) {
    childrenElements.push(text);
  }

  if (children) {
    if (Array.isArray(children)) {
      childrenElements.push(...children);
    } else {
      childrenElements.push(children);
    }
  }

  const hostProps: Record<string, unknown> = {
    className: mergedClassName,
    disabled,
    ...(interactive ? rest : dropEventHandlers(rest)),
    type: hostType,
    style: userStyle,
  };

  if (interactive) {
    hostProps.onMouseEnter = onHover
      ? () => {
          if (!disabled) onHover();
        }
      : rest.onMouseEnter;
    hostProps.onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        if (
          !quiet &&
          document.documentElement.classList.contains('fibo-theme-material') &&
          variant !== 'raw'
        ) {
          const target = e.currentTarget;
          void import('../../core/effects').then(({ createRipple }) => {
            createRipple(e, target);
          });
        }
        onPress?.();
        restOnClick?.(e);
      }
    };
  }

  return React.createElement('button', hostProps, ...childrenElements);
}
