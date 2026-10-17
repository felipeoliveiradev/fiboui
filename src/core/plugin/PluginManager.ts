import { Token, Provider } from '../di/types';
import { container } from '../di/Container';
import type { FiboBuilder } from '../builder';
import { FiboContext, FiboPlugin, RouteDefinition, SidebarConfig } from './types';

interface PluginOwned {
  plugin: FiboPlugin;
  ctx: FiboContext;
  routes: RouteDefinition[];
  sidebarItems: SidebarConfig[];
  topbarActions: (() => FiboBuilder)[];
  overlays: (() => FiboBuilder)[];
  stores: Map<string, unknown>;
  serviceTokens: Token[];
}

function isThenable(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function';
}

/**
 * Client: process singleton via `getInstance()`.
 * SSR: wrap a request in `run()` for an isolated instance, or call `reset()`
 * between requests. `endSsrRequest()` also resets this manager when `window`
 * is missing (Node). FiboApp is `'use client'` and uninstalls on unmount.
 */
export class PluginManager implements FiboContext {
  private static instance: PluginManager;
  private static scopeStack: PluginManager[] = [];
  /** Shared across `run()` scopes — the DI container is process-wide. */
  private static serviceRefs = new Map<Token, number>();

  private plugins: Map<string, PluginOwned> = new Map();
  /** `setup()` in flight — not yet in `plugins`, so Map order stays completion/LIFO. */
  private installing = new Map<string, FiboPlugin>();
  private routes: RouteDefinition[] = [];
  private sidebarItems: SidebarConfig[] = [];
  private topbarActions: (() => FiboBuilder)[] = [];
  private overlays: (() => FiboBuilder)[] = [];
  private stores: Map<string, unknown> = new Map();
  private storeSeq = 0;

  private constructor() { }

