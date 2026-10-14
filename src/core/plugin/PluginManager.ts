import { Token, Provider } from '../di/types';
import { container } from '../di/Container';
import type { FiboBuilder } from '../builder';
import { FiboContext, FiboPlugin, RouteDefinition, SidebarConfig } from './types';

export class PluginManager implements FiboContext {
  private static instance: PluginManager;

  private plugins: Map<string, FiboPlugin> = new Map();
  private routes: RouteDefinition[] = [];
  private sidebarItems: SidebarConfig[] = [];
  private topbarActions: (() => FiboBuilder)[] = [];
  private overlays: (() => FiboBuilder)[] = [];
  private stores: Map<string, unknown> = new Map();
  private storeSeq = 0;

  private constructor() { }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  use(plugin: FiboPlugin): this {
    if (this.plugins.has(plugin.name)) {
      return this;
    }

    this.plugins.set(plugin.name, plugin);
    plugin.setup(this);
    return this;
  }

  registerService<T>(token: Token<T>, implementation: Provider<T>): void {
    container.register(token, implementation);
  }

  registerStore(store: unknown, name?: string): void {
    const key = name ?? `store-${this.storeSeq++}`;
    this.stores.set(key, store);
  }

  getStore<T = unknown>(name: string): T | undefined {
    return this.stores.get(name) as T | undefined;
  }

  getStores(): Map<string, unknown> {
    return this.stores;
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
    return this.routes;
  }

  getSidebarItems(): SidebarConfig[] {
    return this.sidebarItems.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getTopbarActions(): (() => FiboBuilder)[] {
    return this.topbarActions;
  }

  getOverlays(): (() => FiboBuilder)[] {
    return this.overlays;
  }
}
