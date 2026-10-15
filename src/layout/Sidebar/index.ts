import React, { ReactElement, ReactNode } from 'react';
import { PluginManager } from '../../core/plugin/PluginManager';
import { Icon } from '../../content/Icon';
import { Text } from '../../content/Text';
import { Row } from '../Row';
import { Link } from '../../navigation/Link';
import { useRouterOptional } from '../../navigation/RouterContext';
import { FiboBuilder, createBuilder } from '../../core/builder';

interface SidebarInnerProps {
  width?: number | string;
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const SidebarInner = React.memo((props: SidebarInnerProps) => {
    const { width = 260, collapsed, className, style, children, ...rest } = props;
    const router = useRouterOptional();
    // Never read `window` during render — server would be '' and the client
    // the real path (hydration mismatch). Pass a Router or accept ''.
    const currentPath = router?.currentPath ?? '';

    const currentWidth = collapsed ? 80 : width;
    const pluginItems = PluginManager.getInstance().getSidebarItems();

    const renderedPluginItems = pluginItems.map((item, index) => {
        const isActive = currentPath === item.path;
        return React.createElement(Link, {
            key: `plugin-item-${item.path || index}`,
            to: item.path,
            className: 'no-underline block mb-1',
            children: Row()
                .padding(12)
                .alignItems('center')
                .gap(12)
                .className(`
                    transition-colors duration-200 rounded-lg mx-2
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}
                `)
                .children([
                    item.icon ? Icon(item.icon).size(20).build() : null,
                    !collapsed ? Text(item.label).style({ fontSize: 14 }).weight(500).build() : null
                ].filter(Boolean))
                .build()
        });
    });

    return React.createElement(
        'aside',
        {
            className: `flex flex-col border-r border-gray-200 bg-white transition-all duration-300 h-full ${className || ''}`,
            style: { width: currentWidth, minWidth: currentWidth, ...style },
            ...rest
        },
        children,
        renderedPluginItems
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

    build(): ReactElement {
        const props: SidebarInnerProps = {
            width: this._width,
            collapsed: this._collapsed,
            className: this.getClassName(),
            style: this.getStyle(),
            children: this.processChildren(),
            ...this._props
        };
        return React.createElement(SidebarInner, props);
    }
}

export const Sidebar = createBuilder(SidebarBuilder);
