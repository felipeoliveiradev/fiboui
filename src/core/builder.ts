import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { ResponsiveStyles } from './types';
import { Observable, Signal } from './state';
import { Observer, SignalWrapper, ObserverWrapper, StateWrapper, ProviderWrapper } from './StateWrapper';
import clsx from 'clsx';
import { _styleManager } from './styleManager';
import { cssToTailwind } from '@metagptx/css-to-tailwind';
import { GestureBuilder } from './gestures/GestureBuilders';
import { AnimationOptions } from './animations';
import { AnimatedWrapper } from './AnimatedWrapper';

export abstract class FiboBuilder {
  protected _props: Record<string, any> = {};
  protected _style: CSSProperties = {};
  protected _cssStyles: CSSProperties = {};
  protected _classNames: string[] = [];
  protected _children: ReactNode[] = [];
  protected _responsive?: ResponsiveStyles;


  protected _state: Map<string, any> = new Map();
  protected _providers: Map<string, any> = new Map();
  protected _observers: Set<Observable<any>> = new Set();
  protected _signals: Set<Signal<any>> = new Set();
  protected _isObserver: boolean = false;

  // Animation & Gesture
  protected _gesture?: GestureBuilder;
  protected _animationConfig?: Partial<AnimationOptions>;
  protected _animatedProps = new Map<string, Signal<any>>();
  protected _transforms: string[] = [];



  id(value: string): this {
    this._props.id = value;
    return this;
  }

  key(value: string | number): this {
    this._props.key = value;
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


  responsive(styles: ResponsiveStyles): this {
    this._responsive = styles;
    return this;
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
      // Use pixels for direct number access - standardizes API to be like Flutter/cleaner
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
      // Use pixels for direct number access
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


  bindSignal<T>(signal: Signal<T>): this {
    this._signals.add(signal);
    return this;
  }

  // Transform modifiers
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

  // Gesture modifier
  gesture(gesture: GestureBuilder): this {
    this._gesture = gesture;
    return this;
  }

  // Animation modifier
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

  protected _childFunction?: () => ReactNode;

  children(children: ReactNode | ReactNode[] | (() => ReactNode)): this {
    if (typeof children === 'function') {
      this._childFunction = children as () => ReactNode;
      this._children = [];
    } else {
      const childArray = Array.isArray(children) ? children : [children];
      this._children = childArray.map((child) => {
        if (child && typeof child === 'object' && 'build' in child && typeof (child as any).build === 'function') {
          return (child as any).build();
        }
        return child;
      });
      this._childFunction = undefined;
    }
    return this;
  }

  protected getClassName(): string {
    if (Object.keys(this._cssStyles).length > 0) {

      const tailwindClasses = cssToTailwind(this._cssStyles as Record<string, string | number | undefined>);
      if (tailwindClasses) {
        this._classNames.push(tailwindClasses);
      }
    }
    return clsx(this._classNames);
  }

  protected getStyle(): CSSProperties {
    let finalStyle = { ...this._style, ...this._cssStyles };

    if (this._responsive) {
      if (this._responsive.mobile) {
        finalStyle = { ...finalStyle, ...this._responsive.mobile };
      }
    }

    // Apply static transforms
    if (this._transforms.length > 0) {
      const existingTransform = finalStyle.transform || '';
      finalStyle.transform = existingTransform
        ? `${existingTransform} ${this._transforms.join(' ')}`
        : this._transforms.join(' ');
    }

    // Apply animation transition if configured
    if (this._animationConfig && this._animatedProps.size === 0) {
      const { duration = 300, curve = 'easeOut' } = this._animationConfig;
      const timingFunction = curve === 'spring'
        ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        : curve;
      finalStyle.transition = `all ${duration}ms ${timingFunction}`;
    }

    return finalStyle;
  }

  protected processChildren(): ReactNode[] {
    if (this._childFunction) {
      const result = this._childFunction();

      return Array.isArray(result) ? result : [result];
    }
    return this._children;
  }

  protected getChildFunction(): (() => ReactNode) | undefined {
    return this._childFunction;
  }

  abstract build(): ReactElement;
}

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;

type StyleBuilder<T> = T & {
  [K in KnownKeys<CSSProperties>]-?: (value: CSSProperties[K]) => StyleBuilder<T>;
};

export function createBuilder<T extends FiboBuilder, Args extends any[]>(
  BuilderClass: new (...args: Args) => T
): (...args: Args) => StyleBuilder<T> {
  return (...args: Args) => {
    const instance = new BuilderClass(...args);

    return new Proxy(instance, {
      get(target, prop, receiver) {
        if (prop === 'build') {
          return () => {
            const isObserver = (target as any)._isObserver;
            const signals = (target as any)._signals;
            const observers = (target as any)._observers;
            const state = (target as any)._state;
            const providers = (target as any)._providers;


            if (isObserver) {
              return React.createElement(Observer, {
                key: (target as any)._props.key,
                children: () => target.build()
              });
            }


            let element = target.build();

            // Wrap with AnimatedWrapper if there are animated props
            const animatedProps = (target as any)._animatedProps;
            const animationConfig = (target as any)._animationConfig;
            if (animatedProps && animatedProps.size > 0) {
              element = React.createElement(AnimatedWrapper, {
                animatedProps,
                animationConfig,
                children: element
              });
            }

            if (signals && signals.size > 0) {
              element = React.createElement(SignalWrapper, {
                signals: signals,
                children: element
              });
            }

            if (observers && observers.size > 0) {
              element = React.createElement(ObserverWrapper, {
                observables: observers,
                children: element
              });
            }

            if (state && state.size > 0) {
              element = React.createElement(StateWrapper, {
                stateMap: state,
                children: element
              });
            }

            if (providers && providers.size > 0) {
              element = React.createElement(ProviderWrapper, {
                providers: providers,
                children: element
              });
            }

            // Wrap with gesture if configured
            const gesture = (target as any)._gesture;
            if (gesture) {
              element = gesture.wrap(element);
            }

            return element;
          }
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
  subscribe?(listener: (val: T) => void): () => void;
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
  error?: (err: any) => ReactNode
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
  private _error?: (error: any) => ReactNode;
  private _builder?: (value: T) => ReactNode;

  constructor(private _signal: SignalLike<T>) { }

  loading(component: ReactNode | (() => ReactNode)): this {
    this._loading = typeof component === 'function' ? (component as () => ReactNode) : () => component;
    return this;
  }

  error(component: (error: any) => ReactNode): this {
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
