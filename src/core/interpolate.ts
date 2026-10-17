import type { BindableSignal } from './state';

const MARK_START = '\uE000FIBO:';
const MARK_END = '\uE001';
const MARK_RE = /\uE000FIBO:(\d+)\uE001/g;

const slots: BindableSignal<unknown>[] = [];
const slotIds = new WeakMap<BindableSignal<unknown>, number>();

function alloc(signal: BindableSignal<unknown>): string {
  const existing = slotIds.get(signal);
  if (existing !== undefined) {
    return `${MARK_START}${existing}${MARK_END}`;
  }
  const id = slots.length;
  slots.push(signal);
  slotIds.set(signal, id);
  return `${MARK_START}${id}${MARK_END}`;
}

/** Test hook: how many interp slots are allocated. */
export function interpSlotCount(): number {
  return slots.length;
}

function asInterpText(text: unknown): string {
  if (typeof text === 'string') return text;
  if (text == null) return '';
  return String(text);
}

function replaceMarks(text: string): string {
  // Fresh /g regex: nested resolveInterpString must not share lastIndex.
  return text.replace(/\uE000FIBO:(\d+)\uE001/g, (_full, id: string) => {
    const sig = slots[Number(id)];
    return sig == null ? '' : String(sig.value);
  });
}

/** True when a string was built with `interp(...)` / `$length` tokens. */
export function hasInterpMarks(text: unknown): boolean {
  const value = asInterpText(text);
  return value.includes(MARK_START);
}

export function collectInterpSignals(text: string): BindableSignal<unknown>[] {
  const out: BindableSignal<unknown>[] = [];
  for (const match of asInterpText(text).matchAll(MARK_RE)) {
    const sig = slots[Number(match[1])];
    if (sig) out.push(sig);
  }
  return out;
}

const MAX_RESOLVE_DEPTH = 16;

/** Resolve markers to current signal values (for FineGrainText). */
export function resolveInterpString(text: string): string {
  let out = asInterpText(text);
  for (let i = 0; i < MAX_RESOLVE_DEPTH; i++) {
    if (!out.includes(MARK_START)) return out;
    const next = replaceMarks(out);
    if (next === out) return out;
    out = next;
  }
  return out;
}

/**
 * Wrap a signal so `` `…${interp(sig)}` `` embeds a reactive marker
 * instead of freezing `String(sig.value)` immediately.
 *
 * Returns a primitive string (the marker). Callers that check
 * `typeof x === 'string'` then `hasInterpMarks(x)` must see it.
 */
export function interp<T>(signal: BindableSignal<T>): string {
  return String(new InterpToken(signal));
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
