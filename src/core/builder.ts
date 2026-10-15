import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboChild, FiboChildren, ResponsiveStyles } from './types';
import { BreakpointKey, toMediaQuery } from './breakpoints';
import { BindableSignal, Observable, Signal } from './state';
import { Observer, SignalWrapper, ObserverWrapper, StateWrapper, ProviderWrapper } from './StateWrapper';
import { isUsableReactKey, normalizeFiboChildren } from './children';
import clsx from 'clsx';
import { _styleManager, MotionStyles, ensureMotionCss } from './styleManager';
import { cssToTailwind } from '@metagptx/css-to-tailwind';
import { GestureBuilder } from './gestures/GestureBuilders';
import { AnimationOptions } from './animations';
import { AnimatedWrapper } from './AnimatedWrapper';
import { PseudoStateBuilder } from './PseudoStateBuilder';
import { resolveCssEase, springEase, type SpringOptions } from './easing';
import {
  CustomMotion,
  MotionPreset,
  cssDecls,
  hashDecls,
  isCustomMotion,
  normalizePreset,
} from './motionCss';
import { Reveal } from './Reveal';
import { ScrollProgress } from './ScrollProgress';

interface ThemeColors {
  primary?: string;
  onPrimary?: string;
  secondary?: string;
  onSecondary?: string;
  background?: string;
  onBackground?: string;
  surface?: string;
  onSurface?: string;
  error?: string;
  [key: string]: string | undefined;
}

interface ThemeConfig {
  colors?: ThemeColors;
  colorScheme?: ThemeColors;
  [key: string]: unknown;
}

/** Typical sticky header height used when `.sticky(0)` / `.sticky(true)` has no size. */
const DEFAULT_STICKY_OFFSET_PX = 64;
const DEFAULT_STICKY_OFFSET = `${DEFAULT_STICKY_OFFSET_PX}px`;

/**
 * Callback form of `.hover()` / `.focus()` / … Contextual typing uses the *last*
 * overload, so this signature must stay last or `h` becomes implicit `any` inside `.map()`.
 */
export type PseudoStateFn = (builder: PseudoStateBuilder) => void | PseudoStateBuilder;

export abstract class FiboBuilder {
  /** @internal Extra DOM props forwarded to the host element. */
  protected _props: Record<string, any> = {};
  protected _style: CSSProperties = {};
  protected _cssStyles: CSSProperties = {};
  protected _classNames: string[] = [];
  protected _children: ReactNode[] = [];

  protected _theme?: ThemeConfig;
  protected _state: Map<string, any> = new Map();
  protected _providers: Map<string, any> = new Map();
  protected _observers: Set<Observable<any>> = new Set();
  protected _signals: Set<BindableSignal<any>> = new Set();
  protected _isObserver: boolean = false;

  protected _gesture?: GestureBuilder;
  protected _animationConfig?: Partial<AnimationOptions>;
  protected _animatedProps = new Map<string, Signal<any>>();
  protected _transforms: string[] = [];

  protected _transitionClass?: string;
  protected _motionClass?: string;
  protected _staggerMs?: number;
  protected _reveal?: { preset: string; once?: boolean; rootMargin?: string; threshold?: number };
  protected _scrollProgress = false;
  protected _viewTransition?: string;
  protected _reducedMotion: 'reduce' | 'never' = 'reduce';
  protected _usesCssMotion = false;
  protected _explicitScrollMargin = false;

  /** Shrink-wrap: skip the default `w-full` / `self-stretch` on Row and Column. */
  protected _hug = false;

  hug(): this {
    this._hug = true;
    return this;
  }

  protected isHug(): boolean {
    return this._hug;
  }

  id(value: string): this {
    this._props.id = value;
    return this;
  }

  /**
   * Scroll target. Same as `.id()`, plus `scroll-margin-top` so the section
   * is not hidden under a sticky header. Pair with `scrollTo('#name')`.
   */
  anchor(value: string): this {
    this.id(value);
    if (!this._explicitScrollMargin) {
      this._classNames.push(
        _styleManager.register('scroll-margin-top', 'var(--fibo-sticky-offset, 0px)')
      );
    }
    return this;
  }

  /**
   * Explicit `scroll-margin-top` on this node (overrides the sticky CSS variable
   * that `.anchor()` applies).
   */
  scrollMargin(value: number | string): this {
    this._explicitScrollMargin = true;
    const css = typeof value === 'number' ? `${value}px` : value;
    this._classNames.push(_styleManager.register('scroll-margin-top', css));
    return this;
  }

  /** Stamp a class onto the host. Used by PseudoStateBuilder (hashed `:hover` etc.). */
  addClassName(name: string): this {
    if (name && !this._classNames.includes(name)) {
      this._classNames.push(name);
    }
    return this;
  }

  /**
   * React list key. After this is called, React reads the key as a string
   * on both the builder element and the inner host wrapper.
   * Builders are valid elements — you do not need `.build()`.
   */
  key(value: string | number): this {
    this._props.key = value;
    const stamped = (this as any).__fiboElementProps;
    if (stamped && typeof stamped === 'object') {
      (this as any).__fiboElementProps = { ...stamped, key: String(value) };
    }
    return this;
  }

  paddingHorizontal(value: string | number): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;

