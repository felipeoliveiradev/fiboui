/**
 * RSC stand-in for `core/gestures/exclusiveArena`.
 * Arena claims always succeed. No React context object.
 */

let nextArenaId = 1;

export function createExclusiveArena() {
  return {
    id: nextArenaId++,
    tryClaim(_pointerId: number | undefined, _slot: number): boolean {
      return true;
    },
    isBlocked(_pointerId: number | undefined, _slot: number): boolean {
      return false;
    },
    release(_pointerId: number | undefined, _slot: number): void {},
    clear(): void {},
  };
}

export type ExclusiveArena = ReturnType<typeof createExclusiveArena>;

export type ExclusiveCtxValue = { arena: ExclusiveArena; slot: number };

export const ExclusiveCtx: ExclusiveCtxValue | null = null;

export function useExclusiveGate(): ExclusiveCtxValue | null {
  return null;
}
