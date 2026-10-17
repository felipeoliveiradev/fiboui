'use client';

import React, { ReactElement, useEffect, useRef } from 'react';
import { ensureMotionCss } from './styleManager';
import { pageScrollProgress, supportsScrollTimeline } from './scroll';

export interface ScrollProgressProps {
  children: ReactElement;
}

/** Binds `--fibo-progress` from scroll when `animation-timeline: scroll()` is missing. No rAF. */
export function ScrollProgress({ children }: ScrollProgressProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMotionCss();
    if (supportsScrollTimeline()) return;
    const bind = () => {
      const node =
        (hostRef.current?.querySelector('.fibo-scroll-progress') as HTMLElement | null) ??
        (hostRef.current?.firstElementChild as HTMLElement | null);
      return node;
    };
    const update = () => {
      const node = bind();
      if (!node) return;
      node.style.setProperty('--fibo-progress', String(pageScrollProgress()));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return React.createElement(
    'div',
    { ref: hostRef, 'data-fibo-scroll-progress': '1', style: { display: 'contents' } },
    children
  );
}

export function bindScrollProgress(node: HTMLElement | null): () => void {
  if (!node || typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }
  const update = () => {
    node.style.setProperty('--fibo-progress', String(pageScrollProgress()));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}
