import { Token, Provider, Constructor, Factory, ServiceMetadata, DIOptions } from './types';
import { getInjectionTokens, isInjectable, getInjectableOptions } from './decorators';

function isDisposable(value: unknown): value is { dispose: () => void } {
  return !!value && typeof value === 'object' && typeof (value as { dispose?: unknown }).dispose === 'function';
}

function isClassConstructor(fn: Function): boolean {
  if (isInjectable(fn)) return true;
  if (getInjectionTokens(fn as Constructor).length > 0) return true;
  try {
    return /^\s*class\b/.test(Function.prototype.toString.call(fn));
  } catch {
    return false;
  }
}

function disposeSafe(instance: unknown, errors: unknown[]): void {
  if (!instance || !isDisposable(instance)) return;
  try {
    instance.dispose();
  } catch (err) {
    errors.push(err);
  }
}

function rethrowDispose(errors: unknown[]): void {
  if (errors.length === 0) return;
  throw errors[0];
}

/** tsc `design:paramtypes` for primitives/interfaces — not DI tokens. */
function isNativeParamtype(token: unknown): boolean {
  return (
    token === Object ||
    token === String ||
    token === Number ||
    token === Boolean ||
    token === Function ||
    token === Array ||
    token === Symbol ||
    token === BigInt
  );
}

function isThenable(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function';
}

type Als<T> = {
  run<R>(store: T, callback: () => R): R;
  getStore(): T | undefined;
};

function nodeAls(): Als<DIContainer> | null {
  try {
    const proc = globalThis.process as
      | {
          versions?: { node?: string };
          getBuiltinModule?: (id: string) => { AsyncLocalStorage: new <T>() => Als<T> };
        }
      | undefined;
    if (!proc?.versions?.node || typeof proc.getBuiltinModule !== 'function') return null;
    const hooks = proc.getBuiltinModule('async_hooks');
    if (!hooks?.AsyncLocalStorage) return null;
    return new hooks.AsyncLocalStorage<DIContainer>();
  } catch {
    return null;
  }
}

const als = nodeAls();
const scopeStack: DIContainer[] = [];

export class DIContainer {
  private services = new Map<Token, ServiceMetadata>();
  private resolving = new Set<Token>();
  private static instance: DIContainer;

