import { noteFiboDev } from './devStats';
import { takeFormula, type CompiledFormula } from './formula';
import { warnDev } from './warn';

export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

/** Isolated reactive graph for one React root / test / island. */
export class ReactivityScope {
  activeEffect: Effect | Tracker | null = null;
}

const defaultScope = new ReactivityScope();
const scopeStack: ReactivityScope[] = [defaultScope];

export function createReactivityRoot(): ReactivityScope {
  return new ReactivityScope();
}

export function getCurrentScope(): ReactivityScope {
  return scopeStack[scopeStack.length - 1] ?? defaultScope;
}

export function getActiveEffect(): Effect | Tracker | null {
  return getCurrentScope().activeEffect;
}

export function runInScope<T>(scope: ReactivityScope, fn: () => T): T {
  scopeStack.push(scope);
  try {
    return fn();
  } finally {
    scopeStack.pop();
  }
}

function pushActive(effect: Effect | Tracker | null): Effect | Tracker | null {
  const scope = getCurrentScope();
  const prev = scope.activeEffect;
  scope.activeEffect = effect;
  return prev;
}

export interface Subscribable<T> {
  subscribe(listener: Listener<T>): Unsubscribe;
  subscribeEffect(effect: Effect): void;
  unsubscribeEffect(effect: Effect): void;
}

/** Anything `.bindSignal()` can subscribe to (`Signal` or `ComputedSignal`). */
export interface BindableSignal<T = unknown> {
  readonly value: T;
  subscribe(listener: Listener<T>): Unsubscribe;
}

export class Effect {
  private dependencies = new Set<Subscribable<any>>();
  private _onDispose?: () => void;

  constructor(private fn: () => void) {
    this.run();
  }

  run() {
    const prevEffect = pushActive(this);
    try {
      this.cleanup();
      this.fn();
    } finally {
      pushActive(prevEffect);
    }
  }

  track(dep: Subscribable<any>) {
    this.dependencies.add(dep);
    dep.subscribeEffect(this);
  }

  trigger() {
    this.run();
  }

  cleanup() {
    this.dependencies.forEach(dep => dep.unsubscribeEffect(this));
    this.dependencies.clear();
  }

  dispose() {
    this.cleanup();
    this._onDispose?.();
  }
}

export class Tracker {
  private dependencies = new Set<Subscribable<any>>();

  constructor(private _onInvalidate: () => void) { }

  execute<T>(fn: () => T): T {
    const prevEffect = pushActive(this);

    try {
      this.cleanup();
      return fn();
    } finally {
      pushActive(prevEffect);
    }
  }

  track(dep: Subscribable<any>) {
    this.dependencies.add(dep);
    dep.subscribeEffect(this as any);
  }

  trigger() {
    this._onInvalidate();
  }

  cleanup() {
    this.dependencies.forEach(dep => dep.unsubscribeEffect(this as any));
    this.dependencies.clear();
  }

  dispose() {
    this.cleanup();
  }
}

export class Signal<T> implements Subscribable<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();
  private readonly _initial: T;

  constructor(private _value: T) {
    this._initial = _value;
  }

  get value(): T {
    const active = getActiveEffect();
    if (active) {
      active.track(this);
    }
    noteSignalRead(this);
    return this._value;
  }

  /** Current value without tracking. Replays use this so a node does not subscribe twice. */
  peek(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }

  /** Replace the value. Same notify path as `.value = next`. */
  set(next: T): this {
    this.value = next;
    return this;
  }

  /**
   * Write a value, or an updater `(prev) => next`.
   * Function-valued signals should use `.set()` / `.value =` so the function is stored, not called.
   * Not named `update`: `listSignal.update(id, patch)` is the item patch.
   */
  change(next: T | ((prev: T) => T)): this {
    const value = typeof next === 'function' ? (next as (prev: T) => T)(this._value) : next;
    this.value = value;
    return this;
  }

  /** Restore the value passed to `signal(initial)`. */
  reset(): this {
    this.value = this._initial;
    return this;
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeEffect(effect: Effect) {
    this.effects.add(effect);
  }

  unsubscribeEffect(effect: Effect) {
    this.effects.delete(effect);
  }

  private _notifyDepth = 0;

  private notify() {
    // Guard against effect(() => { n.value = n.value + 1 }) stack overflow.
    if (this._notifyDepth > 32) {
      if (typeof console !== 'undefined') {
        console.error('[fiboui] Signal update loop detected — aborting notify');
      }
      return;
    }
    this._notifyDepth += 1;
    try {
      const effectsToRun = Array.from(this.effects);
      const listenersToRun = Array.from(this.listeners);

      effectsToRun.forEach((e) => e.trigger());
      listenersToRun.forEach((l) => l(this._value));
    } finally {
      this._notifyDepth -= 1;
    }
  }
}

