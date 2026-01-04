import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ProviderWrapper } from '../../core/StateWrapper';

interface LayoutBarConfig {
  fixed?: boolean;
  children: React.ReactNode[];
}

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

  private _headerBar?: { content: React.ReactNode; fixed: boolean };
  private _footerBar?: { content: React.ReactNode; fixed: boolean };
  private _sideBarLeft?: { content: React.ReactNode; fixed: boolean };
  private _sideBarRight?: { content: React.ReactNode; fixed: boolean };

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

  headerBar(config: React.ReactNode | LayoutBarConfig): this {
    if (this._isLayoutBarConfig(config)) {
      const children = Array.isArray(config.children) ? config.children : [config.children];
      const processedChildren = children.map(child =>
        (child as any).build ? (child as any).build() : child
      );
      this._headerBar = {
        content: React.createElement(React.Fragment, null, processedChildren),
        fixed: config.fixed ?? false
      };
    } else {
      this._headerBar = {
        content: (config as any).build ? (config as any).build() : config,
        fixed: false
      };
    }
    return this;
  }

  footerBar(config: React.ReactNode | LayoutBarConfig): this {
    if (this._isLayoutBarConfig(config)) {
      const children = Array.isArray(config.children) ? config.children : [config.children];
      const processedChildren = children.map(child =>
        (child as any).build ? (child as any).build() : child
      );
      this._footerBar = {
        content: React.createElement(React.Fragment, null, processedChildren),
        fixed: config.fixed ?? false
      };
    } else {
      this._footerBar = {
        content: (config as any).build ? (config as any).build() : config,
        fixed: false
      };
    }
    return this;
  }

  sideBarLeft(config: React.ReactNode | LayoutBarConfig): this {
    if (this._isLayoutBarConfig(config)) {
      const children = Array.isArray(config.children) ? config.children : [config.children];
      const processedChildren = children.map(child =>
        (child as any).build ? (child as any).build() : child
      );
      this._sideBarLeft = {
        content: React.createElement(React.Fragment, null, processedChildren),
        fixed: config.fixed ?? false
      };
    } else {
      this._sideBarLeft = {
        content: (config as any).build ? (config as any).build() : config,
        fixed: false
      };
    }
    return this;
  }

  sideBarRight(config: React.ReactNode | LayoutBarConfig): this {
    if (this._isLayoutBarConfig(config)) {
      const children = Array.isArray(config.children) ? config.children : [config.children];
      const processedChildren = children.map(child =>
        (child as any).build ? (child as any).build() : child
      );
      this._sideBarRight = {
        content: React.createElement(React.Fragment, null, processedChildren),
        fixed: config.fixed ?? false
      };
    } else {
      this._sideBarRight = {
        content: (config as any).build ? (config as any).build() : config,
        fixed: false
      };
    }
    return this;
  }

  private _isLayoutBarConfig(value: any): value is LayoutBarConfig {
    return value && typeof value === 'object' && 'children' in value && !React.isValidElement(value);
  }

  build(): ReactElement {
    const mainContent = this.processChildren();

    const middleSection = React.createElement(
      'div',
      {
        key: 'scaffold-middle',
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          position: 'relative'
        }
      },
      [
        this._sideBarLeft && React.createElement('div', {
          key: 'sidebar-left',
          className: 'z-20',
          style: this._sideBarLeft.fixed ? {
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
          } : undefined
        }, this._sideBarLeft.content),
        React.createElement('main', {
          key: 'scaffold-body',
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            position: 'relative'
          }
        }, mainContent),
        this._sideBarRight && React.createElement('div', {
          key: 'sidebar-right',
          className: 'z-20',
          style: this._sideBarRight.fixed ? {
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
          } : undefined
        }, this._sideBarRight.content),
      ].filter(Boolean)
    );

    const scaffoldContent = React.createElement(React.Fragment, null, [
      this._headerBar && React.createElement('div', {
        key: 'header-bar',
        className: 'z-30',
        style: this._headerBar.fixed ? {
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 30
        } : undefined
      }, this._headerBar.content),
      middleSection,
      this._footerBar && React.createElement('div', {
        key: 'footer-bar',
        className: 'z-30',
        style: this._footerBar.fixed ? {
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 30
        } : undefined
      }, this._footerBar.content)
    ].filter(Boolean));

    const props: ScaffoldConfig = {
      theme: this._theme,
      locale: this._locale,
      providers: this._customProviders,
      className: this.getClassName(),
      style: this.getStyle(),
      children: scaffoldContent,
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
