import { Signal } from './state';

export interface AnimationOptions {
  duration?: number;
  curve?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
  damping?: number;
  stiffness?: number;
  velocity?: number;
  onComplete?: () => void;
}

// Easing functions
const easingCurves = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  spring: (t: number) => {
    // Simple spring approximation
    return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 5);
  }
};

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

// Extend Signal prototype
declare module './state' {
  interface Signal<T> {
    spring(target: T, options?: Partial<AnimationOptions>): void;
    animate(target: T, options?: Partial<AnimationOptions>): void;
    snapTo(target: T, options?: Partial<AnimationOptions>): void;
  }
}

Signal.prototype.spring = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  this.animate(target, { ...options, curve: 'spring', damping: options.damping || 0.7 });
};

Signal.prototype.animate = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  const start = this.value as number;
  const end = target as number;
  const duration = options.duration || 300;
  const curve = easingCurves[options.curve || 'easeOut'];

  let startTime: number | null = null;

  const tick = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = curve(progress);

    this.value = interpolate(start, end, eased) as T;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      options.onComplete?.();
    }
  };

  requestAnimationFrame(tick);
};

Signal.prototype.snapTo = function <T>(target: T, options: Partial<AnimationOptions> = {}) {
  this.animate(target, { duration: 300, curve: 'easeOut', ...options });
};

export { };
