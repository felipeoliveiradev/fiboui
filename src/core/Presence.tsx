import React, { ReactNode, useEffect, useState } from 'react';
import type { MotionPreset } from './motionCss';
import { ensureMotionCss } from './styleManager';
import { normalizePreset } from './motionCss';

export interface PresenceProps {
  show: boolean;
  enter?: MotionPreset | string;
  exit?: MotionPreset | string;
  duration?: number;
  children?: ReactNode;
}

/** Keep children mounted through enter/exit keyframes. Uses `animationend`, not rAF. */
export function Presence({
  show,
  enter = 'fadeIn',
  exit = 'fadeOut',
  duration = 280,
  children,
}: PresenceProps) {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>(show ? 'enter' : 'idle');

  useEffect(() => {
    ensureMotionCss();
    if (show) {
      setMounted(true);
      setPhase('enter');
      return;
    }
    if (mounted) setPhase('exit');
  }, [show]);

  if (!mounted) return null;

  const presetName = phase === 'exit' ? exit : phase === 'enter' ? enter : undefined;
  const preset = presetName ? normalizePreset(presetName) : undefined;

  return React.createElement(
    'div',
    {
      className: preset ? `fibo-anim fibo-anim-${preset}` : undefined,
      style: preset
        ? ({ '--fibo-dur': `${duration}ms`, '--fibo-ease': 'ease' } as React.CSSProperties)
        : undefined,
      'data-fibo-presence': phase,
      onAnimationEnd: (event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        if (phase === 'exit') setMounted(false);
        if (phase === 'enter') setPhase('idle');
      },
    },
    children
  );
}
