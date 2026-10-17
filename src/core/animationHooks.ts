'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { pageScrollProgress } from './scroll';

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

function finitePositive(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function finiteNonNegative(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function finiteNumber(value: number, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
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
  const reduce = usePrefersReducedMotion();
  const { duration: durationOpt = 300, delay: delayOpt = 0, easing = Easing.easeOut } = config || {};
  const duration = finitePositive(durationOpt, 0);
  const delay = finiteNonNegative(delayOpt, 0);
  const [currentValue, setCurrentValue] = useState(() => finiteNumber(targetValue));
  const cancelRef = useRef<number>();
  const valueRef = useRef(currentValue);
  valueRef.current = currentValue;

  useEffect(() => {
    if (cancelRef.current) {
      cancelAnimationFrame(cancelRef.current);
    }

    if (reduce || !Number.isFinite(targetValue) || duration <= 0) {
      if (Number.isFinite(targetValue)) setCurrentValue(targetValue);
      return;
    }

    let startTime: number | null = null;
    const startValue = Number.isFinite(valueRef.current) ? valueRef.current : targetValue;
    let cancelled = false;

    const animate = (timestamp: number) => {
      if (cancelled) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        cancelRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(Number.isFinite(progress) ? progress : 1);
      const newValue = startValue + (targetValue - startValue) * easedProgress;

      if (!Number.isFinite(newValue)) {
        setCurrentValue(targetValue);
        return;
      }

      setCurrentValue(newValue);

      if (progress < 1) {
        cancelRef.current = requestAnimationFrame(animate);
      }
    };

    cancelRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      if (cancelRef.current) {
        cancelAnimationFrame(cancelRef.current);
      }
    };
  }, [targetValue, duration, delay, reduce]);

  if (reduce) return Number.isFinite(targetValue) ? targetValue : currentValue;
  return currentValue;
}

export function useSpring(
  targetValue: number,
  config?: SpringConfig
): number {
  const reduce = usePrefersReducedMotion();
  const stiffness = finitePositive(config?.stiffness, 170);
  const damping = finiteNonNegative(config?.damping, 26);
  const mass = finitePositive(config?.mass, 1);
  const [currentValue, setCurrentValue] = useState(() => finiteNumber(targetValue));
  const velocityRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (reduce || !Number.isFinite(targetValue)) {
      if (Number.isFinite(targetValue)) setCurrentValue(targetValue);
      velocityRef.current = 0;
      return;
    }

    let value = Number.isFinite(currentValue) ? currentValue : targetValue;
    let velocity = Number.isFinite(velocityRef.current) ? velocityRef.current : 0;
    let cancelled = false;

    const animate = () => {
      if (cancelled) return;
      const springForce = -stiffness * (value - targetValue);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * (1 / 60);
      value += velocity * (1 / 60);

      if (!Number.isFinite(value) || !Number.isFinite(velocity)) {
        setCurrentValue(targetValue);
        velocityRef.current = 0;
        return;
      }

      setCurrentValue(value);
      velocityRef.current = velocity;

      if (Math.abs(velocity) > 0.01 || Math.abs(value - targetValue) > 0.01) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, stiffness, damping, mass, reduce]);

  if (reduce) return Number.isFinite(targetValue) ? targetValue : currentValue;
  return currentValue;
}

export function useMountTransition(
  isVisible: boolean,
  duration: number = 300
): { shouldRender: boolean; stage: 'entering' | 'entered' | 'exiting' | 'exited' } {
  const reduce = usePrefersReducedMotion();
  const dur = finiteNonNegative(duration, 300);
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [stage, setStage] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isVisible ? 'entered' : 'exited'
  );
  const prevVisible = useRef<boolean | null>(null);

  useEffect(() => {
    if (reduce) {
      setShouldRender(isVisible);
      setStage(isVisible ? 'entered' : 'exited');
      prevVisible.current = isVisible;
      return;
    }

    const prev = prevVisible.current;
    prevVisible.current = isVisible;

    // Keep the initial stage. Re-running enter/exit on mount (or when
    // `duration` changes) flashes CSS even when visibility did not change.
    if (prev === null || prev === isVisible) {
      return;
    }

    if (isVisible) {
      setShouldRender(true);
      setStage('entering');
      const timer = setTimeout(() => setStage('entered'), 50);
      return () => clearTimeout(timer);
    }

    setStage('exiting');
    const timer = setTimeout(() => {
      setStage('exited');
      setShouldRender(false);
    }, dur);
    return () => clearTimeout(timer);
  }, [isVisible, dur, reduce]);

  if (reduce) {
    return { shouldRender: isVisible, stage: isVisible ? 'entered' : 'exited' };
  }
  return { shouldRender, stage };
}

export function useStagger(count: number, delayBetween: number = 50): number[] {
  return Array.from({ length: count }, (_, i) => i * delayBetween);
}

export function subscribePrefersReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

export function getPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotion,
    () => false
  );
}

/** Scroll position 0–1. Uses `scroll` / `resize` listeners — not rAF. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const update = () => {
      setProgress(pageScrollProgress());
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
