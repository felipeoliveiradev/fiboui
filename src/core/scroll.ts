export function scrollTo(
  target: string | Element,
  options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition }
): void {
  if (typeof document === 'undefined') return;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
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
