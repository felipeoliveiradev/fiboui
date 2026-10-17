'use client';

import React, { ReactElement, ReactNode, useEffect, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

/** m/s² change that counts as a shake. */
export const SHAKE_ACCELERATION_THRESHOLD = 20;

/** Quiet period after a shake so one gesture fires once. */
export const SHAKE_GESTURE_GAP_MS = 500;

export interface AccelerationSample {
  x?: number | null;
  y?: number | null;
  z?: number | null;
}

function axis(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Euclidean change between two acceleration samples.
 * The first sample (no previous reading) is 0 so a lone event is not a shake.
 */
export function accelerationDelta(
  current: AccelerationSample | null | undefined,
  previous: AccelerationSample | null | undefined,
): number {
  if (!current || !previous) return 0;
  const dx = axis(current.x) - axis(previous.x);
  const dy = axis(current.y) - axis(previous.y);
  const dz = axis(current.z) - axis(previous.z);
  return Math.hypot(dx, dy, dz);
}

/** True when the acceleration change is strictly above the shake threshold. */
export function exceedsShakeThreshold(
  delta: number,
  threshold = SHAKE_ACCELERATION_THRESHOLD,
): boolean {
  return delta > threshold;
}

/** Acceleration from a devicemotion event, including a plain Event used in tests. */
export function accelerationFromEvent(event: Event): AccelerationSample | null {
  const motion = event as Event & {
    acceleration?: AccelerationSample | null;
    accelerationIncludingGravity?: AccelerationSample | null;
  };
  return motion.acceleration ?? motion.accelerationIncludingGravity ?? null;
}

function ShakeView(props: {
  onShake?: () => void;
  child?: FiboChild;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { onShake, child, className, style, ...rest } = props as typeof props &
    Record<string, unknown>;
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let previous: AccelerationSample | null = null;
    let ignoreUntil = 0;

    const onMotion = (event: Event) => {
      const sample = accelerationFromEvent(event);
      const delta = accelerationDelta(sample, previous);
      if (sample) previous = sample;
      if (!exceedsShakeThreshold(delta)) return;
      const now = Date.now();
      if (now < ignoreUntil) return;
      ignoreUntil = now + SHAKE_GESTURE_GAP_MS;
      onShakeRef.current?.();
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, []);

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-shake', className].filter(Boolean).join(' '),
      style,
    },
    buildChild(child) as ReactNode,
  );
}

class ShakeBuilder extends FiboBuilder {
  private _onShake?: () => void;
  private _child?: FiboChild;

  onShake(callback: () => void): this {
    this._onShake = callback;
    return this;
  }

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  build(): ReactElement {
    return React.createElement(ShakeView, {
      onShake: this._onShake,
      child: this._child,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const Shake = createBuilder(ShakeBuilder);
