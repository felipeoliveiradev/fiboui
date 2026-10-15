import React, { ReactNode, useEffect, useRef } from 'react';
import { ensureMotionCss } from './styleManager';
import { supportsViewTimeline } from './scroll';

export interface RevealProps {
  preset?: string;
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
  forceMotion?: boolean;
  preferTimeline?: boolean;
  children?: ReactNode;
}

/** IntersectionObserver toggles `.fibo-inview`. Motion is CSS — no rAF. */
export function Reveal({
  preset = 'fadeUp',
  once = true,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.12,
  forceMotion = false,
  preferTimeline = false,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMotionCss();
    const node = ref.current;
    if (!node) return;
    if (preferTimeline && supportsViewTimeline()) {
      node.classList.add('fibo-inview');
      return;
    }
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
  }, [once, rootMargin, threshold, preferTimeline]);

  const className = [
    'fibo-reveal',
    `fibo-reveal-${preset}`,
    // Contain wide children: wrapper is a flex/grid item without min-width:0 otherwise
    'min-w-0',
    'max-w-full',
    'w-full',
    forceMotion ? 'fibo-motion-force' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement('div', { ref, className, 'data-fibo-reveal': preset }, children);
}
