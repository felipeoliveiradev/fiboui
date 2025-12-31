import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { ResponsiveStyles } from './types';
import { Observable, Signal } from './state';
import { Observer } from './StateWrapper';
import clsx from 'clsx';

import { cssToTailwind } from '@metagptx/css-to-tailwind';

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



  id(value: string): this {
    this._props.id = value;
    return this;
  }

  key(value: string | number): this {
    this._props.key = value;
    return this;
  }

  paddingHorizontal(value: string | number): this {
    if (typeof value === 'number') {
      this._classNames.push(`px-[${value}px]`);
    } else {
      this._classNames.push(`px-${value}`);
    }
    return this;
  }

  paddingVertical(value: string | number): this {
    if (typeof value === 'number') {
      this._classNames.push(`py-[${value}px]`);
    } else {
      this._classNames.push(`py-${value}`);
    }
    return this;
  }



  marginHorizontal(value: string | number): this {
    if (typeof value === 'number') {
      this._classNames.push(`mx-[${value}px]`);
    } else {
      this._classNames.push(`mx-${value}`);
    }
    return this;
  }

  marginVertical(value: string | number): this {
    if (typeof value === 'number') {
      this._classNames.push(`my-[${value}px]`);
    } else {
      this._classNames.push(`my-${value}`);
    }
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







  responsive(styles: ResponsiveStyles): this {
    this._responsive = styles;
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

  
  observer(): this {
    this._isObserver = true;
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

  
  protected hasStateManagement(): boolean {
    return (
      this._state.size > 0 ||
      this._providers.size > 0 ||
      this._observers.size > 0 ||
      this._signals.size > 0 ||
      this._isObserver
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
        this._children = []; // Clear static children
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

    return finalStyle;
  }

  protected processChildren(): ReactNode[] {
    if (this._childFunction) {
        const result = this._childFunction();
        // Ensure result is an array for consistent consumption by subclasses using ...children
        return Array.isArray(result) ? result : [result]; 
    }
    return this._children;
  }
  
  protected getChildFunction(): (() => ReactNode) | undefined {
      return this._childFunction;
  }

  abstract build(): ReactElement;
}

type StyleBuilder<T> = T & {
  [K in keyof CSSProperties]-?: (value: CSSProperties[K]) => StyleBuilder<T>;
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
                 // Check if this builder instance is marked as an observer
                 // Accessing protected/private members via casting
                 const isObserver = (target as any)._isObserver;
                 if (isObserver) {
                     return React.createElement(Observer, {
                         children: () => target.build()
                     });
                 }
                 
                 // Normal build
                 return target.build();
             }
        }

        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }
        
        return (value: any) => {
          target.css({ [prop]: value });
          return receiver;
        };
      },
    }) as StyleBuilder<T>;
  };
}
