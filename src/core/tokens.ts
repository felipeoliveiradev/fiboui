import { INTERACTION_EFFECTS } from './interactionEffects';
import { MOTION_PRESETS } from './motionCss';

/**
 * Closed sets for fluent methods. Same idea as `When`: a const object, not a
 * TypeScript enum. A raw string or number still works when you need a custom value.
 *
 * `Space`, `Radius`, and `Color` read the active theme (`--fibo-*`).
 * `Size` and `Align` are layout words the builders already understand.
 */

function catalog<const T extends readonly string[]>(values: T): { readonly [K in T[number]]: K } {
  return Object.fromEntries(values.map((name) => [name, name])) as { readonly [K in T[number]]: K };
}

/** `.animate(Motion.fadeIn)`. Preset list lives in `motionCss`. */
export const Motion = catalog(MOTION_PRESETS);
export type Motion = (typeof Motion)[keyof typeof Motion];

/** `.hover(h => h.effect(Effect.sweepToRight))`. */
export const Effect = catalog(INTERACTION_EFFECTS);
export type Effect = (typeof Effect)[keyof typeof Effect];

export const Align = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  baseline: 'baseline',
  between: 'between',
  around: 'around',
  evenly: 'evenly',
} as const;

export type Align = (typeof Align)[keyof typeof Align];

/** Words `.width()` / `.height()` already accept. A number or `'320px'` skips this. */
export const Size = {
  full: 'full',
  screen: 'screen',
  fit: 'fit',
  min: 'min',
  max: 'max',
} as const;

export type Size = (typeof Size)[keyof typeof Size];

/** Theme spacing. `.padding(Space.md)`, `.gap(Space.sm)`, `.height(Space.xl)`. */
export const Space = {
  xs: 'var(--fibo-space-xs)',
  sm: 'var(--fibo-space-sm)',
  md: 'var(--fibo-space-md)',
  lg: 'var(--fibo-space-lg)',
  xl: 'var(--fibo-space-xl)',
} as const;

export type Space = (typeof Space)[keyof typeof Space];

/** Theme radii. `.borderRadius(Radius.md)`. */
export const Radius = {
  xs: 'var(--fibo-radius-xs)',
  sm: 'var(--fibo-radius-sm)',
  md: 'var(--fibo-radius-md)',
  lg: 'var(--fibo-radius-lg)',
  xl: 'var(--fibo-radius-xl)',
  full: 'var(--fibo-radius-full)',
} as const;

export type Radius = (typeof Radius)[keyof typeof Radius];

/**
 * Theme colors. `.bg(Color.primary)` and `.color(Color.onSurface)` resolve to
 * `--fibo-*`. A hex, `rgb()`, or any other string still paints as-is.
 */
export const Color = {
  primary: 'var(--fibo-primary)',
  onPrimary: 'var(--fibo-on-primary)',
  primaryContainer: 'var(--fibo-primary-container)',
  onPrimaryContainer: 'var(--fibo-on-primary-container)',
  secondary: 'var(--fibo-secondary)',
  onSecondary: 'var(--fibo-on-secondary)',
  secondaryContainer: 'var(--fibo-secondary-container)',
  onSecondaryContainer: 'var(--fibo-on-secondary-container)',
  tertiary: 'var(--fibo-tertiary)',
  onTertiary: 'var(--fibo-on-tertiary)',
  background: 'var(--fibo-background)',
  onBackground: 'var(--fibo-on-background)',
  surface: 'var(--fibo-surface)',
  onSurface: 'var(--fibo-on-surface)',
  error: 'var(--fibo-error)',
  onError: 'var(--fibo-on-error)',
  outline: 'var(--fibo-outline)',
} as const;

export type Color = (typeof Color)[keyof typeof Color];

/** Scroll direction for `.horizontal()` / `.vertical()`, or pass the word itself. */
export const Axis = {
  horizontal: 'horizontal',
  vertical: 'vertical',
} as const;

export type Axis = (typeof Axis)[keyof typeof Axis];

/** `.scrollbar(Bar.hidden)`. */
export const Bar = {
  hidden: 'hidden',
  visible: 'visible',
  auto: 'auto',
} as const;

export type Bar = (typeof Bar)[keyof typeof Bar];

