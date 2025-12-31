import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ProviderWrapper } from '../../core/StateWrapper';



interface ScaffoldConfig {
  theme?: any;
  locale?: string;
  providers?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const ScaffoldInner = React.memo((props: ScaffoldConfig) => {
  const {
    theme,
    locale,
    providers = {},
    className,
    style,
    children,
  } = props;

  
  const allProviders = new Map<string, any>();

  
  if (theme) {
    allProviders.set('theme', theme);
  }

  
  if (locale) {
    allProviders.set('locale', locale);
  }

  
  Object.entries(providers).forEach(([key, value]) => {
    allProviders.set(key, value);
  });

  
  if (allProviders.size > 0) {
    return React.createElement(
      ProviderWrapper,
      { 
        providers: allProviders,
        children: React.createElement(
          'div',
          {
            className: `fibo-scaffold ${className || ''}`,
            style: {
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              ...style,
            },
          },
          children
        )
      }
    );
  }

  
  return React.createElement(
    'div',
    {
      className: `fibo-scaffold ${className || ''}`,
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      },
    },
    children
  );
});

class ScaffoldBuilder extends FiboBuilder {
  private _theme?: any;
  private _locale?: string;
  private _customProviders: Record<string, any> = {};

  
  theme(theme: any): this {
    this._theme = theme;
    return this;
  }

  
  locale(locale: string): this {
    this._locale = locale;
    return this;
  }

  
  providers(providers: Record<string, any>): this {
    this._customProviders = { ...this._customProviders, ...providers };
    return this;
  }

  
  provider(key: string, value: any): this {
    this._customProviders[key] = value;
    return this;
  }

  build(): ReactElement {
    const props: ScaffoldConfig = {
      theme: this._theme,
      locale: this._locale,
      providers: this._customProviders,
      className: this.getClassName(),
      style: this.getStyle(),
      children: this.processChildren(),
    };

    return React.createElement(ScaffoldInner, props);
  }
}


export const Scaffold = createBuilder(ScaffoldBuilder);

export interface ScaffoldProps {
  theme?: any;
  locale?: string;
  providers?: Record<string, any>;
}
