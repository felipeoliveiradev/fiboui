import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ProviderWrapper } from '../../core/StateWrapper';
import { PluginManager } from '../../core/plugin/PluginManager';

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
  overlays?: React.ReactNode[];
}

const ScaffoldInner = React.memo((props: ScaffoldConfig) => {
  const {
    theme,
    locale,
    providers = {},
    className,
    style,
    children,
    overlays = []
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

  const content = React.createElement(
    'div',
    {
      className: `fibo-scaffold ${className || ''}`,
      style: {
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // Ensure relative positioning for overlays
        ...style,
      },
    },
    [children, ...overlays]
  );

  if (allProviders.size > 0) {
    return React.createElement(
      ProviderWrapper,
      {
        providers: allProviders,
        children: content
      }
    );
  }

  return content;
});

export interface ScaffoldStructure {
  header?: {
    position?: 'static' | 'sticky' | 'fixed';
    height?: string | number;
    visible?: boolean;
  };
  footer?: {
    position?: 'static' | 'sticky' | 'fixed';
    height?: string | number;
    visible?: boolean;
  };
  sidebarLeft?: {
    behavior?: 'fixed' | 'scroll';
    mode?: 'side' | 'over';
    width?: string | number;
    visible?: boolean;
    fullHeight?: boolean;
  };
  sidebarRight?: {
    behavior?: 'fixed' | 'scroll';
    mode?: 'side' | 'over';
    width?: string | number;
    visible?: boolean;
    fullHeight?: boolean;
  };
}

class ScaffoldBuilder extends FiboBuilder {
  private _locale?: string;
  private _customProviders: Record<string, any> = {};
  private _structure: ScaffoldStructure = {};

  private _headerBar?: { content: React.ReactNode; fixed: boolean };
  private _footerBar?: { content: React.ReactNode; fixed: boolean };
  private _sideBarLeft?: { content: React.ReactNode; fixed: boolean };
  private _sideBarRight?: { content: React.ReactNode; fixed: boolean };

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

  structure(config: ScaffoldStructure): this {
    this._structure = { ...this._structure, ...config };
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
    const s = this._structure;

    const showHeader = this._headerBar && (s.header?.visible !== false);
    const showFooter = this._footerBar && (s.footer?.visible !== false);
    const showLeft = this._sideBarLeft && (s.sidebarLeft?.visible !== false);
    const showRight = this._sideBarRight && (s.sidebarRight?.visible !== false);

    const leftIsFull = showLeft && s.sidebarLeft?.fullHeight;
    const rightIsFull = showRight && s.sidebarRight?.fullHeight;

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

        (showLeft && !leftIsFull) && React.createElement('div', {
          key: 'sidebar-left',
          className: 'z-20',
          style: {
            width: s.sidebarLeft?.width,
            position: s.sidebarLeft?.mode === 'over' ? 'absolute' : (s.sidebarLeft?.behavior === 'fixed' || this._sideBarLeft!.fixed ? 'sticky' : undefined),
            top: (s.sidebarLeft?.behavior === 'fixed' || this._sideBarLeft!.fixed) ? 0 : undefined,
            height: (s.sidebarLeft?.behavior === 'fixed' || this._sideBarLeft!.fixed) ? '100%' : undefined,
            overflowY: 'auto',
            borderRight: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
          }
        }, this._sideBarLeft!.content),

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

        (showRight && !rightIsFull) && React.createElement('div', {
          key: 'sidebar-right',
          className: 'z-20',
          style: {
            width: s.sidebarRight?.width,
            position: s.sidebarRight?.mode === 'over' ? 'absolute' : (s.sidebarRight?.behavior === 'fixed' || this._sideBarRight!.fixed ? 'sticky' : undefined),
            top: (s.sidebarRight?.behavior === 'fixed' || this._sideBarRight!.fixed) ? 0 : undefined,
            height: (s.sidebarRight?.behavior === 'fixed' || this._sideBarRight!.fixed) ? '100%' : undefined,
            overflowY: 'auto',
            borderLeft: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
          }
        }, this._sideBarRight!.content),
      ].filter(Boolean)
    );

    const verticalStack = React.createElement(React.Fragment, null, [
      showHeader && React.createElement('div', {
        key: 'header-bar',
        className: 'z-30',
        style: {
          height: s.header?.height,
          position: s.header?.position || (this._headerBar!.fixed ? 'sticky' : 'static'),
          top: 0,
          backgroundColor: 'var(--fibo-surface, #ffffff)',
          zIndex: 30,
          borderBottom: '1px solid var(--fibo-outline, #e0e0e0)',
        }
      }, this._headerBar!.content),

      middleSection,

      showFooter && React.createElement('div', {
        key: 'footer-bar',
        className: 'z-30',
        style: {
          height: s.footer?.height,
          position: s.footer?.position || (this._footerBar!.fixed ? 'sticky' : 'static'),
          bottom: 0,
          backgroundColor: 'var(--fibo-surface, #ffffff)',
          zIndex: 30,
          borderTop: '1px solid var(--fibo-outline, #e0e0e0)',
        }
      }, this._footerBar!.content)
    ].filter(Boolean));

    let contentTree: ReactElement = React.createElement('div', {
      key: 'vertical-stack',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden'
      }
    }, verticalStack);

    if (leftIsFull) {
      contentTree = React.createElement('div', {
        key: 'full-height-left-wrapper',
        style: { display: 'flex', flexDirection: 'row', flex: 1, height: '100%', overflow: 'hidden' }
      }, [
        React.createElement('div', {
          key: 'sidebar-left-full',
          style: {
            width: s.sidebarLeft?.width,
            overflowY: 'auto',
            borderRight: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
            zIndex: 40
          }
        }, this._sideBarLeft!.content),
        contentTree
      ]);
    }

    if (rightIsFull) {
      contentTree = React.createElement('div', {
        key: 'full-height-right-wrapper',
        style: { display: 'flex', flexDirection: 'row', flex: 1, height: '100%', overflow: 'hidden' }
      }, [
        contentTree,
        React.createElement('div', {
          key: 'sidebar-right-full',
          style: {
            width: s.sidebarRight?.width,
            overflowY: 'auto',
            borderLeft: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
            zIndex: 40
          }
        }, this._sideBarRight!.content)
      ]);
    }

    // Fetch overlays from plugins
    const pluginOverlays = PluginManager.getInstance().getOverlays();
    const renderedOverlays = pluginOverlays.map((builder: any) => builder().build());

    const props: ScaffoldConfig = {
      theme: this._theme,
      locale: this._locale,
      providers: this._customProviders,
      className: this.getClassName(),
      style: this.getStyle(),
      children: contentTree,
      overlays: renderedOverlays,
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
