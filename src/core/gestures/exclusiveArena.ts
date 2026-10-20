import React from 'react';

/**
 * SwiftUI ExclusiveGesture arena — first recognizer to claim a pointer wins;
 * siblings ignore that pointer until release.
 */

let nextArenaId = 1;

export function createExclusiveArena() {
  /** pointerId → slot index that claimed it */
  const claims = new Map<number, number>();

  return {
    id: nextArenaId++,
    tryClaim(pointerId: number | undefined, slot: number): boolean {
      if (pointerId === undefined) return true;
      const owner = claims.get(pointerId);
      if (owner != null && owner !== slot) return false;
      claims.set(pointerId, slot);
      return true;
    },
    isBlocked(pointerId: number | undefined, slot: number): boolean {
      if (pointerId === undefined) return false;
      const owner = claims.get(pointerId);
      return owner != null && owner !== slot;
    },
    release(pointerId: number | undefined, slot: number): void {
      if (pointerId === undefined) return;
      if (claims.get(pointerId) === slot) claims.delete(pointerId);
    },
    clear(): void {
      claims.clear();
    },
  };
}

export type ExclusiveArena = ReturnType<typeof createExclusiveArena>;

export type ExclusiveCtxValue = { arena: ExclusiveArena; slot: number };

export const ExclusiveCtx = React.createContext<ExclusiveCtxValue | null>(null);

export function useExclusiveGate() {
  return React.useContext(ExclusiveCtx);
}
