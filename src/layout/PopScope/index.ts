'use client';

import React, { ReactElement, ReactNode, useEffect, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

function PopScopeView(props: {
  canPop?: boolean;
  onPop?: () => void;
  child?: FiboChild;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { canPop = true, onPop, child, className, style, ...rest } = props as typeof props &
    Record<string, unknown>;
  const canPopRef = useRef(canPop);
  const onPopRef = useRef(onPop);
  canPopRef.current = canPop;
  onPopRef.current = onPop;

  useEffect(() => {
    const marker = { fiboPopScope: `fibo-pop-${Math.random().toString(36).slice(2)}` };
    let restoring = false;

    window.history.pushState(marker, '');

    const onPopState = () => {
      if (canPopRef.current || restoring) return;
      restoring = true;
      try {
        window.history.pushState(marker, '');
        onPopRef.current?.();
      } finally {
        restoring = false;
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-pop-scope', className].filter(Boolean).join(' '),
      style,
    },
    buildChild(child) as ReactNode
  );
}

class PopScopeBuilder extends FiboBuilder {
  private _canPop = true;
  private _onPop?: () => void;
  private _child?: FiboChild;

  canPop(value: boolean): this {
    this._canPop = value;
    return this;
  }

  onPop(handler: () => void): this {
    this._onPop = handler;
    return this;
  }

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  build(): ReactElement {
    return React.createElement(PopScopeView, {
      canPop: this._canPop,
      onPop: this._onPop,
      child: this._child,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const PopScope = createBuilder(PopScopeBuilder);