  static getInstance(): PluginManager {
    const scoped = PluginManager.scopeStack[PluginManager.scopeStack.length - 1];
    if (scoped) return scoped;
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /** Isolated manager for one SSR request (or test). Client `getInstance()` is unchanged. */
  static run<T>(fn: () => T): T {
    const pm = new PluginManager();
    PluginManager.scopeStack.push(pm);
    let sync = true;
    const release = () => {
      const i = PluginManager.scopeStack.lastIndexOf(pm);
      if (i >= 0) PluginManager.scopeStack.splice(i, 1);
      pm.uninstallAllSafe();
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
  }

  /** Drop every plugin (runs teardown) and replace the process singleton. */
  static reset(): void {
    const seen = new Set<PluginManager>();
    const all = [...PluginManager.scopeStack, PluginManager.instance];
    PluginManager.scopeStack.length = 0;
    for (const inst of all) {
      if (!inst || seen.has(inst)) continue;
      seen.add(inst);
      inst.uninstallAllSafe();
    }
    PluginManager.instance = new PluginManager();
    PluginManager.serviceRefs.clear();
  }

  /** @see reset */
  static resetForTests(): void {
    PluginManager.reset();
  }

  has(name: string): boolean {
    return this.plugins.has(name) || this.installing.has(name);
  }

  use(plugin: FiboPlugin): this {
    if (!plugin?.name) {
      throw new Error('Plugin name is required');
    }
    const ownedExisting = this.plugins.get(plugin.name);
    if (ownedExisting) {
      if (ownedExisting.plugin !== plugin) {
        throw new Error(`Plugin "${plugin.name}" is already registered`);
      }
      return this;
    }
    const inFlight = this.installing.get(plugin.name);
    if (inFlight) {
      if (inFlight !== plugin) {
        throw new Error(`Plugin "${plugin.name}" is already registered`);
      }
      return this;
    }

    const owned = this.createOwned(plugin);
    this.installing.set(plugin.name, plugin);
    try {
      plugin.setup(owned.ctx);
    } catch (err) {
      this.dropOwned(owned);
      throw err;
    } finally {
      this.installing.delete(plugin.name);
    }
    this.plugins.set(plugin.name, owned);
    return this;
  }

  uninstall(name: string): boolean {
    const owned = this.plugins.get(name);
    if (!owned) return false;
    try {
      owned.plugin.teardown?.(owned.ctx);
    } finally {
      this.dropOwned(owned);
      this.plugins.delete(name);
    }
    return true;
  }

  private uninstallAllSafe(): void {
    const names = [...this.plugins.keys()].reverse();
    for (const name of names) {
      try {
        this.uninstall(name);
      } catch {
        // teardown threw; dropOwned already ran
      }
    }
  }

  private createOwned(plugin: FiboPlugin): PluginOwned {
    const owned: PluginOwned = {
      plugin,
      ctx: null as unknown as FiboContext,
      routes: [],
      sidebarItems: [],
      topbarActions: [],
      overlays: [],
      stores: new Map(),
      serviceTokens: [],
    };
    owned.ctx = {
      registerService: (token, implementation) => {
        this.registerService(token, implementation);
        owned.serviceTokens.push(token);
        PluginManager.serviceRefs.set(token, (PluginManager.serviceRefs.get(token) ?? 0) + 1);
      },
      registerStore: (store, name) => {
        const key = this.registerStoreKeyed(store, name);
        owned.stores.set(key, store);
      },
      getStore: (name) => this.getStore(name),
      registerRoute: (route) => {
        owned.routes.push(route);
        this.routes.push(route);
      },
      registerSidebarItem: (item) => {
        owned.sidebarItems.push(item);
        this.sidebarItems.push(item);
      },
      registerTopbarAction: (component) => {
        owned.topbarActions.push(component);
        this.topbarActions.push(component);
      },
      registerOverlay: (component) => {
        owned.overlays.push(component);
        this.overlays.push(component);
      },
    };
    return owned;
  }

  private dropOwned(owned: PluginOwned): void {
    this.routes = this.routes.filter((r) => !owned.routes.includes(r));
    this.sidebarItems = this.sidebarItems.filter((r) => !owned.sidebarItems.includes(r));
    this.topbarActions = this.topbarActions.filter((r) => !owned.topbarActions.includes(r));
    this.overlays = this.overlays.filter((r) => !owned.overlays.includes(r));
    for (const [key, value] of owned.stores) {
      if (this.stores.get(key) === value) this.stores.delete(key);
    }
    for (const token of owned.serviceTokens) {
      const n = (PluginManager.serviceRefs.get(token) ?? 1) - 1;
      if (n > 0) {
        PluginManager.serviceRefs.set(token, n);
        continue;
      }
      PluginManager.serviceRefs.delete(token);
      try {
        container.unregister(token);
      } catch {
        // dispose() threw; token is already dropped
      }
    }
  }

  registerService<T>(token: Token<T>, implementation: Provider<T>): void {
    container.register(token, implementation);
  }

  registerStore(store: unknown, name?: string): void {
    this.registerStoreKeyed(store, name);
  }

  private registerStoreKeyed(store: unknown, name?: string): string {
    const key = name ?? `store-${this.storeSeq++}`;
    this.stores.set(key, store);
    return key;
  }

  getStore<T = unknown>(name: string): T | undefined {
    return this.stores.get(name) as T | undefined;
  }

  getStores(): Map<string, unknown> {
    return new Map(this.stores);
  }

  registerRoute(route: RouteDefinition): void {
    this.routes.push(route);
  }

  registerSidebarItem(item: SidebarConfig): void {
    this.sidebarItems.push(item);
  }

  registerTopbarAction(component: () => FiboBuilder): void {
    this.topbarActions.push(component);
  }

  registerOverlay(component: () => FiboBuilder): void {
    this.overlays.push(component);
  }

  getRoutes(): RouteDefinition[] {
    return this.routes.slice();
  }

  getSidebarItems(): SidebarConfig[] {
    return this.sidebarItems.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getTopbarActions(): (() => FiboBuilder)[] {
    return this.topbarActions.slice();
  }

  getOverlays(): (() => FiboBuilder)[] {
    return this.overlays.slice();
  }
}
