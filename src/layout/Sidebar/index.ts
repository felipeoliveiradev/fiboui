'use client';

import React, { MouseEvent, ReactElement, ReactNode } from 'react';
import { PluginManager } from '../../core/plugin/PluginManager';
import { Icon } from '../../content/Icon';
import { Text } from '../../content/Text';
import { Row } from '../Row';
import { useRouterOptional } from '../../navigation/RouterContext';
import { joinBasename } from '../../navigation/Router';
import { matchPath } from '../../navigation/routeMatching';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { isDangerousUrl, isNativeHref } from '../../core/safeUrl';

interface SidebarInnerProps {
  width?: number | string;
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
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

/** Pathname only (`to` may carry ?query/#hash). Same as Link. */
function pathnameOf(to: string): string {
  const raw = typeof to === 'string' ? to.trim() : '';
  const path = raw.split(/[?#]/, 1)[0];
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function pluginItemIsActive(currentPath: string, to: string): boolean {
  if (isDangerousUrl(to) || isNativeHref(to)) return false;
  const target = pathnameOf(to);
  const here = pathnameOf(currentPath);
  // Prefix `/` would mark every route active.
  if (target === '/') return here === '/';
  return matchPath(here, target, false).match;
}

function isCssIconClass(icon: string): boolean {
  return !/^(https?:)?\/\//i.test(icon) && !icon.startsWith('/') && !icon.startsWith('data:');
}

function pluginIcon(icon: unknown, size: number): ReactNode {
  if (!icon) return null;
  if (typeof icon === 'string' && isCssIconClass(icon)) {
    return React.createElement('span', {
      className: icon,
      style: { width: size, height: size, display: 'inline-block', flexShrink: 0 },
      'aria-hidden': true,
    });
  }
  return Icon(icon as any).size(size).build();
}

function hostNodes(children: ReactNode | undefined): ReactNode[] {
  if (children == null) return [];
  return Array.isArray(children) ? children : [children];
}

const SidebarNavLink = ({
  to,
  className,
  children,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabel,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
  'aria-label'?: string;
}) => {
  const router = useRouterOptional();
  const dangerous = isDangerousUrl(to);
  const native = !dangerous && isNativeHref(to);
  const href = dangerous
    ? undefined
    : native
      ? to.trim()
      : joinBasename(router?.basename ?? '', to);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dangerous) {
      event.preventDefault();
      return;
    }
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (native) return;
    if (!router) return;
    event.preventDefault();
    router.navigate(to);
  };

  return React.createElement(
    'a',
    {
      href,
      className,
      onClick: handleClick,
      'aria-current': ariaCurrent,
      'aria-label': ariaLabel,
    },
    children
  );
};

const SidebarInner = React.memo((props: SidebarInnerProps) => {
    const { width = 260, collapsed, className, style, children, ...rest } = props;
    const router = useRouterOptional();
    // Never read `window` during render — server would be '' and the client
    // the real path (hydration mismatch). Pass a Router or accept ''.
    const currentPath = router?.currentPath ?? '';

    const currentWidth = collapsed ? 80 : width;
    const pluginItems = PluginManager.getInstance().getSidebarItems();
    const nodes = hostNodes(children).map(resolveInterpChild);

    const renderedPluginItems = pluginItems.map((item, index) => {
        const isActive = pluginItemIsActive(currentPath, item.path);
        return React.createElement(SidebarNavLink, {
            key: `plugin-item-${item.path || index}`,
            to: item.path,
            className: 'no-underline block mb-1',
            'aria-current': isActive ? 'page' : undefined,
            'aria-label': item.label,
            children: Row()
                .padding(12)
                .alignItems('center')
                .gap(12)
                .className(`
                    transition-colors duration-200 rounded-lg mx-2
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}
                `)
                .children([
                    pluginIcon(item.icon, 20),
                    !collapsed ? Text(item.label).style({ fontSize: 14 }).weight(500).build() : null
                ].filter(Boolean))
                .build()
        });
    });

    return React.createElement(
        'nav',
        {
            'aria-label': 'Sidebar',
            className: `fibo-sidebar flex flex-col border-r border-gray-200 bg-white transition-all duration-300 h-full min-h-0 min-w-0 ${className || ''}`,
            style: {
                minHeight: 0,
                overflowX: 'hidden',
                overflowY: 'auto',
                flexShrink: 0,
                ...style,
                width: currentWidth,
                minWidth: currentWidth,
            },
            ...rest
        },
        ...nodes,
        ...renderedPluginItems
    );
});

class SidebarBuilder extends FiboBuilder {
    private _width: number | string = 260;
    private _collapsed: boolean = false;

    width(width: number | string): this {
        this._width = width;
        return this;
    }

    collapsible(collapsed: boolean = false): this {
        this._collapsed = collapsed;
        return this;
    }

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

    build(): ReactElement {
        const {
            children: propsChildren,
            className: extraClass,
            style: extraStyle,
            ...rest
        } = this._props as {
            children?: ReactNode;
            className?: string;
            style?: React.CSSProperties;
            [key: string]: unknown;
        };
        const fromBuilder = this.processChildren();
        const children = propsChildren !== undefined ? propsChildren : fromBuilder;
        const className = [this.getClassName(), extraClass].filter(Boolean).join(' ');
        const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();
        const props: SidebarInnerProps = {
            ...rest,
            width: this._width,
            collapsed: this._collapsed,
            className,
            style,
            children,
        };
        return React.createElement(SidebarInner, props);
    }
}

export const Sidebar = createBuilder(SidebarBuilder);