export const FlexDirection = {
  row: 'row',
  column: 'column',
  rowReverse: 'row-reverse',
  columnReverse: 'column-reverse',
} as const;
export type FlexDirection = (typeof FlexDirection)[keyof typeof FlexDirection];

export const TextDirection = { ltr: 'ltr', rtl: 'rtl' } as const;
export type TextDirection = (typeof TextDirection)[keyof typeof TextDirection];

export const Wrap = { wrap: 'wrap', nowrap: 'nowrap', wrapReverse: 'wrap-reverse' } as const;
export type Wrap = (typeof Wrap)[keyof typeof Wrap];

export const AxisSize = { min: 'min', max: 'max' } as const;
export type AxisSize = (typeof AxisSize)[keyof typeof AxisSize];

export const Clip = { none: 'none', hardEdge: 'hardEdge', antiAlias: 'antiAlias' } as const;
export type Clip = (typeof Clip)[keyof typeof Clip];

export const Baseline = { alphabetic: 'alphabetic', ideographic: 'ideographic' } as const;
export type Baseline = (typeof Baseline)[keyof typeof Baseline];

export const StackAlign = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
} as const;
export type StackAlign = (typeof StackAlign)[keyof typeof StackAlign];

export const Theme = { material: 'material', cupertino: 'cupertino', web: 'web', noir: 'noir' } as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const Scheme = { light: 'light', dark: 'dark', system: 'system', lightDark: 'light dark' } as const;
export type Scheme = (typeof Scheme)[keyof typeof Scheme];

export const TextRole = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'body',
  caption: 'caption',
  label: 'label',
} as const;
export type TextRole = (typeof TextRole)[keyof typeof TextRole];

export const TextAlign = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
  start: 'start',
  end: 'end',
} as const;
export type TextAlign = (typeof TextAlign)[keyof typeof TextAlign];

/** Theme-facing weights. `.fontWeight(Weight.bold)` or `.fontWeight(700)`. */
export const Weight = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;
export type Weight = (typeof Weight)[keyof typeof Weight];

export const ButtonVariant = {
  elevated: 'elevated',
  filled: 'filled',
  outlined: 'outlined',
  text: 'text',
  ghost: 'ghost',
  soft: 'soft',
  outline: 'outline',
  raw: 'raw',
  solid: 'solid',
} as const;

export const ButtonSize = { xs: 'xs', sm: 'sm', md: 'md', lg: 'lg' } as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

export const ButtonShape = {
  default: 'default',
  pill: 'pill',
  square: 'square',
  rect: 'rect',
  rounded: 'rounded',
  sharp: 'sharp',
} as const;
export type ButtonShape = (typeof ButtonShape)[keyof typeof ButtonShape];

export const ButtonTone = { default: 'default', inverse: 'inverse' } as const;
export type ButtonTone = (typeof ButtonTone)[keyof typeof ButtonTone];

export const ButtonType = { button: 'button', submit: 'submit', reset: 'reset' } as const;
export type ButtonType = (typeof ButtonType)[keyof typeof ButtonType];

export const FieldType = {
  text: 'text',
  password: 'password',
  email: 'email',
  number: 'number',
  tel: 'tel',
} as const;
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

export const FieldVariant = { filled: 'filled', outlined: 'outlined' } as const;
export type FieldVariant = (typeof FieldVariant)[keyof typeof FieldVariant];

export const Resize = {
  none: 'none',
  vertical: 'vertical',
  horizontal: 'horizontal',
  both: 'both',
} as const;
export type Resize = (typeof Resize)[keyof typeof Resize];

export const ListVariant = { default: 'default', card: 'card', floating: 'floating' } as const;
export type ListVariant = (typeof ListVariant)[keyof typeof ListVariant];

export const GridVariant = { standard: 'standard', masonry: 'masonry', bento: 'bento' } as const;
export type GridVariant = (typeof GridVariant)[keyof typeof GridVariant];

export const TableVariant = { default: 'default', clean: 'clean' } as const;
export type TableVariant = (typeof TableVariant)[keyof typeof TableVariant];

