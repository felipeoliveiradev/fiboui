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

  constructor(private _value: T) { }

  get value(): T {
    const active = getActiveEffect();
    if (active) {
      active.track(this);
    }
    noteSignalRead(this);
    return this._value;
  }

  set value(newValue: T) {
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

/** DOM text written in place when a template reads a signal. The host stays mounted. */
export type LiveSlot = {
  node: HTMLElement | null;
  value: string;
  next: string;
};

export type BuildOutcome = {
  /** A read landed on layout or a branch, so the host tree must commit. */
  layout: boolean;
  shape: string;
  slotCount: number;
};

type BuildFrame = {
  cells: any[];
  index: number;
  pending: Subscribable<unknown>[];
  layout: boolean;
  shape: string[];
  slots: LiveSlot[];
  slotIndex: number;
};

let buildFrame: BuildFrame | null = null;

export function inBuildFrame(): boolean {
  return buildFrame != null;
}

function noteSignalRead(signal: Subscribable<unknown>) {
  buildFrame?.pending.push(signal);
}

/** A fluent call that is not `Text`/`Button` text consumed the read. */
export function flushSignalReads() {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return;
  frame.layout = true;
  frame.pending = [];
}

export function noteBuilder(name: string) {
  buildFrame?.shape.push(name);
}

/**
 * `Text(\`Menu ${count.value}\`)` — the read already happened in the argument.
 * Reuse the slot so the next build writes the text node and skips React.
 */
export function allocLiveSlot(next: string): LiveSlot | null {
  const frame = buildFrame;
  if (!frame || frame.pending.length === 0) return null;
  frame.pending = [];
  const index = frame.slotIndex;
  frame.slotIndex += 1;
  let slot = frame.slots[index];
  if (!slot) {
    slot = { node: null, value: next, next };
    frame.slots[index] = slot;
  } else {
    slot.next = next;
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
  fn: () => T
): { result: T; outcome: BuildOutcome } {
  const frame: BuildFrame = {
    cells,
    index: 0,
    pending: [],
    layout: false,
    shape: [],
    slots,
    slotIndex: 0,
  };
  const prev = buildFrame;
  buildFrame = frame;
  try {
    const result = fn();
    if (frame.pending.length > 0) frame.layout = true;
    return {
      result,
      outcome: {
        layout: frame.layout,
        shape: frame.shape.join('\n') + '#' + frame.slotIndex,
        slotCount: frame.slotIndex,
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
      this.internalEffect.run();
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
