'use client';

import React, { ReactElement, ReactNode, useCallback, useMemo, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

/** Proxy passed to `ScrollViewReader` builder — SwiftUI `ScrollViewProxy`. */
export type ScrollViewProxy = {
  /** Scroll the nearest ancestor scroller so `[data-scroll-id=id]` is visible. */
  scrollTo: (id: string, options?: ScrollIntoViewOptions) => void;
};

function ScrollViewReaderView(props: {
  builder?: (proxy: ScrollViewProxy) => unknown;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { builder, className, style, ...rest } = props as typeof props & Record<string, unknown>;
  const hostRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((id: string, options?: ScrollIntoViewOptions) => {
    const host = hostRef.current;
    if (!host || typeof document === 'undefined') return;
    const safe =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(id)
        : id.replace(/"/g, '\\"');
    const target = host.querySelector(`[data-scroll-id="${safe}"]`) as HTMLElement | null;
    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
      ...options,
    });
  }, []);

  const proxy = useMemo<ScrollViewProxy>(() => ({ scrollTo }), [scrollTo]);
  const produced = builder ? builder(proxy) : null;

  return React.createElement(
    'div',
    {
      ...rest,
      ref: hostRef,
      className: ['fibo-scroll-view-reader', className].filter(Boolean).join(' '),
      style,
    },
    buildChild(produced) as ReactNode
  );
}

class ScrollViewReaderBuilder extends FiboBuilder {
  private _builder?: (proxy: ScrollViewProxy) => unknown;

  builder(fn: (proxy: ScrollViewProxy) => unknown): this {
    this._builder = fn;
    return this;
  }

  build(): ReactElement {
    return React.createElement(ScrollViewReaderView, {
      builder: this._builder,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

/**
 * SwiftUI `ScrollViewReader` — wrap a ScrollView; call `proxy.scrollTo(id)`
 * for children marked with `.scrollTarget(id)`.
 *
 * ```ts
 * ScrollViewReader().builder((proxy) =>
 *   Column().children(
 *     Button('Go').onPress(() => proxy.scrollTo('row-3')),
 *     ScrollView().children(
 *       Text('A').scrollTarget('row-1'),
 *       Text('C').scrollTarget('row-3'),
 *     )
 *   )
 * )
 * ```
 */
export const ScrollViewReader = createBuilder(ScrollViewReaderBuilder);
