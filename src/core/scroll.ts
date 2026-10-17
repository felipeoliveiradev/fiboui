export type ScrollToOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  /** Also set `location.hash` (in-page anchor navigation). */
  hash?: boolean;
};

function findScrollTarget(target: string): Element | null {
  const id = target.replace(/^#/, '');
  const byId = document.getElementById(id);
  if (byId) return byId;

  const selectors: string[] = [];
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    selectors.push(`#${CSS.escape(id)}`);
  }
  if (target.startsWith('#')) {
    selectors.push(target);
  } else {
    selectors.push(`#${target}`);
    selectors.push(target);
  }

  for (const selector of selectors) {
    try {
      const found = document.querySelector(selector);
      if (found) return found;
    } catch {
      // invalid CSS selector (ids with spaces, colons, …)
    }
  }
  return null;
}

/**
 * Smooth-scroll to an element id / selector / Element.
 * Pass `hash: true` to update the URL hash (replaces the old site-only `goHash`).
 */
export function scrollTo(
  target: string | Element,
  options?: ScrollToOptions,
): void {
  if (typeof document === 'undefined') return;

  const raw = typeof target === 'string' ? target : null;
  const id = raw?.replace(/^#/, '') ?? null;

  if (options?.hash && id && typeof window !== 'undefined') {
    window.location.hash = id;
  }

  const el = typeof target === 'string' ? findScrollTarget(target) : target;
  if (!el) return;
  el.scrollIntoView({
    behavior: options?.behavior ?? 'smooth',
    block: options?.block ?? 'start',
  });
}

export function startViewTransition(update: () => void): void {
  const doc = typeof document !== 'undefined' ? document : undefined;
  const start = (doc as Document & { startViewTransition?: (cb: () => void) => unknown })
    ?.startViewTransition;
  if (typeof start === 'function') {
    start.call(doc, update);
    return;
  }
  update();
}

export function supportsViewTimeline(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
  return CSS.supports('animation-timeline', 'view()');
}

export function supportsScrollTimeline(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
  return CSS.supports('animation-timeline', 'scroll()');
}

/** Page scroll 0–1. Missing `window` / `document` → 0. Never NaN. */
export function pageScrollProgress(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  const root = document.documentElement;
  if (!root) return 0;
  const max = root.scrollHeight - window.innerHeight;
  if (!(max > 0) || !Number.isFinite(max)) return 0;
  const y = typeof window.scrollY === 'number' && Number.isFinite(window.scrollY) ? window.scrollY : 0;
  const p = Math.min(1, Math.max(0, y / max));
  return Number.isFinite(p) ? p : 0;
}
