'use client';

import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import {
  measureCoordinateSpace,
  registerCoordinateSpace,
} from '../../core/coordinateSpace';
import { CoordinateSpace } from '../../core/swiftuiEnums';

export type LayoutSize = { width: number; height: number };

/** SwiftUI-ish safe-area insets (CSS env when available). */
export type EdgeInsets = {
  top: number;
  bottom: number;
  leading: number;
  trailing: number;
};

/**
 * SwiftUI `GeometryProxy` — size + safe-area + local / global / named frames.
 */
export type GeometryProxy = LayoutSize & {
  size: LayoutSize;
  safeAreaInsets: EdgeInsets;
  /** Frame in `local` | `global` | `CoordinateSpace.named('foo')`. */
  frame: (inSpace?: 'local' | 'global' | string) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const ZERO_SIZE: LayoutSize = { width: 0, height: 0 };
const ZERO_INSETS: EdgeInsets = { top: 0, bottom: 0, leading: 0, trailing: 0 };

/**
 * Resolve `env(safe-area-inset-*)` via a real padded probe.
 * `getPropertyValue('env(...)')` on `:root` is usually empty in browsers.
 */
function readSafeAreaInsets(): EdgeInsets {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return ZERO_INSETS;
  }
  try {
    const probe = document.createElement('div');
    probe.setAttribute('data-fibo-safe-area-probe', '1');
    probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;' +
      'padding-top:env(safe-area-inset-top,0px);' +
      'padding-right:env(safe-area-inset-right,0px);' +
      'padding-bottom:env(safe-area-inset-bottom,0px);' +
      'padding-left:env(safe-area-inset-left,0px);';
    document.documentElement.appendChild(probe);
    const style = getComputedStyle(probe);
    const num = (v: string) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };
    const insets: EdgeInsets = {
      top: num(style.paddingTop),
      bottom: num(style.paddingBottom),
      leading: num(style.paddingLeft),
      trailing: num(style.paddingRight),
    };
    probe.remove();
    return insets;
  } catch {
    return ZERO_INSETS;
  }
}

function readHostSize(node: HTMLElement | null): LayoutSize {
  if (!node) return ZERO_SIZE;
  const rect = node.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function makeProxy(node: HTMLElement | null, size: LayoutSize): GeometryProxy {
  const rect = node?.getBoundingClientRect();
  const local = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  };
  const global = rect
    ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    : local;
  return {
    width: size.width,
    height: size.height,
    size,
    safeAreaInsets: readSafeAreaInsets(),
    frame(inSpace: 'local' | 'global' | string = 'local') {
      if (inSpace === 'global' || inSpace === CoordinateSpace.global) return { ...global };
      if (inSpace === 'local' || inSpace === CoordinateSpace.local) return { ...local };
      const named = measureCoordinateSpace(inSpace);
      if (named) return { ...named };
      // Named space missing → local (SwiftUI falls back similarly in practice).
      return { ...local };
    },
  };
}

function LayoutView(props: {
  builder?: (proxy: GeometryProxy) => unknown;
  coordinateSpace?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { builder, coordinateSpace, className, style, ...rest } = props as typeof props &
    Record<string, unknown>;
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<LayoutSize>(ZERO_SIZE);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    const measure = () => setSize(readHostSize(node));
    measure();

    const spaceName =
      typeof coordinateSpace === 'string' && coordinateSpace.length > 0
        ? coordinateSpace.replace(/^named:/, '')
        : undefined;
    const unregister = spaceName
      ? registerCoordinateSpace(spaceName, () => {
          const r = node.getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height };
        })
      : undefined;

    if (typeof ResizeObserver !== 'function') {
      return () => unregister?.();
    }
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => {
      observer.disconnect();
      unregister?.();
    };
  }, [coordinateSpace]);

  const proxy = makeProxy(hostRef.current, size);
  const produced = builder ? builder(proxy) : null;

  return React.createElement(
    'div',
    {
      ...rest,
      ref: hostRef,
      className: ['fibo-layout-builder', className].filter(Boolean).join(' '),
      style,
      'data-layout-width': size.width,
      'data-layout-height': size.height,
      'data-coordinate-space': coordinateSpace ?? undefined,
    },
    buildChild(produced) as ReactNode
  );
}

class LayoutBuilderBuilder extends FiboBuilder {
  private _builder?: (proxy: GeometryProxy) => unknown;
  private _coordinateSpace?: string;

  builder(fn: (proxy: GeometryProxy) => unknown): this {
    this._builder = fn;
    return this;
  }

  /** Publish this reader as `CoordinateSpace.named(name)`. */
  coordinateSpace(name: string): this {
    this._coordinateSpace = name.startsWith('named:') ? name.slice(6) : name;
    return this;
  }

  build(): ReactElement {
    return React.createElement(LayoutView, {
      builder: this._builder,
      coordinateSpace: this._coordinateSpace,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const LayoutBuilder = createBuilder(LayoutBuilderBuilder);

/** SwiftUI `GeometryReader` — same as {@link LayoutBuilder}, receives {@link GeometryProxy}. */
export const GeometryReader = LayoutBuilder;