    const clsLeft = _styleManager.register('padding-left', finalValue);
    const clsRight = _styleManager.register('padding-right', finalValue);
    this._classNames.push(clsLeft, clsRight);
    return this;
  }

  paddingVertical(value: string | number): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    const clsTop = _styleManager.register('padding-top', finalValue);
    const clsBottom = _styleManager.register('padding-bottom', finalValue);
    this._classNames.push(clsTop, clsBottom);
    return this;
  }

  marginHorizontal(value: string | number): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    const clsLeft = _styleManager.register('margin-left', finalValue);
    const clsRight = _styleManager.register('margin-right', finalValue);
    this._classNames.push(clsLeft, clsRight);
    return this;
  }

  marginVertical(value: string | number): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    const clsTop = _styleManager.register('margin-top', finalValue);
    const clsBottom = _styleManager.register('margin-bottom', finalValue);
    this._classNames.push(clsTop, clsBottom);
    return this;
  }

  flexDirection(direction: 'row' | 'column'): this {
    this._classNames.push(`flex-${direction}`);
    return this;
  }

  alignItems(alignment: 'start' | 'center' | 'end' | 'stretch'): this {
    this._classNames.push(`items-${alignment}`);
    return this;
  }

  justifyContent(justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'): this {
    this._classNames.push(`justify-${justify}`);
    return this;
  }

  flex(value?: number | string): this {
    this._classNames.push('flex');
    if (value !== undefined) {
      if (typeof value === 'number') {
        const cls = _styleManager.register('flex', String(value));
        this._classNames.push(cls);
      } else if (typeof value === 'string') {
        this._classNames.push(`flex-${value}`);
      }
    }
    return this;
  }

  grid(): this {
    this._classNames.push('grid');
    return this;
  }

  inlineFlex(): this {
    this._classNames.push('inline-flex');
    return this;
  }

  inlineGrid(): this {
    this._classNames.push('inline-grid');
    return this;
  }

  block(): this {
    this._classNames.push('block');
    return this;
  }

  inlineBlock(): this {
    this._classNames.push('inline-block');
    return this;
  }

  hidden(): this {
    this._classNames.push('hidden');
    return this;
  }

  center(): this {
    this._classNames.push('flex', 'items-center', 'justify-center');
    return this;
  }

  centerX(): this {
    this._classNames.push('flex', 'justify-center');
    return this;
  }

  centerY(): this {
    this._classNames.push('flex', 'items-center');
    return this;
  }

  spaceBetween(): this {
    this._classNames.push('justify-between');
    return this;
  }

  spaceAround(): this {
    this._classNames.push('justify-around');
    return this;
  }

  spaceEvenly(): this {
    this._classNames.push('justify-evenly');
    return this;
  }

  fill(): this {
    this._classNames.push('w-full', 'h-full');
    return this;
  }

  fillWidth(): this {
    this._classNames.push('w-full');
    return this;
  }

  fillHeight(): this {
    this._classNames.push('h-full');
    return this;
  }

  square(size: number | string): this {
    const finalSize = typeof size === 'number' ? `${size}px` : size;
    const cls = _styleManager.register('width', finalSize);
    const cls2 = _styleManager.register('height', finalSize);
    this._classNames.push(cls, cls2);
    return this;
  }

  circle(): this {
    this._classNames.push('rounded-full');
    return this;
  }

  opacity(value: number): this {
    const cls = _styleManager.register('opacity', String(value));
    this._classNames.push(cls);
    return this;
  }

  p(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    const cls = _styleManager.register('padding', finalValue);
    this._classNames.push(cls);
    return this;
  }

  px(value: number | string): this {
    return this.paddingHorizontal(value);
  }

  py(value: number | string): this {
    return this.paddingVertical(value);
  }

  paddingX(value: number | string): this {
    return this.paddingHorizontal(value);
  }

  paddingY(value: number | string): this {
    return this.paddingVertical(value);
  }

  m(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    const cls = _styleManager.register('margin', finalValue);
    this._classNames.push(cls);
    return this;
  }

  mx(value: number | string): this {
    return this.marginHorizontal(value);
  }

  my(value: number | string): this {
    return this.marginVertical(value);
  }

  marginX(value: number | string): this {
    return this.marginHorizontal(value);
  }

  marginY(value: number | string): this {
    return this.marginVertical(value);
  }

  bg(color: string | import('../theme/colorEnums').Colors): this {

    const colorValue = typeof color === 'string' && !color.startsWith('#') && !color.startsWith('rgb')
      ? this.resolveSemanticColor(color)
      : color;

    const cls = _styleManager.register('background-color', colorValue as string);
    this._classNames.push(cls);
    return this;
  }

  text(color: string | import('../theme/colorEnums').Colors): this {

    const colorValue = typeof color === 'string' && !color.startsWith('#') && !color.startsWith('rgb')
      ? this.resolveSemanticColor(color)
      : color;

    const cls = _styleManager.register('color', colorValue as string);
    this._classNames.push(cls);
    return this;
  }

  color(value: string | import('../theme/colorEnums').Colors): this {

    const colorValue = typeof value === 'string' && !value.startsWith('#') && !value.startsWith('rgb')
      ? this.resolveSemanticColor(value)
      : value;

    const cls = _styleManager.register('color', colorValue as string);
    this._classNames.push(cls);
    return this;
  }

  private resolveSemanticColor(colorName: string): string {

    const semanticColors = [
      'primary', 'on-primary', 'primary-container', 'on-primary-container',
      'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
      'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
      'error', 'on-error',
      'background', 'on-background',
      'surface', 'on-surface', 'surface-variant', 'on-surface-variant',
      'outline',
    ];

    if (semanticColors.includes(colorName)) {
      return `var(--fibo-${colorName})`;
    }

    return colorName;
  }

  shadow(config?: import('./shadowTypes').ShadowConfig): this {
    if (config === null || config === 'none') {
      const cls = _styleManager.register('box-shadow', 'none');
      this._classNames.push(cls);
      return this;
    }

    const SHADOW_VALUES: Record<string, string> = {

      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

      card: '0 2px 8px rgba(0, 0, 0, 0.1)',
      button: '0 2px 4px rgba(0, 0, 0, 0.12)',
      modal: '0 10px 40px rgba(0, 0, 0, 0.2)',
      float: '0 8px 16px rgba(0, 0, 0, 0.15)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    };

    const isColor = (str: string): boolean => {
      return str.startsWith('#') || str.startsWith('rgb') || str.startsWith('hsl') ||
        ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black', 'gray'].some(c => str.includes(c));
    };

    const getDirectionalShadow = (direction: string, size: string, color?: string, opacity?: number): string => {
      const baseOpacity = opacity ?? 0.1;
      const shadowColor = color ? color : 'rgba(0, 0, 0, ' + baseOpacity + ')';

      let finalColor = shadowColor;
      if (color && color.startsWith('#') && opacity !== undefined) {

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        finalColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      const sizeMap: Record<string, string> = {
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      };
      const offset = sizeMap[size] || '4px';

      switch (direction) {
        case 'top':
          return `0 -${offset} ${offset} -1px ${finalColor}`;
        case 'bottom':
          return `0 ${offset} ${offset} -1px ${finalColor}`;
        case 'left':
          return `-${offset} 0 ${offset} -1px ${finalColor}`;
        case 'right':
          return `${offset} 0 ${offset} -1px ${finalColor}`;
        case 'top-bottom':
        case 'vertical':
          return `0 -${offset} ${offset} -1px ${finalColor}, 0 ${offset} ${offset} -1px ${finalColor}`;
        case 'left-right':
        case 'horizontal':
          return `-${offset} 0 ${offset} -1px ${finalColor}, ${offset} 0 ${offset} -1px ${finalColor}`;
        case 'all':
        default:
          return SHADOW_VALUES[size] || SHADOW_VALUES.md;
      }
    };

    if (!config) {
      const cls = _styleManager.register('box-shadow', SHADOW_VALUES.md);
      this._classNames.push(cls);
      return this;
    }

    if (typeof config === 'string') {

      if (isColor(config)) {
        const shadow = getDirectionalShadow('all', 'md', config);
        const cls = _styleManager.register('box-shadow', shadow);
        this._classNames.push(cls);
        return this;
      }

      const shadowValue = SHADOW_VALUES[config] || SHADOW_VALUES.md;
      const cls = _styleManager.register('box-shadow', shadowValue);
      this._classNames.push(cls);
      return this;
    }

    if (Array.isArray(config)) {
      const [first, second, third, fourth] = config;

      if (typeof first === 'string' && isColor(first)) {
        const shadow = getDirectionalShadow('all', 'md', first, second as number);
        const cls = _styleManager.register('box-shadow', shadow);
        this._classNames.push(cls);
        return this;
      }

      const direction = first as string;

      const isSecondParamColor = typeof second === 'string' && isColor(second);

      if (isSecondParamColor) {

        const shadow = getDirectionalShadow(direction, 'md', second, third as number);
        const cls = _styleManager.register('box-shadow', shadow);
        this._classNames.push(cls);
        return this;
      } else {

        const size = second as string;
        const shadow = getDirectionalShadow(direction, size, third as string, fourth as number);
        const cls = _styleManager.register('box-shadow', shadow);
        this._classNames.push(cls);
        return this;
      }
    }

    return this;
  }

  /**
   * Breakpoint styles compiled to CSS `@media` (same engine as `.md()`).
   * Tiers stay mutually exclusive: mobile `<768`, tablet `768–1023`, desktop `≥1024`.
   * No `window.innerWidth` — hydrate-safe.
   */
  responsive(styles: ResponsiveStyles): this {
    this.registerMediaStyles('(max-width: 767px)', styles.mobile);
    this.registerMediaStyles('(min-width: 768px) and (max-width: 1023px)', styles.tablet);
    this.registerMediaStyles('(min-width: 1024px)', styles.desktop);
    return this;
  }

  /**
   * CSS `@media` (min-width or a raw query). Compiles to a class — no resize JS.
   *
   * @example Box().padding(8).media('md', { padding: 16 }).media('(prefers-color-scheme: dark)', { backgroundColor: '#111' })
   */
  media(query: BreakpointKey | string, styles: CSSProperties): this {
    this.registerMediaStyles(toMediaQuery(query), styles);
    return this;
  }

  private registerMediaStyles(mq: string, styles?: CSSProperties): void {
    if (!styles) return;
    const unitless = new Set([
      'opacity', 'zIndex', 'z-index', 'flex', 'flexGrow', 'flexShrink',
      'order', 'fontWeight', 'lineHeight',
    ]);
    for (const [key, raw] of Object.entries(styles)) {
      if (raw === undefined || raw === null) continue;
      const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const value =
        typeof raw === 'number' && !unitless.has(key) && !unitless.has(prop)
          ? `${raw}px`
          : String(raw);
      this._classNames.push(_styleManager.registerMedia(mq, prop, value));
    }
  }

  sm(styles: CSSProperties): this {
    return this.media('sm', styles);
  }

  md(styles: CSSProperties): this {
    return this.media('md', styles);
  }

  lg(styles: CSSProperties): this {
    return this.media('lg', styles);
  }

  xl(styles: CSSProperties): this {
    return this.media('xl', styles);
  }

  rounded(value: string | number): this {
    if (typeof value === 'number') {
      const cls = _styleManager.register('border-radius', `${value}px`);
      this._classNames.push(cls);
    }
    else if (typeof value === 'string' && (value.startsWith('rounded-') || ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full', 'none'].includes(value))) {
      const className = value.startsWith('rounded-') ? value : `rounded-${value}`;
      this._classNames.push(className);
    }
    else {
      const cls = _styleManager.register('border-radius', value);
      this._classNames.push(cls);
    }
    return this;
  }

  borderRadius(value: string | number): this {
    if (typeof value === 'number') {
      const cls = _styleManager.register('border-radius', `${value}px`);
      this._classNames.push(cls);
    } else {
      const cls = _styleManager.register('border-radius', value);
      this._classNames.push(cls);
    }
    return this;
  }

  borderColor(value: string): this {
    if (value.startsWith('border-')) {
      this._classNames.push(value);
    } else if (['red', 'blue', 'green', 'gray', 'white', 'black', 'transparent'].some(c => value.includes(c))) {

      this._classNames.push(`border-${value}`);
    } else {
      const cls = _styleManager.register('border-color', value);
      this._classNames.push(cls);
    }
    return this;
  }

  width(value: string | number): this {
    if (typeof value === 'number') {

      const cls = _styleManager.register('width', `${value}px`);
      this._classNames.push(cls);
    }
    else if (typeof value === 'string' && (value.startsWith('w-') || value === 'full' || value === 'screen' || value === 'min' || value === 'max' || value === 'fit')) {
      const className = value.startsWith('w-') ? value : `w-${value}`;
      this._classNames.push(className);
    }
    else {
      const cls = _styleManager.register('width', value);
      this._classNames.push(cls);
    }
    return this;
  }

  height(value: string | number): this {
    if (typeof value === 'number') {

      const cls = _styleManager.register('height', `${value}px`);
      this._classNames.push(cls);
    }
    else if (typeof value === 'string' && (value.startsWith('h-') || value === 'full' || value === 'screen' || value === 'min' || value === 'max' || value === 'fit')) {
      const className = value.startsWith('h-') ? value : `h-${value}`;
      this._classNames.push(className);
    }
    else {
      const cls = _styleManager.register('height', value);
      this._classNames.push(cls);
    }
    return this;
  }

  gap(value: string | number): this {
    if (typeof value === 'number') {
      const cls = _styleManager.register('gap', `${value}px`);
      this._classNames.push(cls);
    }
    else if (typeof value === 'string' && value.startsWith('gap-')) {
      this._classNames.push(value);
    }
    else {
      const cls = _styleManager.register('gap', value);
      this._classNames.push(cls);
    }
    return this;
  }

  clean(): this {
    this._classNames.push(

      '[&_input]:outline-none', '[&_input]:ring-0', '[&_input]:border-none', '[&_input]:!shadow-none',
      '[&_input]:bg-transparent', '[&_input]:h-full', '[&_input]:w-full', '[&_input]:p-0',

      '[&_textarea]:outline-none', '[&_textarea]:ring-0', '[&_textarea]:border-none', '[&_textarea]:!shadow-none',
      '[&_textarea]:bg-transparent', '[&_textarea]:h-full', '[&_textarea]:w-full', '[&_textarea]:p-0',

      '[&_select]:outline-none', '[&_select]:ring-0', '[&_select]:border-none', '[&_select]:!shadow-none',
      '[&_select]:bg-transparent', '[&_select]:h-full', '[&_select]:w-full', '[&_select]:p-0',

      '[&_.fibo-textfield-input]:outline-none',
      '[&_.fibo-textfield-input]:ring-0',
      '[&_.fibo-textfield-input]:border-none',
      '[&_.fibo-textfield-input]:!shadow-none',
      '[&_.fibo-textfield-input]:bg-transparent',
      '[&_.fibo-textfield-input]:h-full',
      '[&_.fibo-textfield-input]:w-full',
      '[&_.fibo-textfield-input]:p-0',

      '[&_.fibo-textarea-input]:outline-none',
      '[&_.fibo-textarea-input]:ring-0',
      '[&_.fibo-textarea-input]:border-none',
      '[&_.fibo-textarea-input]:!shadow-none',
      '[&_.fibo-textarea-input]:bg-transparent',
      '[&_.fibo-textarea-input]:h-full',
      '[&_.fibo-textarea-input]:w-full',
      '[&_.fibo-textarea-input]:p-0',

      '[&>div]:h-full'
    );
    return this;
  }

  borderInput(color: string = 'gray-300', focusColor: string = 'blue-500'): this {

    const resolveColor = (c: string) => {
      const genericColors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray', 'orange', 'teal', 'cyan', 'emerald', 'lime', 'amber', 'fuchsia', 'rose', 'violet', 'sky', 'slate', 'zinc', 'neutral', 'stone'];
      if (genericColors.includes(c)) return `${c}-500`;
      return c;
    };

    const finalColor = resolveColor(color);
    const finalFocusColor = resolveColor(focusColor);

    this._classNames.push(
      'border',
      `border-${finalColor}`,

      'focus-within:ring-2',
      `focus-within:ring-${finalFocusColor}`,
      `focus-within:border-${finalFocusColor}`,

    );
    return this.clean();
  }

  weight(value: string | number): this {
    if (typeof value === 'number') {
      const cls = _styleManager.register('font-weight', String(value));
      this._classNames.push(cls);
    } else {
      const map: Record<string, string> = {
        thin: 'font-thin',
        extralight: 'font-extralight',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      };
      if (map[value]) {
        this._classNames.push(map[value]);
      } else {
        const cls = _styleManager.register('font-weight', value);
        this._classNames.push(cls);
      }
    }
    return this;
  }

  onClick(handler: (event: React.MouseEvent<any>) => void): this {
    this._props.onClick = handler;
    return this;
  }

  state<T>(key: string, initialValue: T): this {
    this._state.set(key, initialValue);
    return this;
  }

  getState<T>(key: string): T | undefined {
    return this._state.get(key);
  }

  setState<T>(key: string, value: T): this {
    this._state.set(key, value);
    return this;
  }

  provide<T>(key: string, value: T): this {
    this._providers.set(key, value);
    return this;
  }

  consume<T>(key: string): T | undefined {
    return this._providers.get(key);
  }

  observer(options?: string | number | { key?: string | number }): this {
    this._isObserver = true;
    if (typeof options === 'object' && options !== null) {
      if (options.key !== undefined) {
        this.key(options.key);
      }
    } else if (options !== undefined) {
      this.key(options);
    }
    return this;
  }

  observe<T>(observable: Observable<T>): this {
    this._observers.add(observable);
    return this;
  }

  bindSignal<T>(signal: BindableSignal<T>): this {
    this._signals.add(signal);
    return this;
  }

  translateX(value: Signal<number> | number): this {
    if (value instanceof Signal) {
      this._animatedProps.set('translateX', value);
    } else {
      this._transforms.push(`translateX(${value}px)`);
    }
    return this;
  }

  translateY(value: Signal<number> | number): this {
    if (value instanceof Signal) {
      this._animatedProps.set('translateY', value);
    } else {
      this._transforms.push(`translateY(${value}px)`);
    }
    return this;
  }

  scale(value: Signal<number> | number): this {
    if (value instanceof Signal) {
      this._animatedProps.set('scale', value);
    } else {
      this._transforms.push(`scale(${value})`);
    }
    return this;
  }

  rotate(degrees: Signal<number> | number): this {
    if (degrees instanceof Signal) {
      this._animatedProps.set('rotate', degrees);
    } else {
      this._transforms.push(`rotate(${degrees}deg)`);
    }
    return this;
  }

  gesture(gesture: GestureBuilder): this {
    this._gesture = gesture;
    return this;
  }

  animation(config: Partial<AnimationOptions>): this {
    this._animationConfig = config;
    return this;
  }

  protected hasStateManagement(): boolean {
    return (
      this._state.size > 0 ||
      this._providers.size > 0 ||
      this._observers.size > 0 ||
      this._signals.size > 0 ||
      this._isObserver ||
      this._animatedProps.size > 0
    );
  }

  className(className: string): this {
    this._classNames.push(className);
    return this;
  }

  classNames(classNames: string[]): this {
    this._classNames.push(...classNames);
    return this;
  }

  css(styles: CSSProperties): this {
    this._cssStyles = { ...this._cssStyles, ...styles };
    return this;
  }

  style(style: CSSProperties): this {
    this._style = { ...this._style, ...style };
    return this;
  }

  props(props: Record<string, any>): this {
    this._props = { ...this._props, ...props };
    return this;
  }

  // Transition properties
  protected _transitionDuration: number = 200; // ms
  protected _transitionEasing: string = 'ease-in-out';
  protected _transitionDelay: number = 0; // ms
  protected _transitionProperties: string[] = ['all'];

  /**
   * Apply CSS transition
   * 
   * Overload 1: String syntax
   * Example: .transition('all 0.2s ease-in-out')
   * 
   * Overload 2: Shorthand with parameters
   * Example: .transition('all', 200, 'ease-out')
   * Example: .transition('all', 200, 'ease-out', 50)
   */
  transition(value: string): this;
  transition(properties: string | string[], duration: number, easing?: string, delay?: number): this;
  transition(
    valueOrProperties: string | string[],
    duration?: number,
    easing?: string,
    delay?: number
  ): this {
    // If only one argument and it's a string with spaces, treat as CSS string
    if (typeof valueOrProperties === 'string' && duration === undefined) {
      this.replaceTransitionClass(_styleManager.register('transition', valueOrProperties));
      return this;
    }

    const props = Array.isArray(valueOrProperties) ? valueOrProperties.join(', ') : valueOrProperties;
    const dur = `${duration || this._transitionDuration}ms`;
    const ease = resolveCssEase(easing || this._transitionEasing);
    const del = delay ? `${delay}ms` : '0ms';

    this.replaceTransitionClass(_styleManager.register('transition', `${props} ${dur} ${ease} ${del}`));
    return this;
  }

  /**
   * Set transition duration in milliseconds
   * Example: .duration(200) → 200ms
   */
  duration(ms: number): this {
    this._transitionDuration = ms;
    if (this._motionClass) {
      (this._style as Record<string, string>)['--fibo-dur'] = `${ms}ms`;
      return this;
    }
    this._applyTransition();
    return this;
  }

  /**
   * Set transition easing function
   * Example: .easing('ease-in-out')
   */
  easing(value: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | string): this {
    this._transitionEasing = resolveCssEase(value);
    if (this._motionClass) {
      (this._style as Record<string, string>)['--fibo-ease'] = this._transitionEasing;
      return this;
    }
    this._applyTransition();
    return this;
  }

  /** Alias of `.easing()`. `'spring'` becomes CSS `linear()`. */
  ease(value: string): this {
    return this.easing(value);
  }

  /**
   * Set transition delay in milliseconds
   * Example: .delay(100) → 100ms delay
   */
  delay(ms: number): this {
    this._transitionDelay = ms;
    if (this._motionClass) {
      (this._style as Record<string, string>)['--fibo-delay'] = `${ms}ms`;
      return this;
    }
    this._applyTransition();
    return this;
  }

  /**
   * Set which properties to transition
   * Example: .properties(['color', 'transform'])
   */
  properties(props: string[]): this {
    this._transitionProperties = props;
    this._applyTransition();
    return this;
  }

  /**
   * Apply the built transition to the element
   */
  protected _applyTransition(): void {
    const props = this._transitionProperties.join(', ');
    const duration = `${this._transitionDuration}ms`;
    const easing = this._transitionEasing;
    const delay = this._transitionDelay > 0 ? `${this._transitionDelay}ms` : '0ms';
    this.replaceTransitionClass(_styleManager.register('transition', `${props} ${duration} ${easing} ${delay}`));
  }

  private replaceTransitionClass(cls: string): void {
    if (this._transitionClass) {
      this._classNames = this._classNames.filter((c) => c !== this._transitionClass);
    }
    this._transitionClass = cls;
    this._classNames.push(cls);
  }

  /**
   * CSS enter/exit preset. Compiles to `@keyframes` — no rAF.
   * @example Box().animate('fadeIn').duration(300).ease('spring')
   */
  animate(
    preset: MotionPreset | string,
    options?: {
      duration?: number;
      ease?: string;
      delay?: number;
      from?: number | string;
      stiffness?: number;
      damping?: number;
      mass?: number;
    }
  ): this;
  animate(custom: CustomMotion): this;
  animate(
    presetOrCustom: MotionPreset | string | CustomMotion,
    options?: {
      duration?: number;
      ease?: string;
      delay?: number;
      from?: number | string;
      stiffness?: number;
      damping?: number;
      mass?: number;
    }
  ): this {
    ensureMotionCss();
    this._usesCssMotion = true;
    if (this._motionClass) {
      this._classNames = this._classNames.filter((c) => c !== this._motionClass);
    }

    const custom = isCustomMotion(presetOrCustom);
    const duration = (custom ? presetOrCustom.duration : options?.duration) ?? this._transitionDuration;
    const delay = (custom ? presetOrCustom.delay : options?.delay) ?? this._transitionDelay;
    let easeName = custom ? presetOrCustom.ease : options?.ease;
    const spring: SpringOptions = {
      stiffness: (custom ? presetOrCustom.stiffness : options?.stiffness) ?? undefined,
      damping: (custom ? presetOrCustom.damping : options?.damping) ?? undefined,
      mass: (custom ? presetOrCustom.mass : options?.mass) ?? undefined,
    };

    if (custom) {
      const from = cssDecls(presetOrCustom.from);
      const to = cssDecls(presetOrCustom.to);
      const name = _styleManager.registerKeyframes(hashDecls(`${from}=>${to}`), from, to);
      this._motionClass = `fibo-anim ${name}`;
      this._props['data-fibo-anim'] = 'custom';
    } else {
      const preset = normalizePreset(presetOrCustom);
      this._motionClass = `fibo-anim fibo-anim-${preset}`;
      this._props['data-fibo-anim'] = preset;
      if (options?.from !== undefined) {
        (this._style as Record<string, string>)['--fibo-from'] =
          typeof options.from === 'number' ? `${options.from}px` : options.from;
      }
      if (!easeName && preset === 'pop') easeName = 'spring';
    }

    const ease = resolveCssEase(easeName ?? 'ease', spring);
    this._classNames.push(this._motionClass);
    const cssVars = this._style as Record<string, string>;
    cssVars['--fibo-dur'] = `${duration}ms`;
    cssVars['--fibo-ease'] = ease;
    cssVars['--fibo-delay'] = `${delay}ms`;
    if (this._reducedMotion === 'never' && !this._classNames.includes('fibo-motion-force')) {
      this._classNames.push('fibo-motion-force');
    }
    return this;
  }

  /** CSS `linear()` spring. Works on `.animate()` and `.transition()` / `.hover()`. */
  spring(options?: SpringOptions): this {
    const ease = springEase(options);
    this._transitionEasing = ease;
    if (this._motionClass) {
      (this._style as Record<string, string>)['--fibo-ease'] = ease;
      return this;
    }
    this._applyTransition();
    return this;
  }

  reducedMotion(mode: 'reduce' | 'never' = 'reduce'): this {
    this._reducedMotion = mode;
    if (mode === 'never' && !this._classNames.includes('fibo-motion-force')) {
      this._classNames.push('fibo-motion-force');
    }
    return this;
  }

  press(callback?: (builder: PseudoStateBuilder) => void | PseudoStateBuilder): this {
    this.ensureInteractiveTransition();
    if (callback) {
      this.active(callback);
      return this;
    }
    this.active((s) => {
      s.scale(0.97);
    });
    return this;
  }

  focusVisible(): PseudoStateBuilder;
  focusVisible(callback: PseudoStateFn): this;
  focusVisible(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('focus-visible', this);
    if (callback) {
      callback(builder);
      return this;
    }
    return builder;
  }

  stagger(ms: number): this {
    this._staggerMs = ms;
    this._usesCssMotion = true;
    (this._style as Record<string, string>)['--fibo-stagger'] = `${ms}ms`;
    ensureMotionCss();
    return this;
  }

  /** Scroll-reveal: IntersectionObserver toggles `.fibo-inview`. */
  reveal(preset: string | { preset?: string; once?: boolean; rootMargin?: string; threshold?: number } = 'fadeUp'): this {
    this._reveal = typeof preset === 'string' ? { preset, once: true } : { preset: 'fadeUp', once: true, ...preset };
    this._usesCssMotion = true;
    ensureMotionCss();
    return this;
  }

  /** Alias of `.reveal()` for scroll-triggered presets. */
  onScroll(preset: string = 'fadeIn'): this {
    return this.reveal(preset);
  }

  /** CSS `animation-timeline: view()` / `scroll()`; IntersectionObserver reveal is the fallback. */
  scrollTimeline(kind: 'view' | 'scroll' = 'view'): this {
    ensureMotionCss();
    this._classNames.push(kind === 'scroll' ? 'fibo-scroll-timeline' : 'fibo-view-timeline');
    this._usesCssMotion = true;
    if (kind === 'view' && !this._reveal) {
      this._reveal = { preset: 'fadeUp', once: true };
    }
    return this;
  }

  scrollProgress(): this {
    ensureMotionCss();
    this._scrollProgress = true;
    this._classNames.push('fibo-scroll-progress');
    this._usesCssMotion = true;
    return this;
  }

  smoothScroll(): this {
    this._classNames.push(_styleManager.register('scroll-behavior', 'smooth'));
    return this;
  }

  scrollSnap(axis: 'x' | 'y' | 'both' = 'y'): this {
    ensureMotionCss();
    this._classNames.push(`fibo-snap-${axis}`);
    return this;
  }

  scrollSnapAlign(align: 'start' | 'center' | 'end' = 'start'): this {
    ensureMotionCss();
    this._classNames.push(`fibo-snap-${align}`);
    return this;
  }

  sticky(top: number | string | boolean = 0): this {
    if (top === false) return this;
    this._classNames.push(_styleManager.register('position', 'sticky'));
    const topValue = top === true ? '0px' : typeof top === 'number' ? `${top}px` : top;
    this._classNames.push(_styleManager.register('top', topValue));
    const offset =
      top === true || top === 0
        ? DEFAULT_STICKY_OFFSET
        : typeof top === 'number'
          ? `${Math.max(top, DEFAULT_STICKY_OFFSET_PX)}px`
          : top;
    this.publishStickyOffset(offset);
    return this;
  }

  /**
   * Publish `--fibo-sticky-offset` on `:root` so `.anchor()` / `html` scroll-padding
   * clear this bar. Header uses the real bar height.
   */
  protected publishStickyOffset(value: number | string): void {
    const css = typeof value === 'number' ? `${value}px` : value;
    _styleManager.registerRoot('--fibo-sticky-offset', css);
    _styleManager.ensureScrollPadding();
  }

  viewTransition(name: string): this {
    this._viewTransition = name;
    (this._style as Record<string, string>).viewTransitionName = name;
    return this;
  }

  /** Default `:focus-visible` ring. Pass a callback to customize. */
  focusRing(color = 'var(--fibo-primary)'): this {
    this.focusVisible((state) => {
      state.css('outline', `2px solid ${color}`);
      state.css('outline-offset', '2px');
    });
    return this;
  }

  protected ensureInteractiveTransition(): void {
    if (this._transitionClass || this._motionClass) return;
    this.replaceTransitionClass(
      _styleManager.register(
        'transition',
        `transform ${this._transitionDuration}ms ${this._transitionEasing}, opacity ${this._transitionDuration}ms ${this._transitionEasing}`
      )
    );
  }

  theme(themeConfig: ThemeConfig): this {
    this._theme = themeConfig;
    return this;
  }

  hover(): PseudoStateBuilder;
  hover(callback: PseudoStateFn): this;
  hover(callback?: PseudoStateFn): this | PseudoStateBuilder {
    this.ensureInteractiveTransition();
    const builder = new PseudoStateBuilder('hover', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  focus(): PseudoStateBuilder;
  focus(callback: PseudoStateFn): this;
  focus(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('focus', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  active(): PseudoStateBuilder;
  active(callback: PseudoStateFn): this;
  active(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('active', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  visited(): PseudoStateBuilder;
  visited(callback: PseudoStateFn): this;
  visited(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('visited', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  disabledState(): PseudoStateBuilder;
  disabledState(callback: PseudoStateFn): this;
  disabledState(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('disabled', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  focusWithin(): PseudoStateBuilder;
  focusWithin(callback: PseudoStateFn): this;
  focusWithin(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('focus-within', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  firstChild(): PseudoStateBuilder;
  firstChild(callback: PseudoStateFn): this;
  firstChild(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('first-child', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  lastChild(): PseudoStateBuilder;
  lastChild(callback: PseudoStateFn): this;
  lastChild(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('last-child', this);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  groupHover(): PseudoStateBuilder;
  groupHover(callback: PseudoStateFn): this;
  groupHover(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('hover', this, true);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  groupFocus(): PseudoStateBuilder;
  groupFocus(callback: PseudoStateFn): this;
  groupFocus(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('focus', this, true);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  groupActive(): PseudoStateBuilder;
  groupActive(callback: PseudoStateFn): this;
  groupActive(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('active', this, true);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  groupFocusWithin(): PseudoStateBuilder;
  groupFocusWithin(callback: PseudoStateFn): this;
  groupFocusWithin(callback?: PseudoStateFn): this | PseudoStateBuilder {
    const builder = new PseudoStateBuilder('focus-within', this, true);

    if (callback) {
      callback(builder);
      return this;
    }

    return builder;
  }

  group(): this {
    this._classNames.push('group');
    return this;
  }

  protected _childFunction?: () => FiboChild | FiboChild[];

  children(children: FiboChildren): this {
    if (typeof children === 'function') {
      this._childFunction = children as () => FiboChild | FiboChild[];
      this._children = [];
    } else {
      this._children = normalizeFiboChildren(children);
      this._childFunction = undefined;
    }
    return this;
  }

  protected getClassName(): string {
    let extra: string | undefined;
    if (Object.keys(this._cssStyles).length > 0) {
      extra = cssToTailwind(this._cssStyles as Record<string, string | number | undefined>) || undefined;
    }
    return clsx(this._classNames, extra);
  }

  protected getStyle(): CSSProperties {
    let finalStyle = { ...this._style, ...this._cssStyles };

    if (this._theme) {

      const themeColors = this._theme.colors || this._theme.colorScheme;

      if (themeColors) {

        const styleAny = finalStyle as any;

        if (themeColors.primary) styleAny['--fibo-primary'] = themeColors.primary;
        if (themeColors.onPrimary) styleAny['--fibo-on-primary'] = themeColors.onPrimary;

        if (themeColors.secondary) styleAny['--fibo-secondary'] = themeColors.secondary;
        if (themeColors.onSecondary) styleAny['--fibo-on-secondary'] = themeColors.onSecondary;

        if (themeColors.background) {
          styleAny['--fibo-background'] = themeColors.background;
        }
        if (themeColors.onBackground) styleAny['--fibo-on-background'] = themeColors.onBackground;

        if (themeColors.surface) styleAny['--fibo-surface'] = themeColors.surface;
        if (themeColors.onSurface) styleAny['--fibo-on-surface'] = themeColors.onSurface;

        if (themeColors.error) styleAny['--fibo-error'] = themeColors.error;
      }
    }

    // Breakpoints compile to CSS `@media` via `.media()` / `.responsive()` — not inline style.

    if (this._transforms.length > 0) {
      const existingTransform = finalStyle.transform || '';
      finalStyle.transform = existingTransform
        ? `${existingTransform} ${this._transforms.join(' ')}`
        : this._transforms.join(' ');
    }

    if (this._animationConfig && this._animatedProps.size === 0) {
      const { duration = 300, curve = 'easeOut', stiffness, damping } = this._animationConfig;
      const timingFunction = resolveCssEase(curve, { stiffness, damping });
      finalStyle.transition = `all ${duration}ms ${timingFunction}`;
    }

    return finalStyle;
  }

  protected processChildren(): ReactNode[] {
    const raw = this._childFunction
      ? normalizeFiboChildren(this._childFunction)
      : this._children;
    if (this._staggerMs == null) return raw;
    return raw.map((child, index) =>
      React.createElement(
        'span',
        {
          key:
            React.isValidElement(child) && isUsableReactKey(child.key)
              ? child.key
              : `fibo-stagger-${index}`,
          className: 'fibo-stagger-item',
          style: { ['--fibo-i' as string]: String(index) },
        },
        child
      )
    );
  }

  protected getChildFunction(): (() => FiboChild | FiboChild[]) | undefined {
    return this._childFunction;
  }

  /**
   * @deprecated Builders are React elements. Returning or nesting the builder is enough.
   * `.build()` still assembles the host tree for older call sites.
   */
  abstract build(): ReactElement;
}

const REACT_ELEMENT_FIELDS = new Set<PropertyKey>([
  '$$typeof',
  'type',
  'props',
  'ref',
  '_owner',
  '_store',
  '_self',
  '_source',
  '_debugStack',
  '_debugTask',
  '_debugInfo',
]);

function listKeyOf(target: FiboBuilder): string | number | undefined {
  const key = (target as any)._props?.key;
  if (key == null || key === '') return undefined;
  return key;
}

function assembleBuilder(target: FiboBuilder): ReactElement {
  const isObserver = (target as any)._isObserver;
  const signals = (target as any)._signals as Set<BindableSignal<any>> | undefined;
  const observers = (target as any)._observers;
  const state = (target as any)._state;
  const providers = (target as any)._providers;
  const listKey = listKeyOf(target);

  const assemble = () => {
    let element = target.build();

    const animatedProps = (target as any)._animatedProps;
    const animationConfig = (target as any)._animationConfig;
    if (animatedProps && animatedProps.size > 0) {
      element = React.createElement(AnimatedWrapper, {
        key: listKey,
        animatedProps,
        animationConfig,
        children: element
      });
    }

    const reveal = (target as any)._reveal as
      | { preset: string; once?: boolean; rootMargin?: string; threshold?: number }
      | undefined;
    if (reveal) {
      element = React.createElement(Reveal, {
        key: listKey,
        preset: reveal.preset,
        once: reveal.once,
        rootMargin: reveal.rootMargin,
        threshold: reveal.threshold,
        forceMotion: (target as any)._reducedMotion === 'never',
        preferTimeline: (target as any)._classNames?.includes('fibo-view-timeline'),
        children: element,
      });
    }

    if ((target as any)._scrollProgress) {
      element = React.createElement(ScrollProgress, { key: listKey, children: element });
    }

    if ((target as any)._usesCssMotion) {
      element = React.createElement(
        React.Fragment,
        { key: listKey },
        React.createElement(MotionStyles),
        element
      );
    }

    const gesture = (target as any)._gesture;
    if (gesture) {
      element = gesture.wrap(element);
    }

    return element;
  };

  const hasState = typeof (target as any).hasStateManagement === 'function'
    ? (target as any).hasStateManagement()
    : Boolean(isObserver || (signals && signals.size) || (observers && observers.size) || (state && state.size) || (providers && providers.size));

  const observed = isObserver
    ? React.createElement(Observer, {
        key: listKey,
        children: assemble
      })
    : null;

  const rebuild = () => (observed ?? assemble());

  let tree: ReactElement = rebuild();

  if (hasState && signals && signals.size > 0) {
    tree = React.createElement(SignalWrapper, {
      key: listKey,
      signals,
      children: rebuild
    });
  } else if (hasState && observers && observers.size > 0) {
    tree = React.createElement(ObserverWrapper, {
      key: listKey,
      observables: observers,
      children: rebuild
    });
  }

  if (hasState && state && state.size > 0) {
    tree = React.createElement(StateWrapper, {
      key: listKey,
      stateMap: state,
      children: tree
    });
  }

  if (hasState && providers && providers.size > 0) {
    tree = React.createElement(ProviderWrapper, {
      key: listKey,
      providers: providers,
      children: tree
    });
  }

  return tree;
}

function stampRenderable(
  instance: object,
  assemble: () => ReactElement,
  displayName: string
): void {
  const Render = function FiboElement() {
    return assemble();
  };
  Render.displayName = displayName;

  // Steal $$typeof from the running React (18: react.element, 19: transitional.element).
  const proto = React.createElement(Render);
  Object.defineProperty(instance, '$$typeof', {
    value: (proto as any).$$typeof,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(instance, 'type', {
    value: Render,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  (instance as any).ref = (proto as any).ref ?? null;
  (instance as any).__fiboElementProps = proto.props ?? {};
  if ((proto as any)._owner !== undefined) {
    (instance as any)._owner = (proto as any)._owner;
  }
  (instance as any)._store = { validated: 1 };
}

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;

type StyleBuilder<T> = T & {
  [K in KnownKeys<CSSProperties>]-?: (value: CSSProperties[K]) => StyleBuilder<T>;
} & ReactElement;

export function createBuilder<T extends FiboBuilder, Args extends any[]>(
  BuilderClass: new (...args: Args) => T
): (...args: Args) => StyleBuilder<T> {
  return (...args: Args) => {
    const instance = new BuilderClass(...args);
    const displayName = BuilderClass.name.replace(/Builder$/, '') || 'Fibo';
    const assemble = () => assembleBuilder(instance);
    stampRenderable(instance, assemble, displayName);

    return new Proxy(instance, {
      get(target, prop, receiver) {
        if (prop === 'build') {
          return assemble;
        }

        if (prop === 'key') {
          const stored = (target as any)._props?.key;
          if (stored != null && stored !== '') {
            return String(stored);
          }
          // Fluent `.key(id)` when unset. Parents stamp string keys via
          // `normalizeFiboChildren` so React never stringifies this function.
          if (!(target as any).__fiboKeyFn) {
            const fluent = (value: string | number) => {
              target.key(value);
              return receiver;
            };
            (target as any).__fiboKeyFn = fluent;
          }
          return (target as any).__fiboKeyFn;
        }

        if (prop === 'props') {
          const storedKey = (target as any)._props?.key;
          const reactProps = {
            ...((target as any).__fiboElementProps ?? {}),
            ...(storedKey != null && storedKey !== '' ? { key: String(storedKey) } : {}),
          };
          const method = Object.getPrototypeOf(target).props;
          if (typeof method === 'function') {
            const fluent = (extra: Record<string, any>) => {
              method.call(target, extra);
              return receiver;
            };
            return Object.assign(fluent, reactProps);
          }
          return reactProps;
        }

        if (REACT_ELEMENT_FIELDS.has(prop)) {
          return Reflect.get(target, prop, receiver);
        }

        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }

        return (value: any) => {
          const cssProp = (prop as string).replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

          const unitlessProps = ['opacity', 'z-index', 'flex', 'flex-grow', 'flex-shrink', 'order', 'font-weight', 'line-height'];
          const isUnitless = unitlessProps.includes(cssProp);

          const finalValue = typeof value === 'number' && !isUnitless ? `${value}px` : String(value);

          const cls = _styleManager.register(cssProp, finalValue);
          target.className(cls);
          return receiver;
        };
      },
    }) as StyleBuilder<T>;
  };
}

interface SignalLike<T> {
  value: T;
  subscribe: (listener: (val: T) => void) => () => void;
}

const ValueBinderInner = <T>({
  signal,
  builder,
  loading,
  error
}: {
  signal: SignalLike<T>,
  builder?: (val: T) => ReactNode,
  loading?: () => ReactNode,
  error?: (err: Error | unknown) => ReactNode
}) => {
  const value = React.useSyncExternalStore(
    React.useCallback((callback) => {
      if (signal.subscribe) {
        return signal.subscribe(callback);
      }
      return () => { };
    }, [signal]),
    () => signal.value
  );

  const err = (value as any)?.error;
  if (err && error) {
    return error(err);
  }

  const isLoading = (value as any)?.isLoading || (value as any)?.loading;
  if (isLoading === true && loading) {
    return loading();
  }

  if (builder) {
    return builder(value);
  }

  return null;
};

const ValueBinder = React.memo(ValueBinderInner) as typeof ValueBinderInner;

export class FluentValueBuilder<T> {
  private _loading?: () => ReactNode;
  private _error?: (error: Error | unknown) => ReactNode;
  private _builder?: (value: T) => ReactNode;

  constructor(private _signal: SignalLike<T>) {
    stampRenderable(this, () => this.build(), 'ValueBuilder');
  }

  loading(component: ReactNode | (() => ReactNode)): this {
    this._loading = typeof component === 'function' ? (component as () => ReactNode) : () => component;
    return this;
  }

  error(component: (error: Error | unknown) => ReactNode): this {
    this._error = component;
    return this;
  }

  builder(fn: (value: T) => ReactNode): this {
    this._builder = fn;
    return this;
  }

  children(fn: (value: T) => ReactNode): this {
    this._builder = fn;
    return this;
  }

  build(): ReactElement {
    return React.createElement(ValueBinder as any, {
      signal: this._signal,
      builder: this._builder,
      loading: this._loading,
      error: this._error
    });
  }
}

export function ValueBuilder<T>(signal: SignalLike<T>): FluentValueBuilder<T> {
  return new FluentValueBuilder(signal);
}
