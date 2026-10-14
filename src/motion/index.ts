export type {
  MotionPreset,
  MotionEase,
  MotionOptions,
  MotionSpec,
  CustomMotion,
  RevealOptions,
  RevealPreset,
  ReducedMotion,
  TransitionMap,
} from './types';
export { MOTION_PRESETS, isCustomMotion } from './types';
export { springEase, resolveEase } from './easing';
export type { SpringOptions } from './easing';
export {
  compileMotion,
  createMotionSpec,
  specFromPreset,
  specFromCustom,
  normalizePreset,
} from './compile';
export { getMotionCss, ensureMotionCss, MotionStyles, registerMotionRule, resetMotionCssForTests, MOTION_STYLE_ID } from './sheet';
export { Reveal } from './reveal';
export type { RevealProps } from './reveal';
export { Presence } from './presence';
export type { PresenceProps } from './presence';
export { startViewTransition } from './viewTransition';
export { MOTION_CSS } from './css';
