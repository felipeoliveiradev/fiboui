/** Named enter/exit animations compiled to `@keyframes` (no per-frame JS). */
export const MOTION_PRESETS = [
  'fadeIn',
  'fadeOut',
  'fade',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scaleIn',
  'scaleOut',
  'scale',
  'blurIn',
  'blurOut',
  'blur',
  'pop',
  'bounce',
] as const;

export type MotionPreset = (typeof MOTION_PRESETS)[number];

export type RevealPreset =
  | 'fadeUp'
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'blur';

export type MotionEase =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | (string & {});

export type ReducedMotion = 'reduce' | 'never';

export interface MotionOptions {
  duration?: number;
  ease?: MotionEase;
  delay?: number;
  reducedMotion?: ReducedMotion;
  /** Slide/blur distance. Numbers are pixels. */
  from?: number | string;
}

export interface CustomMotion {
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration?: number;
  ease?: MotionEase;
  delay?: number;
  reducedMotion?: ReducedMotion;
}

export interface MotionSpec {
  kind: 'preset' | 'custom';
  preset?: MotionPreset;
  from?: Record<string, string | number>;
  to?: Record<string, string | number>;
  duration: number;
  ease: string;
  delay: number;
  reducedMotion: ReducedMotion;
  distance?: string;
}

export interface RevealOptions {
  preset?: RevealPreset;
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export type TransitionMap = Record<string, string | number>;

export function isCustomMotion(value: unknown): value is CustomMotion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const rec = value as Record<string, unknown>;
  return rec.from !== undefined && rec.to !== undefined && typeof rec.from === 'object' && typeof rec.to === 'object';
}
