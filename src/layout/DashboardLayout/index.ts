import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

const DashboardLayoutInner = React.memo((props: any) => {
    const { sidebar, header, children, className, style, ...rest } = props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return React.createElement(
        'div',
        {
            className: `h-full w-full bg-[#0B0C15] overflow-hidden relative ${className || ''}`,
            style,
            ...rest
        },

        isMobileMenuOpen && React.createElement('div', {
            className: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
            onClick: () => setIsMobileMenuOpen(false)
        }),

        React.createElement('button', {
            className: 'lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-[#1A1B23] border border-white/10 text-white shadow-lg',
            onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen)
        },
            React.createElement('div', { className: isMobileMenuOpen ? 'i-heroicons-x-mark w-6 h-6' : 'i-heroicons-bars-3 w-6 h-6' })
        ),

        React.createElement(
            'div',
            {
                className: 'grid h-full w-full lg:grid-cols-[260px_1fr] transition-all duration-300'
            },

            React.createElement(
                'aside',
                {
                    className: `
                        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0B0C15] border-r border-white/5 transition-transform duration-300 transform
                        lg:relative lg:translate-x-0
                        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    `
                },
                sidebar
            ),

            React.createElement(
                'main',
                {
                    className: 'flex flex-col min-w-0 h-full overflow-hidden relative'
                },

                header && React.createElement('div', { className: 'flex-shrink-0' }, header),

                React.createElement(
                    'div',
                    { className: 'flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-0' },
                    children
                )
            )
        )
    );
});

class DashboardLayoutBuilder extends FiboBuilder {
    private _sidebar?: ReactNode;
    private _header?: ReactNode;

    sidebar(component: ReactNode): this {
        this._sidebar = component;
        return this;
    }

    header(component: ReactNode): this {
        this._header = component;
        return this;
    }

    build(): ReactElement {
        const props = {
            sidebar: this._sidebar,
            header: this._header,
            className: this.getClassName(),
            style: this.getStyle(),
            children: this.processChildren(),
            ...this._props
        };
        return React.createElement(DashboardLayoutInner, props);
    }
}

export const DashboardLayout = createBuilder(DashboardLayoutBuilder);
