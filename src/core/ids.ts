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