/** A sentence split into fixed text and the signals that filled it. */
export type LivePart =
  | string
  | Subscribable<unknown>
  | { signal: Subscribable<unknown>; format: (value: unknown) => string };

function isFormattedPart(
  part: LivePart,
): part is { signal: Subscribable<unknown>; format: (value: unknown) => string } {
  return (
    !!part
    && typeof part === 'object'
    && 'signal' in part
    && 'format' in part
    && typeof (part as { format?: unknown }).format === 'function'
  );
}

/** Remember how the last pending signal was printed (`Format.fixed`, …). */
export function notePendingFormat(format: (value: unknown) => string): void {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return;
  frame.formats.set(frame.pending[frame.pending.length - 1], format);
}

function sampleFor(signal: Subscribable<unknown>): string {
  const raw = readValue(signal);
  const format = buildFrame?.formats.get(signal);
  return format ? format(raw) : String(raw);
}

function partFor(signal: Subscribable<unknown>): LivePart {
  const format = buildFrame?.formats.get(signal);
  if (format) {
    buildFrame?.formats.delete(signal);
    return { signal, format };
  }
  return signal;
}

/** DOM text written in place when a template reads a signal. The host stays mounted. */
export type LiveSlot = {
  node: HTMLElement | null;
  value: string;
  next: string;
  signals: Subscribable<unknown>[];
  /** Pieces of the sentence. Null when the string cannot be split safely. */
  parts: LivePart[] | null;
  unsubs?: Unsubscribe[];
  wired?: Subscribable<unknown>[];
};

type BuildOwner = {
  _isObserver?: boolean;
  _ownsReads?: boolean;
  _signals?: { size: number };
};

export type BuildOutcome = {
  /** A read landed on layout or a branch, so the host tree must commit. */
  layout: boolean;
  shape: string;
  slotCount: number;
  /** Reads no single node could replay. The page function owns these. */
  roots: Subscribable<unknown>[];
};

type WireHost = {
  adoptWire?: (signals: Subscribable<unknown>[], replay: () => void) => void;
};

type BuildFrame = {
  cells: any[];
  index: number;
  pending: Subscribable<unknown>[];
  layout: boolean;
  shape: string[];
  slots: LiveSlot[];
  slotIndex: number;
  owner: BuildOwner | null;
  roots: Subscribable<unknown>[];
  formulas: CompiledFormula[];
  formulaCursor: number;
  /** `Format.fixed(sig)` (and friends) attach a printer to the last pending read. */
  formats: Map<Subscribable<unknown>, (value: unknown) => string>;
};

let buildFrame: BuildFrame | null = null;

export function inBuildFrame(): boolean {
  return buildFrame != null;
}

function noteSignalRead(signal: Subscribable<unknown>) {
  buildFrame?.pending.push(signal);
}

function readValue(signal: Subscribable<unknown>): unknown {
  const peeked = signal as { peek?: () => unknown; value?: unknown };
  if (typeof peeked.peek === 'function') return peeked.peek();
  return peeked.value;
}

/**
 * Split `result` on the values that were just read, left to right.
 * Each value must appear once in what remains, so "Pontos 0" becomes
 * ["Pontos ", signal, ""] and "0 pontos: 0" is left to the page function.
 * `Format.fixed(sig)` prints the formatted sample so `€ 1.50` still splits.
 */
export function compileParts(result: string, signals: Subscribable<unknown>[]): LivePart[] | null {
  if (signals.length === 0) return null;
  let rest = result;
  const parts: LivePart[] = [];
  for (const signal of signals) {
    const sample = sampleFor(signal);
    if (sample.length === 0) return null;
    let count = 0;
    let at = -1;
    let from = 0;
    while (from <= rest.length) {
      const found = rest.indexOf(sample, from);
      if (found < 0) break;
      if (count === 0) at = found;
      count += 1;
      if (count > 1) return null;
      from = found + sample.length;
    }
    if (count !== 1 || at < 0) return null;
    const after = rest[at + sample.length];
    if (
      after !== undefined
      && /\d/.test(after)
      && /^-?\d/.test(sample)
    ) {
      return null;
    }
    parts.push(rest.slice(0, at));
    parts.push(partFor(signal));
    rest = rest.slice(at + sample.length);
  }
  parts.push(rest);
  return parts;
}

