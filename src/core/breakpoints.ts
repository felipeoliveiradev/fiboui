/** Tailwind-aligned min-width breakpoints (px). Shared by `.media()` / `.sm()`…`.xl()`. */
export const FIBO_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointKey = keyof typeof FIBO_BREAKPOINTS;

const BREAKPOINT_KEYS = new Set<string>(Object.keys(FIBO_BREAKPOINTS));

export function isBreakpointKey(value: string): value is BreakpointKey {
  return BREAKPOINT_KEYS.has(value);
}

/** Resolve `md` → `(min-width: 768px)`, or pass through a raw media query. */
export function toMediaQuery(query: BreakpointKey | string): string {
  const raw = query.trim();
  if (isBreakpointKey(raw)) {
    return `(min-width: ${FIBO_BREAKPOINTS[raw]}px)`;
  }
  // CSS allows `@media(` with no space; the at-keyword is case-insensitive.
  // styleManager wraps as `@media ${query}` — a leftover prefix is invalid CSS.
  if (/^@media\b/i.test(raw)) {
    return raw.replace(/^@media\b\s*/i, '');
  }
  return raw;
}
