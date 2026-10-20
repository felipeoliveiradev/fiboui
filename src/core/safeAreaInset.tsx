'use client';

import React, { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { buildChild } from './children';
import { Edge } from './swiftuiEnums';
import type { FiboChild } from './types';

export type SafeAreaInsetEdge = Edge | 'top' | 'bottom' | 'leading' | 'trailing' | 'left' | 'right';

export type SafeAreaInsetSpec = {
  edge: SafeAreaInsetEdge;
  content: FiboChild | (() => FiboChild);
  /** Gap between inset bar and content. Default 0. */
  spacing?: number;
};

function resolveEdge(edge: SafeAreaInsetEdge): 'top' | 'bottom' | 'left' | 'right' {
  switch (edge as string) {
    case Edge.leading:
    case 'leading':
    case 'left':
      return 'left';
    case Edge.trailing:
    case 'trailing':
    case 'right':
      return 'right';
    case Edge.top:
    case 'top':
      return 'top';
    default:
      return 'bottom';
  }
}

function resolveContent(content: SafeAreaInsetSpec['content']): ReactNode {
  const raw = typeof content === 'function' ? content() : content;
  return buildChild(raw);
}

/**
 * SwiftUI `.safeAreaInset(edge:)` — reserves a bar on one edge; content fills the rest.
 * Does **not** replace `SafeArea` (pad for notch) or `GeometryProxy.safeAreaInsets` (read).
 */
export function wrapSafeAreaInset(
  child: ReactElement,
  spec: SafeAreaInsetSpec
): ReactElement {
  const edge = resolveEdge(spec.edge);
  const vertical = edge === 'top' || edge === 'bottom';
  const bar = resolveContent(spec.content);
  const gap = spec.spacing ?? 0;

  const hostStyle: CSSProperties = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    minWidth: 0,
    minHeight: 0,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    gap: gap > 0 ? gap : undefined,
  };

  const bodyStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  const barStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    // Sit inside the physical safe area when on top/bottom.
    ...(edge === 'top'
      ? { paddingTop: 'env(safe-area-inset-top, 0px)' }
      : edge === 'bottom'
        ? { paddingBottom: 'env(safe-area-inset-bottom, 0px)' }
        : edge === 'left'
          ? { paddingLeft: 'env(safe-area-inset-left, 0px)' }
          : { paddingRight: 'env(safe-area-inset-right, 0px)' }),
  };

  const body = React.createElement(
    'div',
    { className: 'fibo-safe-area-inset-body', style: bodyStyle },
    child
  );
  const inset = React.createElement(
    'div',
    {
      className: 'fibo-safe-area-inset-bar',
      'data-fibo-inset-edge': edge,
      style: barStyle,
    },
    bar
  );

  const kids =
    edge === 'top' || edge === 'left' ? [inset, body] : [body, inset];

  return React.createElement(
    'div',
    {
      className: 'fibo-safe-area-inset',
      'data-fibo-safe-area-inset': edge,
      style: hostStyle,
    },
    ...kids
  );
}