/** Join a sentence from its pieces, reading each signal now. */
export function renderParts(parts: LivePart[]): string {
  let out = '';
  for (const part of parts) {
    if (typeof part === 'string') {
      out += part;
    } else if (isFormattedPart(part)) {
      out += part.format(readValue(part.signal));
    } else {
      out += String(readValue(part));
    }
  }
  return out;
}

function rememberRoot(frame: BuildFrame, signal: Subscribable<unknown>) {
  frame.layout = true;
  if (!frame.roots.includes(signal)) {
    frame.roots.push(signal);
    noteFiboDev('pageRoot');
    warnDev(
      'page-root',
      'A signal became a page root. The page function will run again on each change. ' +
        'Put the read on Text/Button (`Text(`${n.value}`)`) or on a fluent method ' +
        '(`Box().width(n.value)`), use computed() for formatting, or wrap the branch in .observer().',
    );
  }
}

/**
 * A fluent call consumed the reads in its arguments.
 * Direct `method(signal.value)` and a string built from those reads
 * (`method(\`${signal.value}px\`)`, `Text(\`Menu ${signal.value}\`)`)
 * replay on that node. `method(signal.value + 1)` stays on the function
 * that wrote the formula.
 */
export function claimSignalReads(
  owner: object,
  args: unknown[],
  replay: (next: unknown[]) => void,
  method?: string,
): void {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return;
  const reads = frame.pending.slice();
  frame.pending = [];
  const host = owner as WireHost;
  const direct =
    reads.length === args.length &&
    reads.every((signal, index) => Object.is(readValue(signal), args[index]));
  if (direct && host.adoptWire) {
    host.adoptWire(reads, () => replay(reads.map(readValue)));
    return;
  }
  if (args.length === 1 && typeof args[0] === 'string' && host.adoptWire) {
    const parts = compileParts(args[0], reads);
    if (parts) {
      host.adoptWire(reads, () => replay([renderParts(parts)]));
      return;
    }
    // Inside .observer() / .bindSignal() the branch already owns the read.
    // A border/color string that only used the value for a choice is fine —
    // do not warn or promote it to a page root.
    if (ownerTracksItself(frame.owner)) return;
    warnDev(
      'string-parts',
      'Could not split a string onto its signals (ambiguous or formatted value). ' +
        'Use Format.fixed(sig), computed(() => …), or Text().bindSignal(sig, v => …).',
    );
  }
  if (method && args.length === 1 && host.adoptWire) {
    const readable = reads as Array<{ peek?: () => unknown; value?: unknown }>;
    const hit = takeFormula(frame.formulas, frame.formulaCursor, method, readable, args[0]);
    if (hit) {
      frame.formulaCursor = hit.next;
      const evalFormula = hit.eval;
      host.adoptWire(reads, () => replay([evalFormula(readable)]));
      return;
    }
  }
  if (ownerTracksItself(frame.owner)) return;
  for (const signal of reads) rememberRoot(frame, signal);
}

/** A fluent call that is not `Text`/`Button` text consumed the read. */
export function flushSignalReads() {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return;
  for (const signal of frame.pending) rememberRoot(frame, signal);
  frame.pending = [];
}

export function noteBuilder(name: string) {
  buildFrame?.shape.push(name);
}

function ownerTracksItself(owner: BuildOwner | null): boolean {
  if (!owner) return false;
  if (owner._isObserver) return true;
  return owner._ownsReads === true;
}

/**
 * Run `build()` as `owner` so a read inside `.observer()` / `.bindSignal()`
 * stays on that builder. The page does not subscribe to it.
 *
 * If an observer / bindSignal owner is already active, keep it. A nested
 * `Button().border(...)` must not steal that ownership — otherwise a string
 * that only used the value for a choice warns and looks like a page root.
 */
