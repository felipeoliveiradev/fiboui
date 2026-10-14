/**
 * Run an update inside the View Transitions API when the browser supports it.
 * Falls back to a synchronous update — never polyfills with rAF.
 */
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