  static getInstance(): DIContainer {
    const fromAls = als?.getStore();
    if (fromAls) return fromAls;
    const fromStack = scopeStack[scopeStack.length - 1];
    if (fromStack) return fromStack;
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Isolated container for one SSR request (or test). Overlapping `run()`
   * callbacks do not share singleton instances. Process registrations are
   * forked without cached instances.
   */
  static run<T>(fn: () => T): T {
    const scoped = DIContainer.getInstance().fork();
    const invoke = (): T => {
      scopeStack.push(scoped);
      let sync = true;
      const release = () => {
        const i = scopeStack.lastIndexOf(scoped);
        if (i >= 0) scopeStack.splice(i, 1);
        try {
          scoped.clear();
        } catch {
          // dispose() threw; map already empty
        }
      };
      try {
        const result = fn();
        if (isThenable(result)) {
          sync = false;
          return result.then(
            (value) => {
              release();
              return value;
            },
            (err) => {
              release();
              throw err;
            },
          ) as T;
        }
        return result;
      } finally {
        if (sync) release();
      }
    };
    return als ? als.run(scoped, invoke) : invoke();
  }

  private fork(): DIContainer {
    const child = new DIContainer();
    for (const [token, meta] of this.services) {
      child.services.set(token, {
        token: meta.token,
        provider: meta.provider,
        singleton: meta.singleton,
      });
    }
    return child;
  }

  register<T>(
    token: Token<T>,
    provider: Provider<T>,
    options: DIOptions = {}
  ): void {
    if (this.services.has(token) && !options.override) {
      return;
    }

    const existing = this.services.get(token);
    const errors: unknown[] = [];
    if (existing && 'instance' in existing) {
      disposeSafe(existing.instance, errors);
    }

    this.services.set(token, {
      token,
      provider,
      singleton: options.singleton ?? false,
    });
    rethrowDispose(errors);
  }

  registerSingleton<T>(token: Token<T>, provider: Provider<T>): void {
    this.register(token, provider, { singleton: true });
  }

  resolve<T>(token: Token<T>): T {
    let metadata = this.services.get(token);

    if (!metadata && typeof token === 'function' && isInjectable(token)) {
      const opts = getInjectableOptions(token);
      this.register(token as Constructor, token as Constructor, opts);
      metadata = this.services.get(token);
    }

    if (!metadata) {
      throw new Error(`Service not found for token: ${String(token)}`);
    }

    if (metadata.singleton && 'instance' in metadata) {
      return metadata.instance as T;
    }

    if (this.resolving.has(token)) {
      const chain = [...this.resolving, token].map(String).join(' -> ');
      throw new Error(`Circular dependency: ${chain}`);
    }

    this.resolving.add(token);
    try {
      const instance = this.createInstance<T>(metadata.provider);
      if (metadata.singleton) {
        metadata.instance = instance;
      }
      return instance;
    } finally {
      this.resolving.delete(token);
    }
  }

  has(token: Token): boolean {
    return this.services.has(token);
  }

  unregister(token: Token): boolean {
    const metadata = this.services.get(token);
    if (!metadata) return false;
    const errors: unknown[] = [];
    if ('instance' in metadata) {
      disposeSafe(metadata.instance, errors);
    }
    this.services.delete(token);
    rethrowDispose(errors);
    return true;
  }

  clear(): void {
    const errors: unknown[] = [];
    for (const metadata of this.services.values()) {
      if ('instance' in metadata) {
        disposeSafe(metadata.instance, errors);
      }
    }
    this.services.clear();
    this.resolving.clear();
    rethrowDispose(errors);
  }

  private createInstance<T>(provider: Provider<T>): T {
    if (typeof provider !== 'function') {
      return provider as T;
    }

    if (isClassConstructor(provider)) {
      return this.construct(provider as Constructor<T>);
    }

    return (provider as Factory<T>)();
  }

  private construct<T>(Ctor: Constructor<T>): T {
    const injected = getInjectionTokens(Ctor);
    let paramtypes: unknown[] = [];
    try {
      paramtypes = (Reflect.getMetadata('design:paramtypes', Ctor) as unknown[]) || [];
    } catch {
      paramtypes = [];
    }
    const length = Math.max(Ctor.length, injected.length, paramtypes.length);
    const args: unknown[] = [];
    for (let i = 0; i < length; i++) {
      const inferred = paramtypes[i] as Token | undefined;
      const usableInferred =
        inferred !== undefined && !isNativeParamtype(inferred) ? inferred : undefined;
      const dep = injected[i] ?? usableInferred;
      if (dep === undefined) {
        if (i >= Ctor.length) {
          args.push(undefined);
          continue;
        }
        throw new Error(`Cannot resolve parameter ${i} of ${Ctor.name || 'anonymous'}`);
      }
      args.push(this.resolve(dep));
    }
    return new Ctor(...args);
  }
}

/** Always the current `run()` scope (or the process singleton). */
export const container: DIContainer = new Proxy({} as DIContainer, {
  get(_target, prop) {
    const inst = DIContainer.getInstance();
    const value = Reflect.get(inst, prop, inst);
    return typeof value === 'function' ? (value as Function).bind(inst) : value;
  },
});

// Node SSR: endSsrRequest → PluginManager.reset() (no window). Drop process
// singletons so request N does not inherit N-1. After teardown so it cannot re-seed.
void import('../plugin/PluginManager')
  .then(({ PluginManager }) => {
    if (typeof PluginManager?.reset !== 'function' || typeof PluginManager?.run !== 'function') {
      return;
    }
    const origReset = PluginManager.reset.bind(PluginManager);
    PluginManager.reset = () => {
      origReset();
      try {
        container.clear();
      } catch {
        // dispose() threw; services already dropped
      }
    };

    const origRun = PluginManager.run.bind(PluginManager);
    PluginManager.run = (<T>(fn: () => T): T =>
      DIContainer.run(() => origRun(fn))) as typeof PluginManager.run;
  })
  .catch(() => undefined);
