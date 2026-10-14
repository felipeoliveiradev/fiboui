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

/** Credit-card / chip — matches Monetron list + wallet glyphs. */
export const Card = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...s} aria-hidden>
    <rect x="5" y="6.5" width="14" height="11" rx="2.2" />
    <circle cx="8.6" cy="12" r="1.55" />
  </svg>
);

export const Back = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...s} strokeWidth={2} aria-hidden>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const Gauge = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M4.2 16.2a8.2 8.2 0 0115.6 0" />
    <path d="M12 16.2l4-5.2" />
  </svg>
);

export const Bars = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M6 18V11M10 18V7M14 18V13M18 18V9" />
  </svg>
);

export const Trend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <path d="M4 16l5.5-5.5 3.2 3.2 7.3-7.3" />
    <path d="M15 6.4h4.6V11" />
  </svg>
);

export const Apps = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...s} aria-hidden>
    <rect x="4.5" y="4.5" width="6" height="6" />
    <rect x="13.5" y="4.5" width="6" height="6" />
    <rect x="4.5" y="13.5" width="6" height="6" />
    <rect x="13.5" y="13.5" width="6" height="6" />
  </svg>
);