export const BadgeVariant = {
  neutral: 'neutral',
  accent: 'accent',
  outline: 'outline',
  glass: 'glass',
  solid: 'solid',
  dot: 'dot',
} as const;
export type BadgeVariant = (typeof BadgeVariant)[keyof typeof BadgeVariant];

export const Intent = {
  none: 'none',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
} as const;
export type Intent = (typeof Intent)[keyof typeof Intent];

export const Spinner = { circle: 'circle', dots: 'dots', pulse: 'pulse', blocks: 'blocks' } as const;
export type Spinner = (typeof Spinner)[keyof typeof Spinner];

export const Progress = {
  default: 'default',
  striped: 'striped',
  labeled: 'labeled',
  circular: 'circular',
  ring: 'ring',
  segments: 'segments',
  knob: 'knob',
  steps: 'steps',
  chevron: 'chevron',
  floating: 'floating',
  pagination: 'pagination',
  timeline: 'timeline',
} as const;
export type Progress = (typeof Progress)[keyof typeof Progress];

export const Fit = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
  none: 'none',
  scaleDown: 'scale-down',
} as const;
export type Fit = (typeof Fit)[keyof typeof Fit];

export const Ease = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
} as const;
export type Ease = (typeof Ease)[keyof typeof Ease];

export const Curve = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
  spring: 'spring',
} as const;
export type Curve = (typeof Curve)[keyof typeof Curve];

export const Snap = { start: 'start', center: 'center', end: 'end' } as const;
export type Snap = (typeof Snap)[keyof typeof Snap];

export const SnapAxis = { x: 'x', y: 'y', both: 'both' } as const;
export type SnapAxis = (typeof SnapAxis)[keyof typeof SnapAxis];

export const Timeline = { view: 'view', scroll: 'scroll' } as const;
export type Timeline = (typeof Timeline)[keyof typeof Timeline];

export const ReducedMotion = { reduce: 'reduce', never: 'never' } as const;
export type ReducedMotion = (typeof ReducedMotion)[keyof typeof ReducedMotion];

export const Shadow = { none: 'none', soft: 'soft', sm: 'sm', md: 'md', lg: 'lg' } as const;
export type Shadow = (typeof Shadow)[keyof typeof Shadow];

export const Position = { static: 'static', sticky: 'sticky', fixed: 'fixed' } as const;
export type Position = (typeof Position)[keyof typeof Position];

export const Mode = { side: 'side', over: 'over' } as const;
export type Mode = (typeof Mode)[keyof typeof Mode];

export const Behavior = { fixed: 'fixed', scroll: 'scroll' } as const;
export type Behavior = (typeof Behavior)[keyof typeof Behavior];

export const Side = { start: 'start', end: 'end' } as const;
export type Side = (typeof Side)[keyof typeof Side];

export const Place = { leading: 'leading', principal: 'principal', trailing: 'trailing' } as const;
export type Place = (typeof Place)[keyof typeof Place];

export const FormMethod = { get: 'get', post: 'post' } as const;
export type FormMethod = (typeof FormMethod)[keyof typeof FormMethod];

export const Trend = { up: 'up', down: 'down', neutral: 'neutral' } as const;
export type Trend = (typeof Trend)[keyof typeof Trend];

export const Stroke = { butt: 'butt', round: 'round', square: 'square' } as const;
export type Stroke = (typeof Stroke)[keyof typeof Stroke];

export const Join = { miter: 'miter', round: 'round', bevel: 'bevel' } as const;
export type Join = (typeof Join)[keyof typeof Join];

export const Scale = { small: 'small', medium: 'medium', large: 'large' } as const;
export type Scale = (typeof Scale)[keyof typeof Scale];

export const Density = Scale;
export type Density = Scale;

const SIZE_WORDS = new Set<string>(Object.values(Size));

export function isSizeWord(value: string): value is Size {
  return SIZE_WORDS.has(value);
}

/** CSS length a size word locks to, so a flex parent cannot squash it. */
export function sizeWordCss(word: string, axis: 'width' | 'height'): string | undefined {
  if (word === Size.full) return '100%';
  if (word === Size.screen) return axis === 'width' ? '100vw' : '100vh';
  if (word === Size.fit) return 'fit-content';
  if (word === Size.min) return 'min-content';
  if (word === Size.max) return 'max-content';
  return undefined;
}
