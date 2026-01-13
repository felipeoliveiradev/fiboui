import React, { ReactElement } from 'react';
import { PluginManager } from '../../core/plugin/PluginManager';
import { Icon } from '../../content/Icon';
import { Text } from '../../content/Text';
import { Row } from '../Row';
import { Link } from '../../navigation/Link';
import { FiboBuilder, createBuilder } from '../../core/builder';

const SidebarInner = React.memo((props: any) => {
    const { width = 260, collapsed, className, style, children, ...rest } = props;

    const currentWidth = collapsed ? 80 : width;

    return React.createElement(
        'aside',
        {
            className: `flex flex-col border-r border-gray-200 bg-white transition-all duration-300 h-full ${className || ''}`,
            style: { width: currentWidth, minWidth: currentWidth, ...style },
            ...rest
        },
        children
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
        // Get items from plugins
        const pluginItems = PluginManager.getInstance().getSidebarItems();

        let children = this.processChildren();

        // If we have plugin items, we append them
        if (pluginItems.length > 0) {
            const renderedPluginItems = pluginItems.map((item, index) => {
                // Determine if active
                const isActive = typeof window !== 'undefined' ? window.location.pathname === item.path : false;

                return React.createElement(Link, {
                    key: `plugin-item-${index}`,
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
                            !this._collapsed ? Text(item.label).style({ fontSize: 14 }).weight(500).build() : null
                        ].filter(Boolean))
                        .build()
                });
            });

            // We wrap plugin items in a container to separate them
            // Or just append them. Let's append them for now.
            // If children is an array, we push.
            if (Array.isArray(children)) {
                children = [...children, ...renderedPluginItems];
            } else {
                children = [children, ...renderedPluginItems];
            }
        }

        const props = {
            width: this._width,
            collapsed: this._collapsed,
            className: this.getClassName(),
            style: this.getStyle(),
            children: children,
            ...this._props
        };
        return React.createElement(SidebarInner, props);
    }
}

export const Sidebar = createBuilder(SidebarBuilder);
