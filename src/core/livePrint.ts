import { notePendingFormat, type BindableSignal } from './state';

export type NumericInput = number | BindableSignal<number>;

export function readNumeric(value: NumericInput): number {
  if (typeof value === 'number') return value;
  if (value != null && typeof value === 'object' && 'value' in value) {
    return Number((value as { value: number }).value);
  }
  return Number(value);
}

/**
 * Read a signal (or plain number), register how it prints, return that string.
 * Used by `Format`, `Unit`, `Plural` so `Text(\`…\`)` stays live on that node.
 */
export function livePrint(value: NumericInput, print: (n: number) => string): string {
  const n = readNumeric(value);
  const format = (raw: unknown) => print(Number(raw));
  notePendingFormat(format);
  return format(n);
}
