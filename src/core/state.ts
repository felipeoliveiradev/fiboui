export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

let activeEffect: Effect | null = null;

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
    const prevEffect = activeEffect;
    activeEffect = this;
    try {
      this.cleanup();
      this.fn();
    } finally {
      activeEffect = prevEffect;
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
    const prevEffect = activeEffect;
    activeEffect = this as any;

    try {
      this.cleanup();
      return fn();
    } finally {
      activeEffect = prevEffect;
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
    if (activeEffect) {
      activeEffect.track(this);
    }
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

  private notify() {
    const effectsToRun = Array.from(this.effects);
    const listenersToRun = Array.from(this.listeners);

    effectsToRun.forEach(e => e.trigger());
    listenersToRun.forEach(l => l(this._value));
  }
}

export function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

export class ComputedSignal<T> implements Subscribable<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();
  private _value!: T;
  private _dirty = true;
  private internalEffect: Effect;

  constructor(private fn: () => T) {
    this.internalEffect = new Effect(() => {
      if (!this._dirty) {
        this._dirty = true;
        this.notify();
      }
    });
  }

  get value(): T {
    if (activeEffect) {
      activeEffect.track(this);
    }
    if (this._dirty) {
      const prevEffect = activeEffect;
      activeEffect = this.internalEffect;
      try {
        this.internalEffect.cleanup();
        this._value = this.fn();
        this._dirty = false;
      } finally {
        activeEffect = prevEffect;
      }
    }
    return this._value;
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
    const effectsToRun = Array.from(this.effects);
    const listenersToRun = Array.from(this.listeners);

    effectsToRun.forEach(e => e.trigger());
    listenersToRun.forEach(l => l(this._value));
  }
}

export function computed<T>(fn: () => T): ComputedSignal<T> {
  return new ComputedSignal(fn);
}

export class Observable<T> implements Subscribable<T> {
  private listeners = new Set<Listener<T>>();
  private effects = new Set<Effect>();

  constructor(private _value: T) { }

  get(): T {
    if (activeEffect) {
      activeEffect.track(this);
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
    if (activeEffect) {
      activeEffect.track(this);
    }
    return this.state;
  }

  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void {
    const next = typeof partial === 'function' ? (partial as any)(this.state) : partial;
    const newState = { ...this.state, ...next };

    if (this.state !== newState) {
      this.state = newState;
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
    Array.from(this.listeners).forEach(l => l(this.state));
  }
}

export function createStore<T>(initialState: T): Store<T> {
  return new StoreImpl(initialState);
}
