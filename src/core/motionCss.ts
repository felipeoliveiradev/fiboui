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

const ALIAS: Record<string, MotionPreset> = {
  fade: 'fadeIn',
  scale: 'scaleIn',
  blur: 'blurIn',
};

export interface CustomMotion {
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  duration?: number;
  ease?: string;
  delay?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function isCustomMotion(value: unknown): value is CustomMotion {
  if (!value || typeof value !== 'object') return false;
  const rec = value as Record<string, unknown>;
  return typeof rec.from === 'object' && rec.from !== null && typeof rec.to === 'object' && rec.to !== null;
}

export function cssDecls(obj: Record<string, string | number>): string {
  const unitless = new Set(['opacity', 'zIndex', 'z-index', 'flex', 'fontWeight', 'lineHeight']);
  return Object.entries(obj)
    .map(([key, raw]) => {
      const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const value = typeof raw === 'number' && !unitless.has(key) ? `${raw}px` : String(raw);
      return `${prop}: ${value}`;
    })
    .join('; ');
}

export function hashDecls(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = ((h << 5) + h) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function normalizePreset(name: string): MotionPreset {
  const resolved = ALIAS[name] ?? name;
  if (!(MOTION_PRESETS as readonly string[]).includes(resolved)) {
    throw new Error(`Unknown motion preset "${name}". Use: ${MOTION_PRESETS.join(', ')}`);
  }
  return resolved as MotionPreset;
}

/** Static sheet: presets, scroll helpers, reduced-motion, Progress stripes. Injected once. */
export const FIBO_MOTION_CSS = `
.fibo-anim {
  animation-duration: var(--fibo-dur, 300ms);
  animation-timing-function: var(--fibo-ease, ease);
  animation-delay: calc(var(--fibo-i, 0) * var(--fibo-stagger, 0ms) + var(--fibo-delay, 0ms));
  animation-fill-mode: both;
  animation-iteration-count: 1;
}
.fibo-anim-fadeIn, .fibo-anim-fade { animation-name: fibo-fadeIn; }
.fibo-anim-fadeOut { animation-name: fibo-fadeOut; }
.fibo-anim-slideUp { animation-name: fibo-slideUp; }
.fibo-anim-slideDown { animation-name: fibo-slideDown; }
.fibo-anim-slideLeft { animation-name: fibo-slideLeft; }
.fibo-anim-slideRight { animation-name: fibo-slideRight; }
.fibo-anim-scaleIn, .fibo-anim-scale { animation-name: fibo-scaleIn; }
.fibo-anim-scaleOut { animation-name: fibo-scaleOut; }
.fibo-anim-blurIn, .fibo-anim-blur { animation-name: fibo-blurIn; }
.fibo-anim-blurOut { animation-name: fibo-blurOut; }
.fibo-anim-pop { animation-name: fibo-pop; }
.fibo-anim-bounce { animation-name: fibo-bounce; }

@keyframes fibo-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fibo-fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes fibo-slideUp {
  from { opacity: 0; transform: translate3d(0, var(--fibo-from, 16px), 0); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-slideDown {
  from { opacity: 0; transform: translate3d(0, calc(var(--fibo-from, 16px) * -1), 0); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-slideLeft {
  from { opacity: 0; transform: translate3d(var(--fibo-from, 16px), 0, 0); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-slideRight {
  from { opacity: 0; transform: translate3d(calc(var(--fibo-from, 16px) * -1), 0, 0); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-scaleIn {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-scaleOut {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: scale(0.94); }
}
@keyframes fibo-blurIn {
  from { opacity: 0; filter: blur(var(--fibo-from, 8px)); }
  to { opacity: 1; filter: none; }
}
@keyframes fibo-blurOut {
  from { opacity: 1; filter: none; }
  to { opacity: 0; filter: blur(var(--fibo-from, 8px)); }
}
@keyframes fibo-pop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: none; }
}
@keyframes fibo-bounce {
  0% { opacity: 0; transform: translate3d(0, var(--fibo-from, 16px), 0); }
  60% { opacity: 1; transform: translate3d(0, -6px, 0); }
  80% { transform: translate3d(0, 2px, 0); }
  100% { opacity: 1; transform: none; }
}

@keyframes stripes {
  from { background-position: 0 0; }
  to { background-position: 40px 0; }
}

.fibo-stagger-item { display: contents; }

.fibo-reveal {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  transition-property: opacity, transform, filter;
  transition-duration: var(--fibo-dur, 500ms);
  transition-timing-function: var(--fibo-ease, ease);
  transition-delay: calc(var(--fibo-i, 0) * var(--fibo-stagger, 0ms) + var(--fibo-delay, 0ms));
}
.fibo-reveal-fade { transform: none; }
.fibo-reveal-fadeUp, .fibo-reveal-fadeIn, .fibo-reveal-slideUp { transform: translate3d(0, 16px, 0); }
.fibo-reveal-slideDown { transform: translate3d(0, -16px, 0); }
.fibo-reveal-slideLeft { transform: translate3d(16px, 0, 0); }
.fibo-reveal-slideRight { transform: translate3d(-16px, 0, 0); }
.fibo-reveal-scale, .fibo-reveal-scaleIn { transform: scale(0.96); }
.fibo-reveal-blur { filter: blur(8px); transform: none; }
.fibo-reveal.fibo-inview {
  opacity: 1;
  transform: none;
  filter: none;
}

.fibo-view-timeline {
  animation-timeline: view();
  animation-range: entry 0% cover 35%;
}
.fibo-scroll-timeline {
  animation-timeline: scroll();
}
.fibo-scroll-progress {
  transform: scaleX(var(--fibo-progress, 0));
  transform-origin: left center;
  animation-name: fibo-progress-grow;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: scroll();
}
@keyframes fibo-progress-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@supports not (animation-timeline: scroll()) {
  .fibo-scroll-progress {
    animation: none;
    transform: scaleX(var(--fibo-progress, 0));
  }
}

.fibo-snap-y { scroll-snap-type: y mandatory; }
.fibo-snap-x { scroll-snap-type: x mandatory; }
.fibo-snap-both { scroll-snap-type: both mandatory; }
.fibo-snap-start { scroll-snap-align: start; }
.fibo-snap-center { scroll-snap-align: center; }
.fibo-snap-end { scroll-snap-align: end; }

@media (prefers-reduced-motion: reduce) {
  .fibo-anim:not(.fibo-motion-force),
  .fibo-reveal:not(.fibo-motion-force),
  .fibo-scroll-progress:not(.fibo-motion-force) {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
`.trim();
