'use client';

export {
  MOTION_PRESETS,
  MOTION_CSS,
  MOTION_STYLE_ID,
  springEase,
  resolveEase,
  compileMotion,
  createMotionSpec,
  specFromPreset,
  specFromCustom,
  normalizePreset,
  getMotionCss,
  ensureMotionCss,
  MotionStyles,
  registerMotionRule,
  Reveal,
  Presence,
  startViewTransition,
  isCustomMotion,
} from './motion/index';

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
  SpringOptions,
  RevealProps,
  PresenceProps,
} from './motion/index';
