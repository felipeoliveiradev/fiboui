import { StyleManager } from './styleManager';
import { FIBO_INTERACTION_FX_CSS } from './interactionFxCss';

/**
 * Inject the full interaction-effect sheet once.
 * Idempotent via StyleManager cache — must NOT use a module flag, or
 * `endSsrRequest()` / `StyleManager.reset()` would skip re-injection on the
 * next SSR request and drop FX CSS from the snapshot.
 */
export function ensureInteractionFxCss(): void {
  const mgr = StyleManager.getInstance();
  mgr.ensureDefaults();
  mgr.injectExtra(FIBO_INTERACTION_FX_CSS, 'fibo-interaction-fx');
}

/** @deprecated StyleManager.reset() already drops the extra. Kept for tests. */
export function resetInteractionFxCssForTests(): void {
  // no-op: injectExtra keys off StyleManager cache
}
