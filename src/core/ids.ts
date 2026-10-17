import { StyleManager } from './styleManager';

let sequence = 0;

/**
 * Sequential ids for tests / SVG leftovers. Do not use for class names or
 * React keys — those must hash from content so SSR and the client match.
 */
export function nextStableId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function resetStableIds(): void {
  sequence = 0;
}

// LinearGradient auto-ids call nextStableId at construct time. endSsrRequest →
// StyleManager.reset() must rewind the counter or request N hydrates as gradient-1
// while the Node process emits gradient-(N+k). Client HMR keeps the sequence.
const origStyleReset = StyleManager.prototype.reset;
StyleManager.prototype.reset = function (this: StyleManager) {
  if (typeof globalThis.window === 'undefined' || globalThis.window == null) {
    sequence = 0;
  }
  return origStyleReset.call(this);
};