export function withBuildOwner<T>(owner: object, fn: () => T): T {
  const host = owner as BuildOwner;
  const frame = buildFrame;
  if (!frame) return fn();
  const prev = frame.owner;
  if (ownerTracksItself(prev) && prev !== host) {
    return fn();
  }
  const pendingStart = frame.pending.length;
  const rootStart = frame.roots.length;
  frame.owner = host;
  try {
    return fn();
  } finally {
    if (ownerTracksItself(host)) {
      frame.pending.splice(pendingStart);
      frame.roots.splice(rootStart);
    }
    frame.owner = prev;
  }
}

/**
 * `Text(\`Menu ${count.value}\`)` at the page root — the read already happened.
 * A read inside `.observer()` or `.bindSignal()` is not a page slot: that
 * builder already re-renders its own branch.
 */
export function allocLiveSlot(next: string): LiveSlot | null {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return null;
  const signals = frame.pending.slice();
  frame.pending = [];
  if (ownerTracksItself(frame.owner)) return null;
  const index = frame.slotIndex;
  frame.slotIndex += 1;
  const parts = compileParts(next, signals);
  if (!parts) {
    warnDev(
      'live-slot-parts',
      'Text/Button template could not own its signals. Prefer Format.fixed(sig), ' +
        'computed(() => …), or Text().bindSignal(sig, v => …).',
    );
  }
  let slot = frame.slots[index];
  if (!slot) {
    slot = { node: null, value: next, next, signals, parts };
    frame.slots[index] = slot;
  } else {
    slot.next = next;
    slot.signals = signals;
    slot.parts = parts;
  }
  return slot;
}

/** Write changed strings. Returns false when a host is not mounted yet. */
export function paintLiveSlots(slots: LiveSlot[], count: number): boolean {
  for (let i = 0; i < count; i++) {
    const slot = slots[i];
    if (!slot?.node) return false;
    if (slot.value === slot.next) continue;
    const children = slot.node.childNodes;
    let wrote = false;
    for (let c = 0; c < children.length; c++) {
      const child = children[c];
      if (child.nodeType === 3) {
        child.nodeValue = slot.next;
        wrote = true;
        break;
      }
    }
    if (!wrote) return false;
    slot.value = slot.next;
  }
  return true;
}

/** Reuse `signal()` / `computed()` created while `page()` is building. */
export function runBuildFrame<T>(
  cells: any[],
  slots: LiveSlot[],
  fn: () => T,
  formulas: CompiledFormula[] = [],
): { result: T; outcome: BuildOutcome } {
  noteFiboDev('produce');
  const frame: BuildFrame = {
    cells,
    index: 0,
    pending: [],
    layout: false,
    shape: [],
    slots,
    slotIndex: 0,
    owner: null,
    roots: [],
    formulas,
    formulaCursor: 0,
    formats: new Map(),
  };
  const prev = buildFrame;
  buildFrame = frame;
  try {
    const result = fn();
    if (frame.pending.length > 0) {
      frame.layout = true;
      for (const signal of frame.pending) {
        if (!frame.roots.includes(signal)) {
          frame.roots.push(signal);
          noteFiboDev('pageRoot');
          warnDev(
            'page-root',
            'A signal became a page root. The page function will run again on each change. ' +
              'Put the read on Text/Button (`Text(`${n.value}`)`) or on a fluent method ' +
              '(`Box().width(n.value)`), use computed() for formatting, or wrap the branch in .observer().',
          );
        }
      }
      frame.pending = [];
    }
    return {
      result,
      outcome: {
        layout: frame.layout,
        shape: frame.shape.join('\n') + '#' + frame.slotIndex,
        slotCount: frame.slotIndex,
        roots: frame.roots,
      },
    };
  } finally {
    buildFrame = prev;
  }
}

function slotCell<T>(create: () => T): T {
  const frame = buildFrame;
  if (!frame) return create();
  const index = frame.index;
  frame.index += 1;
  const existing = frame.cells[index] as T | undefined;
  if (existing) return existing;
  const created = create();
  frame.cells[index] = created;
  return created;
}

export function signal<T>(initialValue: T): Signal<T> {
  return slotCell(() => new Signal(initialValue));
}

