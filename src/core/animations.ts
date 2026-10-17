import { Signal } from './state';
import { resolveCssEase } from './easing';

export interface AnimationOptions {
  duration?: number;
  curve?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | string;
  damping?: number;
  stiffness?: number;
  velocity?: number;
  mass?: number;
  onComplete?: () => void;
}

const easingCurves: Record<string, (t: number) => number> = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

const rafIds = new WeakMap<object, number>();

function canUseAnimationFrame(): boolean {
  return typeof requestAnimationFrame === 'function';
}

function prefersReducedMotionNow(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function cancelTrackedFrame(owner: object): void {
  const prev = rafIds.get(owner);
  if (prev != null && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(prev);
  }
  rafIds.delete(owner);
}

declare module './state' {
  interface Signal<T> {
    spring(target: T, options?: Partial<AnimationOptions>): void;
    animate(target: T, options?: Partial<AnimationOptions>): void;
    snapTo(target: T, options?: Partial<AnimationOptions>): void;
  }
}

Signal.prototype.spring = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  this.animate(target, { ...options, curve: 'spring', damping: options.damping ?? 26, stiffness: options.stiffness ?? 170 });
};

Signal.prototype.animate = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  const start = this.value as number;
  const end = target as number;
  cancelTrackedFrame(this);

  if (!canUseAnimationFrame() || prefersReducedMotionNow()) {
    this.value = end as T;
    options.onComplete?.();
    return;
  }

  if (options.curve === 'spring') {
    const stiffness =
      typeof options.stiffness === 'number' && Number.isFinite(options.stiffness) && options.stiffness > 0
        ? options.stiffness
        : 170;
    const damping =
      typeof options.damping === 'number' && Number.isFinite(options.damping) && options.damping >= 0
        ? options.damping
        : 26;
    const mass =
      typeof options.mass === 'number' && Number.isFinite(options.mass) && options.mass > 0 ? options.mass : 1;
    let x = start;
    let v = typeof options.velocity === 'number' && Number.isFinite(options.velocity) ? options.velocity : 0;
    const dt = 1 / 60;
    const tick = () => {
      const force = -stiffness * (x - end) - damping * v;
      v += (force / mass) * dt;
      x += v * dt;
      if (!Number.isFinite(x) || !Number.isFinite(v)) {
        this.value = end as T;
        rafIds.delete(this);
        options.onComplete?.();
        return;
      }
      this.value = x as T;
      if (Math.abs(x - end) > 0.01 || Math.abs(v) > 0.01) {
        rafIds.set(this, requestAnimationFrame(tick));
      } else {
        this.value = end as T;
        rafIds.delete(this);
        options.onComplete?.();
      }
    };
    rafIds.set(this, requestAnimationFrame(tick));
    return;
  }

  const rawDuration = options.duration;
  const duration =
    typeof rawDuration === 'number' && Number.isFinite(rawDuration) && rawDuration > 0
      ? rawDuration
      : rawDuration === undefined
        ? 300
        : 0;
  if (duration === 0) {
    this.value = end as T;
    options.onComplete?.();
    return;
  }

  const curve = easingCurves[options.curve || 'easeOut'] ?? easingCurves.easeOut;
  let startTime: number | null = null;

  const tick = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    this.value = interpolate(start, end, curve(progress)) as T;
    if (progress < 1) {
      rafIds.set(this, requestAnimationFrame(tick));
    } else {
      rafIds.delete(this);
      options.onComplete?.();
    }
  };

  rafIds.set(this, requestAnimationFrame(tick));
};

Signal.prototype.snapTo = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  this.animate(target, { duration: 300, curve: 'easeOut', ...options });
};

export function cssCurve(options: Partial<AnimationOptions> = {}): string {
  return resolveCssEase(options.curve ?? 'easeOut', {
    stiffness: options.stiffness,
    damping: options.damping,
    mass: options.mass,
  });
}

export { };
