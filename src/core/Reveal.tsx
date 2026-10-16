'use client';

import React, { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { ensureMotionCss } from './styleManager';

export interface RevealProps {
  preset?: string;
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
  forceMotion?: boolean;
  /** @deprecated Ignored — view-timeline never skips IO (was forcing fibo-inview on load). */
  preferTimeline?: boolean;
  /** CSS vars (`--fibo-dur`, `--fibo-ease`, `--fibo-delay`) for the reveal wrapper. */
  style?: CSSProperties;
  children?: ReactNode;
}

/** IntersectionObserver toggles `.fibo-inview`. Motion is CSS — no rAF. */
export function Reveal({
  preset = 'fadeUp',
  once = true,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.12,
  forceMotion = false,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMotionCss();
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('fibo-inview');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fibo-inview');
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('fibo-inview');
          }
        }
      },
      { rootMargin, threshold }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  const className = [
    'fibo-reveal',
    `fibo-reveal-${preset}`,
    // min-w-0 only — do NOT force w-full (breaks horizontal ScrollView / carousel slides)
    'min-w-0',
    forceMotion ? 'fibo-motion-force' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(
    'div',
    { ref, className, style, 'data-fibo-reveal': preset },
    children,
  );
}
