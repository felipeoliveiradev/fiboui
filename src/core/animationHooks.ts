'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';

export interface TransitionConfig {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export const Easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  elastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },
  bounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    else if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    else if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    else return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

export function useTransition(
  targetValue: number,
  config?: TransitionConfig
): number {
  const { duration = 300, delay = 0, easing = Easing.easeOut } = config || {};
  const [currentValue, setCurrentValue] = useState(targetValue);
  const cancelRef = useRef<number>();
  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  useEffect(() => {
    if (cancelRef.current) {
      cancelAnimationFrame(cancelRef.current);
    }

    let startTime: number | null = null;
    const startValue = valueRef.current;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        cancelRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const newValue = startValue + (targetValue - startValue) * easedProgress;

      setCurrentValue(newValue);

      if (progress < 1) {
        cancelRef.current = requestAnimationFrame(animate);
      }
    };

    cancelRef.current = requestAnimationFrame(animate);

    return () => {
      if (cancelRef.current) {
        cancelAnimationFrame(cancelRef.current);
      }
    };
  }, [targetValue, duration, delay]);

  return currentValue;
}

export function useSpring(
  targetValue: number,
  config?: SpringConfig
): number {
  const { stiffness = 170, damping = 26, mass = 1 } = config || {};
  const [currentValue, setCurrentValue] = useState(targetValue);
  const velocityRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    let value = currentValue;
    let velocity = velocityRef.current;

    const animate = () => {
      const springForce = -stiffness * (value - targetValue);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * (1 / 60);
      value += velocity * (1 / 60);

      setCurrentValue(value);
      velocityRef.current = velocity;

      if (Math.abs(velocity) > 0.01 || Math.abs(value - targetValue) > 0.01) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, stiffness, damping, mass]);

  return currentValue;
}

export function useMountTransition(
  isVisible: boolean,
  duration: number = 300
): { shouldRender: boolean; stage: 'entering' | 'entered' | 'exiting' | 'exited' } {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [stage, setStage] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isVisible ? 'entered' : 'exited'
  );

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setStage('entering');
      const timer = setTimeout(() => setStage('entered'), 50);
      return () => clearTimeout(timer);
    } else {
      setStage('exiting');
      const timer = setTimeout(() => {
        setStage('exited');
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  return { shouldRender, stage };
}

export function useStagger(count: number, delayBetween: number = 50): number[] {
  return Array.from({ length: count }, (_, i) => i * delayBetween);
}

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
}

/** Scroll position 0–1. Uses `scroll` / `resize` listeners — not rAF. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}
