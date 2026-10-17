'use client';

import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

const PORTRAIT_QUERY = '(orientation: portrait)';

type MediaQueryListLike = {
  matches: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

/**
 * Portrait when `matchMedia` is missing (jsdom) or the portrait query matches.
 */
export function readPortraitOrientation(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

function subscribeOrientation(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const media = window.matchMedia(PORTRAIT_QUERY) as MediaQueryListLike;
  const listener = () => onChange();
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }
  media.addListener?.(listener);
  return () => media.removeListener?.(listener);
}

function OrientationView(props: {
  portrait?: FiboChild;
  landscape?: FiboChild;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { portrait, landscape, className, style, ...rest } = props as typeof props & Record<string, unknown>;
  const [portraitMode, setPortraitMode] = useState(readPortraitOrientation);

  useEffect(() => {
    setPortraitMode(readPortraitOrientation());
    return subscribeOrientation(() => setPortraitMode(readPortraitOrientation()));
  }, []);

  const branch = portraitMode ? portrait : landscape;
  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-orientation', className].filter(Boolean).join(' '),
      style,
      'data-orientation': portraitMode ? 'portrait' : 'landscape',
    },
    buildChild(branch) as ReactNode
  );
}

class OrientationBuilderBuilder extends FiboBuilder {
  private _portrait?: FiboChild;
  private _landscape?: FiboChild;

  portrait(node: FiboChild): this {
    this._portrait = node;
    return this;
  }

  landscape(node: FiboChild): this {
    this._landscape = node;
    return this;
  }

  build(): ReactElement {
    return React.createElement(OrientationView, {
      portrait: this._portrait,
      landscape: this._landscape,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const OrientationBuilder = createBuilder(OrientationBuilderBuilder);
