'use client';

import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

export type LayoutSize = { width: number; height: number };

const ZERO_SIZE: LayoutSize = { width: 0, height: 0 };

function readHostSize(node: HTMLElement | null): LayoutSize {
  if (!node) return ZERO_SIZE;
  const rect = node.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function LayoutView(props: {
  builder?: (size: LayoutSize) => unknown;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { builder, className, style, ...rest } = props as typeof props & Record<string, unknown>;
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<LayoutSize>(ZERO_SIZE);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    const measure = () => setSize(readHostSize(node));
    measure();

    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const produced = builder ? builder(size) : null;

  return React.createElement(
    'div',
    {
      ...rest,
      ref: hostRef,
      className: ['fibo-layout-builder', className].filter(Boolean).join(' '),
      style,
      'data-layout-width': size.width,
      'data-layout-height': size.height,
    },
    buildChild(produced) as ReactNode
  );
}

class LayoutBuilderBuilder extends FiboBuilder {
  private _builder?: (size: LayoutSize) => unknown;

  builder(fn: (size: LayoutSize) => unknown): this {
    this._builder = fn;
    return this;
  }

  build(): ReactElement {
    return React.createElement(LayoutView, {
      builder: this._builder,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const LayoutBuilder = createBuilder(LayoutBuilderBuilder);
