import React, { ReactNode, useEffect, useState } from 'react';
import type { MotionPreset } from './types';
import { ensureMotionCss } from './sheet';
import { compileMotion, specFromPreset } from './compile';

export interface PresenceProps {
  show: boolean;
  exit?: MotionPreset;
  duration?: number;
  children?: ReactNode;
}

/**
 * Keep children mounted through an exit keyframe. Uses `animationend`, not rAF.
 */
export function Presence({ show, exit = 'fadeOut', duration = 280, children }: PresenceProps) {
  const [mounted, setMounted] = useState(show);

  useEffect(() => {
    ensureMotionCss();
    if (show) setMounted(true);
  }, [show]);

  if (!mounted) return null;

  const exiting = !show;
  const compiled = compileMotion(specFromPreset(exit, { duration }));

  return React.createElement(
    'div',
    {
      className: exiting ? compiled.className : undefined,
      style: exiting ? compiled.style : undefined,
      'data-fibo-presence': exiting ? 'exit' : 'enter',
      onAnimationEnd: (event: React.AnimationEvent<HTMLDivElement>) => {
        if (exiting && event.target === event.currentTarget) {
          setMounted(false);
        }
      },
    },
    children
  );
}
