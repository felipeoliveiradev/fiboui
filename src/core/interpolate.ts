import type { BindableSignal } from './state';

const MARK_START = '\uE000FIBO:';
const MARK_END = '\uE001';
const MARK_RE = /\uE000FIBO:(\d+)\uE001/g;

const slots: BindableSignal<unknown>[] = [];

function alloc(signal: BindableSignal<unknown>): string {
  const id = slots.length;
  slots.push(signal);
  return `${MARK_START}${id}${MARK_END}`;
}

/** True when a string was built with `interp(...)` / `$length` tokens. */
export function hasInterpMarks(text: string): boolean {
  return text.includes(MARK_START);
}

export function collectInterpSignals(text: string): BindableSignal<unknown>[] {
  const out: BindableSignal<unknown>[] = [];
  for (const match of text.matchAll(MARK_RE)) {
    const sig = slots[Number(match[1])];
    if (sig) out.push(sig);
  }
  return out;
}

/** Resolve markers to current signal values (for FineGrainText). */
export function resolveInterpString(text: string): string {
  return text.replace(MARK_RE, (_full, id: string) => {
    const sig = slots[Number(id)];
    return sig == null ? '' : String(sig.value);
  });
}

/**
 * Wrap a signal so `` `…${interp(sig)}` `` embeds a reactive marker
 * instead of freezing `String(sig.value)` immediately.
 */
export function interp<T>(signal: BindableSignal<T>): string {
  // Returned as string-like via toString when coerced in templates.
  // We return a String object so template ToString picks up our method.
  return new InterpToken(signal) as unknown as string;
}

class InterpToken {
  constructor(private readonly signal: BindableSignal<unknown>) {}

  toString(): string {
    return alloc(this.signal);
  }

  valueOf(): string {
    return this.toString();
  }

  [Symbol.toPrimitive](): string {
    return this.toString();
  }
}
