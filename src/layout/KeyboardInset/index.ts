'use client';

import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

/** Pixels the visual viewport lost to the keyboard. 0 when visualViewport is absent. */
export function readKeyboardInset(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0;
  const viewport = window.visualViewport;
  const diff = window.innerHeight - viewport.height - viewport.offsetTop;
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.round(diff);
}

function KeyboardInsetView(props: {
  child?: FiboChild;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { child, className, style, ...rest } = props as typeof props & Record<string, unknown>;
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const update = () => setInset(readKeyboardInset());
    update();
    const viewport = window.visualViewport;
    if (!viewport) return;
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-keyboard-inset', className].filter(Boolean).join(' '),
      style: { ...style, paddingBottom: `${inset}px` },
      'data-keyboard-inset': String(inset),
    },
    buildChild(child) as ReactNode
  );
}

class KeyboardInsetBuilder extends FiboBuilder {
  private _child?: FiboChild;

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  build(): ReactElement {
    return React.createElement(KeyboardInsetView, {
      child: this._child,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const KeyboardInset = createBuilder(KeyboardInsetBuilder);
