/**
 * State-agnostic interaction effect presets (Hover.css–inspired, fiboui-owned).
 * Apply via any pseudo trigger: `.hover(h => h.effect("forward"))`,
 * `.pressEffect("shrink")`, `.focus(f => f.effect("glow"))`, etc.
 */

export const INTERACTION_EFFECTS = [
  'forward',
  'backward',
  'float',
  'sink',
  'grow',
  'shrink',
  'pulse',
  'pop',
  'nudge',
  'fade',
  'lift',
  'glow',
] as const;

export type InteractionEffectName = (typeof INTERACTION_EFFECTS)[number];

export interface InteractionEffectDef {
  /** CSS properties this effect mutates — used for base-element transition. */
  properties: string[];
  /** Apply onto a PseudoStateBuilder-like surface. */
  apply: (target: InteractionEffectTarget) => void;
}

/** Minimal surface shared by PseudoStateBuilder (and tests). */
export interface InteractionEffectTarget {
  translateX(value: number | string): this;
  translateY(value: number | string): this;
  scale(value: number): this;
  opacity(value: number): this;
  shadow(value: string): this;
}

const ALIAS: Record<string, InteractionEffectName> = {
  // Hover.css naming aliases → fiboui presets
  'hang': 'float',
  'bob': 'float',
  'wobble-horizontal': 'nudge',
  'icon-forward': 'forward',
  'icon-back': 'backward',
  'icon-up': 'float',
  'icon-down': 'sink',
  'icon-grow': 'grow',
  'icon-shrink': 'shrink',
  'icon-float': 'float',
  'icon-sink': 'sink',
  'icon-pulse': 'pulse',
  'icon-pop': 'pop',
};

const DEFS: Record<InteractionEffectName, InteractionEffectDef> = {
  forward: {
    properties: ['transform'],
    apply: (t) => {
      t.translateX(4);
    },
  },
  backward: {
    properties: ['transform'],
    apply: (t) => {
      t.translateX(-4);
    },
  },
  float: {
    properties: ['transform'],
    apply: (t) => {
      t.translateY(-4);
    },
  },
  sink: {
    properties: ['transform'],
    apply: (t) => {
      t.translateY(4);
    },
  },
  grow: {
    properties: ['transform'],
    apply: (t) => {
      t.scale(1.04);
    },
  },
  shrink: {
    properties: ['transform'],
    apply: (t) => {
      t.scale(0.97);
    },
  },
  pulse: {
    properties: ['transform'],
    apply: (t) => {
      t.scale(1.06);
    },
  },
  pop: {
    properties: ['transform'],
    apply: (t) => {
      t.scale(1.05);
    },
  },
  /** Soft sideways nudge — good for stacked cards / list rows. */
  nudge: {
    properties: ['transform'],
    apply: (t) => {
      t.translateX(3);
    },
  },
  fade: {
    properties: ['opacity'],
    apply: (t) => {
      t.opacity(0.72);
    },
  },
  lift: {
    properties: ['transform', 'box-shadow'],
    apply: (t) => {
      t.translateY(-3).shadow('0 8px 24px rgba(0, 0, 0, 0.18)');
    },
  },
  glow: {
    properties: ['box-shadow'],
    apply: (t) => {
      t.shadow('0 0 0 3px rgba(255, 255, 255, 0.16)');
    },
  },
};

export function isInteractionEffectName(value: string): value is InteractionEffectName {
  return (INTERACTION_EFFECTS as readonly string[]).includes(value);
}

export function normalizeInteractionEffect(name: string): InteractionEffectName {
  const resolved = ALIAS[name] ?? name;
  if (!isInteractionEffectName(resolved)) {
    throw new Error(
      `Unknown interaction effect "${name}". Use: ${INTERACTION_EFFECTS.join(', ')}`,
    );
  }
  return resolved;
}

export function getInteractionEffect(name: string): InteractionEffectDef {
  return DEFS[normalizeInteractionEffect(name)];
}

export function applyInteractionEffect(
  target: InteractionEffectTarget,
  name: string,
): InteractionEffectDef {
  const def = getInteractionEffect(name);
  def.apply(target);
  return def;
}
