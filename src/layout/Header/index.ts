import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

const HeaderInner = React.memo((props: any) => {
    const { height = 64, sticky, className, style, children, ...rest } = props;

    return React.createElement(
        'header',
        {
            className: `flex items-center px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md z-10 w-full ${sticky ? 'sticky top-0' : ''} ${className || ''}`,
            style: { height, minHeight: height, ...style },
            ...rest
        },
        children
    );
});

class HeaderBuilder extends FiboBuilder {
    private _height: number | string = 64;
    private _sticky: boolean = false;

    height(height: number | string): this {
        this._height = height;
        return this;
    }

    sticky(enable: boolean | number | string = true): this {
        if (enable === false) {
            this._sticky = false;
            return this;
        }
        this._sticky = true;
        if (enable !== true) {
            super.sticky(enable);
        }
        return this;
    }

    build(): ReactElement {
        const props = {
            height: this._height,
            sticky: this._sticky,
            className: this.getClassName(),
            style: this.getStyle(),
            children: this.processChildren(),
            ...this._props
        };
        return React.createElement(HeaderInner, props);
    }
}

export const Header = createBuilder(HeaderBuilder);
