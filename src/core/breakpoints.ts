/** Tailwind-aligned min-width breakpoints (px). Shared by `.media()` / `.sm()`…`.xl()`. */
export const FIBO_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointKey = keyof typeof FIBO_BREAKPOINTS;

export function isBreakpointKey(value: string): value is BreakpointKey {
  return value in FIBO_BREAKPOINTS;
}

/** Resolve `md` → `(min-width: 768px)`, or pass through a raw media query. */
export function toMediaQuery(query: BreakpointKey | string): string {
  if (isBreakpointKey(query)) {
    return `(min-width: ${FIBO_BREAKPOINTS[query]}px)`;
  }
  const raw = query.trim();
  if (raw.startsWith('@media')) {
    return raw.replace(/^@media\s+/, '');
  }
  return raw;
}
