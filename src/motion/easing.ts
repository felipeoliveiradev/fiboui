export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

const cache = new Map<string, string>();

/**
 * Approximate a spring as CSS `linear()` easing (Chrome 113+, Safari 17.2+, Firefox 112+).
 * Sampled once at compile time — the browser interpolates; no rAF.
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
    const acc = force / mass;
    v += acc * dt;
    x += v * dt;
    samples.push(x);
    if (i > 8 && Math.abs(x - target) < 0.002 && Math.abs(v) < 0.002) {
      break;
    }
  }

  if (samples[samples.length - 1] !== 1) samples.push(1);

  const maxStops = 24;
  const step = Math.max(1, Math.floor((samples.length - 1) / maxStops));
  const stops: string[] = [];
  for (let i = 0; i < samples.length; i += step) {
    const t = i / (samples.length - 1);
    const y = round4(samples[i]);
    if (i === 0) {
      stops.push(`${y}`);
    } else {
      stops.push(`${y} ${round2(t * 100)}%`);
    }
  }
  const last = samples[samples.length - 1];
  if (!stops[stops.length - 1]?.startsWith(`${round4(last)}`)) {
    stops.push(`${round4(last)}`);
  }

  const value = `linear(${stops.join(', ')})`;
  cache.set(key, value);
  return value;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function resolveEase(value: string): string {
  if (value === 'spring') return springEase();
  if (value === 'easeIn') return 'ease-in';
  if (value === 'easeOut') return 'ease-out';
  if (value === 'easeInOut') return 'ease-in-out';
  return value;
}
