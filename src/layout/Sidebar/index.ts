import React, { ReactElement } from 'react';
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
        const props = {
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



