'use client';

import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { PluginManager } from '../../core/plugin/PluginManager';
import { buildChild, normalizeFiboChildren } from '../../core/children';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import type { FiboChild, FiboChildren } from '../../core/types';
import { ScaffoldInner } from './ScaffoldInner';
import type { FabAt, ScaffoldConfig } from './host';

interface LayoutBarConfig {
  fixed?: boolean;
  children: FiboChildren;
}

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

const chromeNoShrink: React.CSSProperties = { flexShrink: 0 };

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

  private _headerBar?: FiboChild | LayoutBarConfig;
  private _footerBar?: FiboChild | LayoutBarConfig;
  private _sideBarLeft?: FiboChild | LayoutBarConfig;
  private _sideBarRight?: FiboChild | LayoutBarConfig;
  private _drawer?: FiboChild;
  private _endDrawer?: FiboChild;
  private _drawerWidth = 280;
  private _fab?: FiboChild;
  private _fabAt: FabAt = 'end';
  private _bottomSheet?: FiboChild;
  private _footerButtons?: FiboChildren;
  private _extendBody = false;
  private _extendBehindHeader = false;
  private _avoidKeyboard = true;
  private _onDrawer?: (side: 'start' | 'end', open: boolean) => void;

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
    }
    return super.props(value);
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

  structure(config: ScaffoldStructure): this {
    this._structure = { ...this._structure, ...config };
    return this;
  }

  headerBar(config: FiboChild | LayoutBarConfig): this {
    this._bindBar(config);
    this._headerBar = config;
    return this;
  }

  /** Flutter `Scaffold.appBar`. Same slot as `.headerBar()`. */
  appBar(config: FiboChild | LayoutBarConfig): this {
    return this.headerBar(config);
  }

  footerBar(config: FiboChild | LayoutBarConfig): this {
    this._bindBar(config);
    this._footerBar = config;
    return this;
  }

  sideBarLeft(config: FiboChild | LayoutBarConfig): this {
    this._bindBar(config);
    this._sideBarLeft = config;
    return this;
  }

  sideBarRight(config: FiboChild | LayoutBarConfig): this {
    this._bindBar(config);
    this._sideBarRight = config;
    return this;
  }

  /** Flutter drawer. Starts closed. Open it with `useScaffold().openDrawer()`. */
  drawer(child: FiboChild): this {
    this._bindBar(child);
    this._drawer = child;
    return this;
  }

  /** Flutter endDrawer. */
  endDrawer(child: FiboChild): this {
    this._bindBar(child);
    this._endDrawer = child;
    return this;
  }

  drawerWidth(px: number): this {
    this._drawerWidth = px;
    return this;
  }

  /** Flutter floatingActionButton. */
  fab(child: FiboChild): this {
    this._bindBar(child);
    this._fab = child;
    return this;
  }

  /** Where the button sits. Dock locations overlap the footer. */
  fabAt(location: FabAt): this {
    this._fabAt = location;
    return this;
  }

  /** Flutter bottomSheet. Hidden until `useScaffold().showSheet()`. */
  bottomSheet(child: FiboChild): this {
    this._bindBar(child);
    this._bottomSheet = child;
    return this;
  }

  /** Flutter persistentFooterButtons. */
  footerButtons(children: FiboChildren): this {
    this._bindBar(children as FiboChild);
    this._footerButtons = children;
    return this;
  }

  /** Body draws under the footer. */
  extendBody(on = true): this {
    this._extendBody = on;
    return this;
  }

  /** Body draws under the header. */
  extendBehindHeader(on = true): this {
    this._extendBehindHeader = on;
    return this;
  }

  /** Lift the page above the keyboard. On by default. */
  avoidKeyboard(on = true): this {
    this._avoidKeyboard = on;
    return this;
  }

  onDrawer(handler: (side: 'start' | 'end', open: boolean) => void): this {
    this._onDrawer = handler;
    return this;
  }

  private _bindBar(config: FiboChild | LayoutBarConfig): void {
    if (this._isLayoutBarConfig(config)) {
      bindInterpTree(this, config.children);
      return;
    }
    bindInterpTree(this, config);
  }

  private _normalizeBar(config: FiboChild | LayoutBarConfig): { content: React.ReactNode; fixed: boolean } {
    if (this._isLayoutBarConfig(config)) {
      return {
        content: React.createElement(
          React.Fragment,
          null,
          ...normalizeFiboChildren(config.children).map(resolveInterpChild),
        ),
        fixed: config.fixed ?? false
      };
    }
    return {
      content: resolveInterpChild(buildChild(config)),
      fixed: false
    };
  }

  private _isLayoutBarConfig(value: unknown): value is LayoutBarConfig {
    if (!value || typeof value !== 'object' || React.isValidElement(value)) {
      return false;
    }
    if ('build' in value && typeof (value as { build?: unknown }).build === 'function') {
      return false;
    }
    return 'children' in value && !('type' in value);
  }

  build(): ReactElement {
    const {
      children: propsChildren,
      className: extraClass,
      style: extraStyle,
      overlays: _propsOverlays,
      theme: _propsTheme,
      locale: _propsLocale,
      providers: _propsProviders,
      ...restProps
    } = this._props;

    const rawBody =
      propsChildren !== undefined
        ? normalizeFiboChildren(propsChildren as FiboChildren)
        : this.processChildren();
    const mainContent = rawBody.map(resolveInterpChild);

    const headerBar = this._headerBar ? this._normalizeBar(this._headerBar) : undefined;
    const footerBar = this._footerBar ? this._normalizeBar(this._footerBar) : undefined;
    const leftBar = this._sideBarLeft ? this._normalizeBar(this._sideBarLeft) : undefined;
    const rightBar = this._sideBarRight ? this._normalizeBar(this._sideBarRight) : undefined;

    const s = this._structure;

    const showHeader = headerBar && (s.header?.visible !== false);
    const showFooter = footerBar && (s.footer?.visible !== false);
    const showLeft = leftBar && (s.sidebarLeft?.visible !== false);
    const showRight = rightBar && (s.sidebarRight?.visible !== false);

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
          position: 'relative',
          minWidth: '0px',
          minHeight: '0px',
        }
      },
      [

        (showLeft && !leftIsFull) && React.createElement('div', {
          key: 'sidebar-left',
          className: 'z-20',
          style: {
            width: s.sidebarLeft?.width,
            position: s.sidebarLeft?.mode === 'over' ? 'absolute' : (s.sidebarLeft?.behavior === 'fixed' || leftBar!.fixed ? 'sticky' : undefined),
            top: (s.sidebarLeft?.mode === 'over' || s.sidebarLeft?.behavior === 'fixed' || leftBar!.fixed) ? 0 : undefined,
            left: s.sidebarLeft?.mode === 'over' ? '0px' : undefined,
            height: (s.sidebarLeft?.mode === 'over' || s.sidebarLeft?.behavior === 'fixed' || leftBar!.fixed) ? '100%' : undefined,
            zIndex: s.sidebarLeft?.mode === 'over' ? 20 : undefined,
            overflowY: 'auto',
            borderRight: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
            ...chromeNoShrink,
          }
        }, leftBar!.content),

        React.createElement('main', {
          key: 'scaffold-body',
          className: 'fibo-scaffold-body',
          style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            position: 'relative',
            zIndex: 0,
            minWidth: '0px',
            minHeight: '0px',
          }
        }, mainContent),

        (showRight && !rightIsFull) && React.createElement('div', {
          key: 'sidebar-right',
          className: 'z-20',
          style: {
            width: s.sidebarRight?.width,
            position: s.sidebarRight?.mode === 'over' ? 'absolute' : (s.sidebarRight?.behavior === 'fixed' || rightBar!.fixed ? 'sticky' : undefined),
            top: (s.sidebarRight?.mode === 'over' || s.sidebarRight?.behavior === 'fixed' || rightBar!.fixed) ? 0 : undefined,
            right: s.sidebarRight?.mode === 'over' ? '0px' : undefined,
            height: (s.sidebarRight?.mode === 'over' || s.sidebarRight?.behavior === 'fixed' || rightBar!.fixed) ? '100%' : undefined,
            zIndex: s.sidebarRight?.mode === 'over' ? 20 : undefined,
            overflowY: 'auto',
            borderLeft: '1px solid var(--fibo-outline, #e0e0e0)',
            backgroundColor: 'var(--fibo-surface, #ffffff)',
            ...chromeNoShrink,
          }
        }, rightBar!.content),
      ].filter(Boolean)
    );

    const headerNode = showHeader && React.createElement('div', {
      key: 'header-bar',
      className: 'z-30 fibo-scaffold-header',
      style: {
        height: s.header?.height,
        position: this._extendBehindHeader
          ? 'absolute'
          : s.header?.position || (headerBar!.fixed ? 'sticky' : 'static'),
        top: 0,
        left: this._extendBehindHeader ? 0 : undefined,
        right: this._extendBehindHeader ? 0 : undefined,
        zIndex: 30,
        ...chromeNoShrink,
      }
    }, headerBar!.content);

    const footerNode = showFooter && React.createElement('div', {
      key: 'footer-bar',
      className: 'z-30 fibo-scaffold-footer',
      style: {
        height: s.footer?.height,
        position: s.footer?.position || (footerBar!.fixed ? 'sticky' : 'static'),
        zIndex: 30,
        ...chromeNoShrink,
      }
    }, footerBar!.content);

    const isDock = this._fabAt === 'startDock' || this._fabAt === 'centerDock' || this._fabAt === 'endDock';
    const fabNode = this._fab
      ? React.createElement(
          'div',
          {
            key: 'scaffold-fab',
            className: `fibo-scaffold-fab fibo-fab-${this._fabAt}`,
            'data-scaffold-fab': this._fabAt,
          },
          resolveInterpChild(buildChild(this._fab)),
        )
      : null;

    const sheetNode = this._bottomSheet
      ? React.createElement(
          'div',
          {
            key: 'scaffold-sheet',
            className: 'fibo-scaffold-sheet',
            'data-scaffold-sheet': 'true',
            hidden: true,
          },
          resolveInterpChild(buildChild(this._bottomSheet)),
        )
      : null;

    const buttonNode = this._footerButtons
      ? React.createElement(
          'div',
          { key: 'footer-buttons', className: 'fibo-scaffold-footer-buttons' },
          ...normalizeFiboChildren(this._footerButtons).map(resolveInterpChild),
        )
      : null;

    const drawerPane = (side: 'start' | 'end', child?: FiboChild) =>
      child
        ? React.createElement(
            'div',
            {
              key: `drawer-${side}`,
              className: 'fibo-scaffold-drawer',
              'data-scaffold-drawer': side,
              'data-open': 'false',
              role: 'dialog',
              'aria-hidden': true,
              tabIndex: -1,
              style: { width: this._drawerWidth },
            },
            resolveInterpChild(buildChild(child)),
          )
        : null;

    const bottomNode =
      sheetNode || buttonNode || footerNode || (isDock && fabNode)
        ? React.createElement(
            'div',
            { key: 'scaffold-bottom', className: 'fibo-scaffold-bottom' },
            [sheetNode, buttonNode, footerNode, isDock ? fabNode : null].filter(Boolean),
          )
        : null;

    const verticalStack = React.createElement(React.Fragment, null, [
      headerNode,
      middleSection,
      bottomNode,
      (this._drawer || this._endDrawer) && React.createElement('div', {
        key: 'scaffold-scrim',
        className: 'fibo-scaffold-scrim',
        'data-scaffold-scrim': 'true',
        'data-open': 'false',
      }),
      drawerPane('start', this._drawer),
      drawerPane('end', this._endDrawer),
      this._drawer && React.createElement('div', {
        key: 'edge-start',
        className: 'fibo-scaffold-edge fibo-scaffold-edge-start',
        'data-scaffold-edge': 'start',
      }),
      this._endDrawer && React.createElement('div', {
        key: 'edge-end',
        className: 'fibo-scaffold-edge fibo-scaffold-edge-end',
        'data-scaffold-edge': 'end',
      }),
      !isDock ? fabNode : null,
      React.createElement('div', {
        key: 'scaffold-snack',
        className: 'fibo-scaffold-snack',
        'data-scaffold-snack': 'true',
        role: 'status',
        'aria-live': 'polite',
      }),
    ].filter(Boolean));

    let contentTree: ReactElement = React.createElement('div', {
      key: 'vertical-stack',
      className: 'fibo-scaffold-stack',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
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
            zIndex: 40,
            ...chromeNoShrink,
          }
        }, leftBar!.content),
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
            zIndex: 40,
            ...chromeNoShrink,
          }
        }, rightBar!.content)
      ]);
    }

    const pluginOverlays = PluginManager.getInstance().getOverlays();
    const renderedOverlays = pluginOverlays.map((builder: any, index: number) => {
      const node = builder().build();
      if (React.isValidElement(node) && node.key != null && node.key !== '') {
        return node;
      }
      return React.createElement(React.Fragment, { key: `fibo-overlay-${index}` }, node);
    });

    const props: ScaffoldConfig = {
      theme: this._theme,
      locale: this._locale,
      providers: this._customProviders,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' '),
      style: extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle(),
      children: contentTree,
      overlays: renderedOverlays,
      extendBody: this._extendBody,
      extendBehindHeader: this._extendBehindHeader,
      avoidKeyboard: this._avoidKeyboard,
      onDrawerChanged: this._onDrawer,
      ...restProps,
    };

    return React.createElement(ScaffoldInner, props);
  }
}

export const Scaffold = createBuilder(ScaffoldBuilder);

export { useScaffold } from './behavior';
export type { FabAt } from './host';
export type { ScaffoldHandle, SnackAction } from './behavior';

export interface ScaffoldProps {
  theme?: any;
  locale?: string;
  providers?: Record<string, any>;
}
