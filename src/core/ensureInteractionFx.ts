import { StyleManager } from './styleManager';
import { FIBO_INTERACTION_FX_CSS } from './interactionFxCss';

let injected = false;

/** Inject the full interaction-effect sheet once (idempotent). */
export function ensureInteractionFxCss(): void {
  if (injected) return;
  injected = true;
  const mgr = StyleManager.getInstance();
  mgr.ensureDefaults();
  mgr.injectExtra(FIBO_INTERACTION_FX_CSS, 'fibo-interaction-fx');
}

/** Test-only: allow re-injection after StyleManager.reset(). */
export function resetInteractionFxCssForTests(): void {
  injected = false;
}