export class ComputedSignal<T> implements Subscribable<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();
  private _value!: T;
  private _dirty = true;
  private _disposed = false;
  private _ready = false;
  private _hasValue = false;
  private _computing = false;
  private internalEffect: Effect;

  constructor(private fn: () => T) {
    this.internalEffect = new Effect(() => {
      if (this._disposed || !this._ready || this._computing) {
        return;
      }
      this._computing = true;
      try {
        const next = this.fn();
        const hadValue = this._hasValue;
        const prev = this._value;
        this._value = next;
        this._dirty = false;
        this._hasValue = true;
        if (hadValue && next !== prev) {
          this.notify();
        }
      } finally {
        this._computing = false;
      }
    });
  }

  /** Current value without tracking and without joining the page frame. */
  peek(): T {
    return this._value;
  }

  get value(): T {
    if (this._disposed) {
      return this._value;
    }
    const active = getActiveEffect();
    if (active && active !== this.internalEffect) {
      active.track(this);
    }
    noteSignalRead(this);
    if (this._computing) {
      return this._value;
    }
    if (this._dirty || !this._ready) {
      this._ready = true;
      const frame = buildFrame;
      const mark = frame ? frame.pending.length : 0;
      this.internalEffect.run();
      // Dependencies belong to this computed. The page only saw `left`.
      if (frame) frame.pending.splice(mark);
    }
    return this._value;
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    if (!this._disposed) {
      void this.value;
    }
    return () => this.listeners.delete(listener);
  }

  subscribeEffect(effect: Effect) {
    this.effects.add(effect);
  }

  unsubscribeEffect(effect: Effect) {
    this.effects.delete(effect);
  }

  /** Drop the internal effect and freeze the last evaluated value. */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this.internalEffect.dispose();
    this.listeners.clear();
    this.effects.clear();
  }

  private _notifyDepth = 0;

  private notify() {
    if (this._disposed) {
      return;
    }
    if (this._notifyDepth > 32) {
      if (typeof console !== 'undefined') {
        console.error('[fiboui] ComputedSignal update loop detected — aborting notify');
      }
      return;
    }
    this._notifyDepth += 1;
    try {
      const effectsToRun = Array.from(this.effects);
      const listenersToRun = Array.from(this.listeners);

      effectsToRun.forEach((e) => e.trigger());
      listenersToRun.forEach((l) => l(this._value));
    } finally {
      this._notifyDepth -= 1;
    }
  }
}

export function computed<T>(fn: () => T): ComputedSignal<T> {
  return slotCell(() => new ComputedSignal(fn));
}

export class Observable<T> implements Subscribable<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();

  constructor(private _value: T) { }

  get(): T {
    const active = getActiveEffect();
    if (active) {
      active.track(this);
    }
    return this._value;
  }

  set(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeEffect(effect: Effect) {
    this.effects.add(effect);
  }

  unsubscribeEffect(effect: Effect) {
    this.effects.delete(effect);
  }

  private notify() {
    Array.from(this.effects).forEach(e => e.trigger());
    Array.from(this.listeners).forEach(l => l(this._value));
  }
}

export function observable<T>(initialValue: T): Observable<T> {
  return new Observable(initialValue);
}

export interface Store<T> extends Subscribable<T> {
  getState(): T;
  setState(fn: Partial<T> | ((state: T) => Partial<T>)): void;
}

export class StoreImpl<T> implements Store<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();

  constructor(private state: T) { }

  getState(): T {
    const active = getActiveEffect();
    if (active) {
      active.track(this);
    }
    return this.state;
  }

  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void {
    const next = typeof partial === 'function' ? (partial as (state: T) => Partial<T>)(this.state) : partial;
    const newState = { ...this.state, ...next };

    const prevKeys = Object.keys(this.state as object) as (keyof T)[];
    const nextKeys = Object.keys(newState as object) as (keyof T)[];
    const unchanged =
      prevKeys.length === nextKeys.length &&
      nextKeys.every((key) => Object.is(newState[key], this.state[key]));

    if (unchanged) {
      return;
    }

    this.state = newState;
    this.notify();
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeEffect(effect: Effect) {
    this.effects.add(effect);
  }

  unsubscribeEffect(effect: Effect) {
    this.effects.delete(effect);
  }

  private notify() {
    Array.from(this.effects).forEach(e => e.trigger());
    Array.from(this.listeners).forEach(l => l(this.state));
  }
}

export function createStore<T>(initialState: T): Store<T> {
  return new StoreImpl(initialState);
}
