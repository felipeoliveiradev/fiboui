export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

const cache = new Map<string, string>();

const CAMEL: Record<string, string> = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
  ease: 'ease',
};

/**
 * CSS `linear()` spring sampled once. stiffness/damping/mass change the curve.
 * The browser interpolates — no rAF on the CSS path.
 */
export function springEase(options: SpringOptions = {}): string {
  const stiffness = options.stiffness ?? 170;
  const damping = options.damping ?? 26;
  const mass = options.mass ?? 1;
  const key = `${stiffness}:${damping}:${mass}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const dt = 1 / 60;
  const target = 1;
  let x = 0;
  let v = 0;
  const samples: number[] = [0];

  for (let i = 0; i < 180; i += 1) {
    const force = -stiffness * (x - target) - damping * v;
    v += (force / mass) * dt;
    x += v * dt;
    samples.push(x);
    if (i > 8 && Math.abs(x - target) < 0.002 && Math.abs(v) < 0.002) break;
  }
  if (samples[samples.length - 1] !== 1) samples.push(1);

  const maxStops = 24;
  const step = Math.max(1, Math.floor((samples.length - 1) / maxStops));
  const stops: string[] = [];
  for (let i = 0; i < samples.length; i += step) {
    const t = i / (samples.length - 1);
    const y = Math.round(samples[i] * 10000) / 10000;
    stops.push(i === 0 ? `${y}` : `${y} ${Math.round(t * 10000) / 100}%`);
  }
  const value = `linear(${stops.join(', ')})`;
  cache.set(key, value);
  return value;
}

export function resolveCssEase(value: string, spring?: SpringOptions): string {
  if (value === 'spring') return springEase(spring);
  return CAMEL[value] ?? value;
}
