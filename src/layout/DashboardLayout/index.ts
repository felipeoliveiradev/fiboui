'use client';

import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import type { FiboChild, FiboChildren } from '../../core/types';

const DRAWER_ID = 'fibo-dashboard-sidebar';

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

function resolveInterpTree(node: ReactNode): ReactNode {
    if (Array.isArray(node)) return node.map(resolveInterpChild);
    return resolveInterpChild(node);
}

const DashboardLayoutInner = React.memo((props: any) => {
    const { sidebar, header, children, className, style, ...rest } = props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMobileMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isMobileMenuOpen]);

    return React.createElement(
        'div',
        {
            className: `fibo-dashboard h-full w-full bg-[#0B0C15] overflow-hidden relative ${className || ''}`,
            style,
            ...rest
        },

        isMobileMenuOpen && React.createElement('div', {
            className: 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
            'aria-hidden': true,
            onClick: () => setIsMobileMenuOpen(false)
        }),

        React.createElement('button', {
            type: 'button',
            className: 'lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-[#1A1B23] border border-white/10 text-white shadow-lg',
            'aria-label': isMobileMenuOpen ? 'Close menu' : 'Open menu',
            'aria-expanded': isMobileMenuOpen,
            'aria-controls': DRAWER_ID,
            onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen)
        },
            React.createElement('div', {
                className: isMobileMenuOpen ? 'i-heroicons-x-mark w-6 h-6' : 'i-heroicons-bars-3 w-6 h-6',
                'aria-hidden': true
            })
        ),

        React.createElement(
            'div',
            {
                className: 'grid h-full w-full min-h-0 lg:grid-cols-[260px_1fr] transition-all duration-300'
            },

            React.createElement(
                'aside',
                {
                    id: DRAWER_ID,
                    'aria-label': 'Sidebar',
                    className: [
                        'fibo-dashboard-drawer fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0B0C15] border-r border-white/5 transition-transform duration-300 transform',
                        'lg:relative lg:translate-x-0 lg:visible lg:pointer-events-auto',
                        isMobileMenuOpen
                            ? 'translate-x-0 visible shadow-2xl'
                            : '-translate-x-full invisible pointer-events-none',
                    ].join(' ')
                },
                resolveInterpTree(sidebar)
            ),

            React.createElement(
                'main',
                {
                    className: 'flex flex-col min-w-0 min-h-0 h-full overflow-hidden relative'
                },

                header && React.createElement('div', { className: 'flex-shrink-0' }, resolveInterpTree(header)),

                React.createElement(
                    'div',
                    { className: 'fibo-dashboard-body flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 lg:p-0' },
                    resolveInterpTree(children)
                )
            )
        )
    );
});

class DashboardLayoutBuilder extends FiboBuilder {
    private _sidebar?: ReactNode;
    private _header?: ReactNode;

    children(children: FiboChildren): this {
        bindInterpTree(this, children);
        return super.children(children);
    }

    props(value: Record<string, any>): this {
        if (value) {
            if ('children' in value) bindInterpTree(this, value.children);
            if ('sidebar' in value) bindInterpTree(this, value.sidebar);
            if ('header' in value) bindInterpTree(this, value.header);
        }
        return super.props(value);
    }

    sidebar(component: FiboChild): this {
        bindInterpTree(this, component);
        this._sidebar = buildChild(component);
        return this;
    }

    header(component: FiboChild): this {
        bindInterpTree(this, component);
        this._header = buildChild(component);
        return this;
    }

    build(): ReactElement {
        const {
            sidebar: propsSidebar,
            header: propsHeader,
            children: propsChildren,
            className: extraClass,
            style: extraStyle,
            ...dom
        } = this._props ?? {};

        const fromBuilder = this.processChildren();
        const children = propsChildren !== undefined ? propsChildren : fromBuilder;

        const props = {
            ...dom,
            sidebar: this._sidebar ?? (propsSidebar !== undefined ? buildChild(propsSidebar) : undefined),
            header: this._header ?? (propsHeader !== undefined ? buildChild(propsHeader) : undefined),
            className: [this.getClassName(), extraClass].filter(Boolean).join(' '),
            style: extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle(),
            children,
        };
        return React.createElement(DashboardLayoutInner, props);
    }
}

export const DashboardLayout = createBuilder(DashboardLayoutBuilder);
