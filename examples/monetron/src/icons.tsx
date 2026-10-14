import type { SVGProps } from 'react';

const s: SVGProps<SVGSVGElement> = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 };

export const Logo = () => (
  <svg width="124" height="124" viewBox="0 0 124 124" {...s} strokeWidth={2} aria-hidden>
    <defs>
      <linearGradient id="monetron-logo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#444" />
      </linearGradient>
    </defs>
    <g stroke="url(#monetron-logo)">
      <path d="M62 4 L120 62 L62 120 L4 62 Z" />
      <path d="M62 12 C66 40 84 58 112 62 C84 66 66 84 62 112 C58 84 40 66 12 62 C40 58 58 40 62 12 Z" />
      <path d="M22 62 C44 60 60 76 60 118" />
      <path d="M30 62 C48 64 56 80 56 112" />
      <path d="M62 22 L62 40 M102 62 L84 62" />
      <circle cx="62" cy="62" r="7" />
    </g>
  </svg>
);

export const Eye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <path d="M3 3l18 18" />
  </svg>
);

export const Gear = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...s} aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </svg>
);

export const Wallet = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...s} aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M15 12h6" />
  </svg>
);

export const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" {...s} strokeWidth={2} aria-hidden>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const Back = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...s} strokeWidth={2} aria-hidden>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const Gauge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M3 16a9 9 0 0118 0" />
    <path d="M12 16l4-5" />
  </svg>
);

export const Bars = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M5 20V9M9 20V6M13 20V8M17 20V5" />
  </svg>
);

export const Trend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </svg>
);

export const Apps = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <rect x="4" y="4" width="6" height="6" />
    <rect x="14" y="4" width="6" height="6" />
    <rect x="4" y="14" width="6" height="6" />
    <rect x="14" y="14" width="6" height="6" />
  </svg>
);

/** Multi-segment ring. fiboui Progress is single-value; no vector primitive. */
export const Ring = ({ analyze }: { analyze: boolean }) => {
  const C = 2 * Math.PI * 88;
  const seg = (from: number, len: number, color: string, w: number) => (
    <circle
      cx="100"
      cy="100"
      r="88"
      stroke={color}
      strokeWidth={w}
      fill="none"
      strokeDasharray={`${len * C} ${C}`}
      strokeDashoffset={-from * C}
      transform="rotate(-90 100 100)"
      style={{ transition: 'all .4s' }}
    />
  );
  return (
    <svg width="190" height="190" viewBox="0 0 200 200" aria-hidden>
      {seg(0.0, 0.5, '#fff', analyze ? 5 : 2.4)}
      {seg(0.505, 0.25, analyze ? '#bbb' : '#888', 2.4)}
      {seg(0.76, 0.12, '#555', 2.4)}
      {seg(0.885, 0.11, '#2a2a2a', 2.4)}
    </svg>
  );
};

export const AVATAR_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#ddd"/><circle cx="12" cy="10" r="5" fill="#555"/><rect x="5" y="16" width="14" height="10" rx="5" fill="#555"/></svg>'
  );
