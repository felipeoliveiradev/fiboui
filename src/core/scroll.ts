export type ScrollToOptions = {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  /** Also set `location.hash` (in-page anchor navigation). */
  hash?: boolean;
};

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

  const el =
    typeof target === 'string'
      ? document.getElementById(target.replace(/^#/, '')) ??
        document.querySelector(target.startsWith('#') ? target : `#${target}`) ??
        document.querySelector(target)
      : target;
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
