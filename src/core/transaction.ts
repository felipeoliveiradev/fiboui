import { startViewTransition } from './scroll';
import type { AnimationOptions } from './animations';

/**
 * SwiftUI-ish `Transaction` — scoped animation flag for `withAnimation`.
 * Not a full animation graph; pairs with view transitions + existing `.animate`.
 */
export type Transaction = {
  /** `false` = disable; `true` = default VT; object = hint for callers. */
  animation: boolean | Partial<AnimationOptions>;
};

let current: Transaction | null = null;

/** Active transaction inside `withAnimation` / `withTransaction`, else `null`. */
export function transaction(): Transaction | null {
  return current;
}

export function withTransaction<T>(tx: Transaction, body: () => T): T {
  const prev = current;
  current = tx;
  try {
    if (tx.animation === false) return body();
    let result!: T;
    startViewTransition(() => {
      result = body();
    });
    return result;
  } finally {
    current = prev;
  }
}

/**
 * SwiftUI `withAnimation` — run `body` inside a view transition when available.
 *
 * ```ts
 * withAnimation(() => count.value++)
 * withAnimation({ duration: 0.3 }, () => open.value = true)
 * withAnimation(false, () => open.value = true) // no VT
 * ```
 *
 * Does **not** replace `.animate()` (CSS presets) or `Presence` (enter/exit).
 */
export function withAnimation<T>(body: () => T): T;
export function withAnimation<T>(
  animation: boolean | Partial<AnimationOptions>,
  body: () => T
): T;
export function withAnimation<T>(
  animationOrBody: boolean | Partial<AnimationOptions> | (() => T),
  body?: () => T
): T {
  if (typeof animationOrBody === 'function') {
    return withTransaction({ animation: true }, animationOrBody);
  }
  return withTransaction({ animation: animationOrBody }, body!);
}
