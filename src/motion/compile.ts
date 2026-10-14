import {
  CustomMotion,
  MOTION_PRESETS,
  MotionOptions,
  MotionPreset,
  MotionSpec,
  isCustomMotion,
} from './types';
import { resolveEase, springEase } from './easing';
import { ensureMotionCss, registerMotionRule } from './sheet';

const PRESET_SET = new Set<string>(MOTION_PRESETS);

const ALIAS: Record<string, MotionPreset> = {
  fade: 'fadeIn',
  scale: 'scaleIn',
  blur: 'blurIn',
};

const UNITLESS = new Set([
  'opacity',
  'zIndex',
  'z-index',
  'flex',
  'flexGrow',
  'flexShrink',
  'order',
  'fontWeight',
  'lineHeight',
]);

export function normalizePreset(name: string): MotionPreset {
  const aliased = ALIAS[name] ?? name;
  if (!PRESET_SET.has(aliased)) {
    throw new Error(`Unknown motion preset "${name}". Use one of: ${MOTION_PRESETS.join(', ')}`);
  }
  return aliased as MotionPreset;
}

export function distanceToCss(from?: number | string): string | undefined {
  if (from === undefined) return undefined;
  return typeof from === 'number' ? `${from}px` : from;
}

export function compileMotion(spec: MotionSpec): { className: string; style: Record<string, string> } {
  ensureMotionCss();
  const classes = ['fibo-anim'];
  if (spec.kind === 'preset' && spec.preset) {
    classes.push(`fibo-anim-${spec.preset}`);
  } else {
    classes.push(registerCustomKeyframes(spec));
  }
  if (spec.reducedMotion === 'never') classes.push('fibo-motion-force');

  const style: Record<string, string> = {
    '--fibo-dur': `${spec.duration}ms`,
    '--fibo-ease': spec.ease,
    '--fibo-delay': `${spec.delay}ms`,
  };
  if (spec.distance) style['--fibo-from'] = spec.distance;

  return { className: classes.join(' '), style };
}

export function specFromPreset(preset: MotionPreset | string, options: MotionOptions = {}): MotionSpec {
  const name = normalizePreset(preset);
  const ease = resolveEase(options.ease ?? (name === 'pop' ? 'spring' : 'ease'));
  return {
    kind: 'preset',
    preset: name,
    duration: options.duration ?? 300,
    ease,
    delay: options.delay ?? 0,
    reducedMotion: options.reducedMotion ?? 'reduce',
    distance: distanceToCss(typeof options.from === 'object' ? undefined : options.from),
  };
}

export function specFromCustom(custom: CustomMotion): MotionSpec {
  return {
    kind: 'custom',
    from: custom.from,
    to: custom.to,
    duration: custom.duration ?? 300,
    ease: resolveEase(custom.ease ?? 'ease'),
    delay: custom.delay ?? 0,
    reducedMotion: custom.reducedMotion ?? 'reduce',
  };
}

export function createMotionSpec(
  input: MotionPreset | string | CustomMotion,
  options?: MotionOptions
): MotionSpec {
  if (isCustomMotion(input)) return specFromCustom(input);
  return specFromPreset(input, options);
}

function registerCustomKeyframes(spec: MotionSpec): string {
  const from = decls(spec.from ?? {});
  const to = decls(spec.to ?? {});
  const raw = `${from}=>${to}`;
  const id = `fibo-c-${hash(raw)}`;
  registerMotionRule(
    id,
    `@keyframes ${id} { from { ${from} } to { ${to} } }\n.${id} { animation-name: ${id}; }`
  );
  return id;
}

function decls(obj: Record<string, string | number>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const unitless = UNITLESS.has(key) || UNITLESS.has(prop);
      const css = typeof value === 'number' && !unitless ? `${value}px` : String(value);
      return `${prop}: ${css}`;
    })
    .join('; ');
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export { resolveEase, springEase };
