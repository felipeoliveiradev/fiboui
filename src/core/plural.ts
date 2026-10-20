import { livePrint, type NumericInput } from './livePrint';

/**
 * Count + word for live labels.
 *
 * ```ts
 * Text(Plural.of(count, 'task', 'tasks'))  // "1 task" / "3 tasks"
 * Text(Plural.of(left, 'left', 'left'))    // "2 left"
 * ```
 */
export const Plural = {
  /**
   * `"N word"` — uses `one` when the absolute count is 1, otherwise `many`.
   */
  of(count: NumericInput, one: string, many: string): string {
    return livePrint(count, (n) => {
      const word = Math.abs(n) === 1 ? one : many;
      return `${n} ${word}`;
    });
  },

  /** Only the word: `Plural.word(count, 'item', 'items')` → `"items"`. */
  word(count: NumericInput, one: string, many: string): string {
    return livePrint(count, (n) => (Math.abs(n) === 1 ? one : many));
  },
} as const;
