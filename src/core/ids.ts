let sequence = 0;

/** Deterministic client-safe ids (no `Math.random()` remounts). */
export function nextStableId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function resetStableIds(): void {
  sequence = 0;
}
