'use client';

import React, { ReactElement, ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import type { MotionPreset } from './motionCss';
import { ensureMotionCss } from './styleManager';
import { normalizePreset } from './motionCss';
import { FiboBuilder, createBuilder } from './builder';
import type { BindableSignal } from './state';
import {
  getPrefersReducedMotion,
  subscribePrefersReducedMotion,
} from './animationHooks';

export type PresenceShow = boolean | BindableSignal<boolean>;

export interface PresenceProps {
  show: PresenceShow;
  enter?: MotionPreset | string;
  exit?: MotionPreset | string;
  duration?: number;
  reducedMotion?: 'reduce' | 'never';
  children?: ReactNode;
}

function isBindableSignal(value: unknown): value is BindableSignal<boolean> {
  return (
    !!value &&
    typeof value === 'object' &&
    'value' in value &&
    typeof (value as BindableSignal<boolean>).subscribe === 'function'
  );
}

export function isPresenceProps(value: unknown): value is PresenceProps {
  if (!value || typeof value !== 'object') return false;
  if (isBindableSignal(value)) return false;
  return Object.prototype.hasOwnProperty.call(value, 'show');
}

function useHydrateSafeReducedMotion(): boolean {
  return useSyncExternalStore(subscribePrefersReducedMotion, getPrefersReducedMotion, () => false);
}

function resolveShow(show: PresenceShow): boolean {
  return isBindableSignal(show) ? Boolean(show.value) : Boolean(show);
}

function finiteDuration(ms: number | undefined, fallback = 200): number {
  return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 ? ms : fallback;
}

function presetOrUndefined(name: string | undefined): MotionPreset | undefined {
  if (!name) return undefined;
  try {
    return normalizePreset(name);
  } catch {
    return undefined;
  }
}

function useShow(show: PresenceShow): boolean {
  const [value, setValue] = useState(() => resolveShow(show));

  useEffect(() => {
    if (!isBindableSignal(show)) {
      setValue(Boolean(show));
      return;
    }
    setValue(Boolean(show.value));
    return show.subscribe((next) => setValue(Boolean(next)));
  }, [show]);

  return isBindableSignal(show) ? value : Boolean(show);
}

/** Keep children mounted through enter/exit keyframes. Uses `animationend`, not rAF. */
export function PresenceHost({
  show,
  enter = 'fadeIn',
  exit = 'fadeOut',
  duration = 200,
  reducedMotion = 'reduce',
  children,
}: PresenceProps) {
  const visible = useShow(show);
  const [mounted, setMounted] = useState(visible);
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>(visible ? 'enter' : 'idle');
  const forceMotion = reducedMotion === 'never';
  const osReduce = useHydrateSafeReducedMotion();
  const reduce = !forceMotion && osReduce;
  const dur = finiteDuration(duration);

  useEffect(() => {
    ensureMotionCss();
    if (visible) {
      setMounted(true);
      setPhase(reduce ? 'idle' : 'enter');
      return;
    }
    if (!mounted) return;
    if (reduce) {
      setMounted(false);
      setPhase('idle');
      return;
    }
    setPhase('exit');
  }, [visible, reduce]);

  useEffect(() => {
    if (phase !== 'exit' || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), dur + 50);
    return () => window.clearTimeout(timer);
  }, [phase, mounted, dur]);

  if (!mounted) return null;

  const presetName = phase === 'exit' ? exit : phase === 'enter' ? enter : undefined;
  const preset = presetName && !reduce ? presetOrUndefined(presetName) : undefined;
  const expectedAnim = preset ? `fibo-${preset}` : undefined;
  const className = [
    preset ? `fibo-anim fibo-anim-${preset}` : '',
    forceMotion ? 'fibo-motion-force' : '',
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return React.createElement(
    'div',
    {
      className,
      style: preset
        ? ({ '--fibo-dur': `${dur}ms`, '--fibo-ease': 'ease' } as React.CSSProperties)
        : undefined,
      'data-fibo-presence': phase,
      onAnimationEnd: (event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;
        const native = event.nativeEvent as { animationName?: string } | undefined;
        const name = event.animationName || native?.animationName;
        if (name && expectedAnim && name !== expectedAnim) return;
        if (phase === 'exit') setMounted(false);
        if (phase === 'enter') setPhase('idle');
      },
    },
    children
  );
}

class PresenceBuilder extends FiboBuilder {
  private _show: PresenceShow = true;
  private _enter: string = 'fadeIn';
  private _exit: string = 'fadeOut';

  constructor(show: PresenceShow = true) {
    super();
    this.show(show);
  }

  show(value: PresenceShow): this {
    this._show = value;
    if (isBindableSignal(value)) {
      this.bindSignal(value);
      this.observer();
    }
    return this;
  }

  enter(preset: MotionPreset | string): this {
    this._enter = preset;
    return this;
  }

  exit(preset: MotionPreset | string): this {
    this._exit = preset;
    return this;
  }

  duration(ms: number): this {
    this._transitionDuration = ms;
    return this;
  }

  build(): ReactElement {
    return React.createElement(PresenceHost, {
      show: this._show,
      enter: this._enter,
      exit: this._exit,
      duration: this._transitionDuration,
      reducedMotion: this._reducedMotion,
      children: this.processChildren(),
    });
  }
}

const presenceBuilder = createBuilder(PresenceBuilder);

export function Presence(show?: PresenceShow): ReturnType<typeof presenceBuilder>;
export function Presence(props: PresenceProps): ReactElement;
export function Presence(
  arg?: PresenceShow | PresenceProps
): ReturnType<typeof presenceBuilder> | ReactElement {
  if (isPresenceProps(arg)) {
    return React.createElement(PresenceHost, arg);
  }
  return presenceBuilder(arg ?? true);
}

Presence.displayName = 'Presence';
