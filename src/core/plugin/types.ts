import { Token, Provider } from '../di/types';
import type { FiboBuilder } from '../builder';

export interface RouteDefinition {
  path: string;
  component: () => FiboBuilder;
  meta?: Record<string, any>;
}

export interface SidebarConfig {
  label: string;
  icon?: any;
  path: string;
  order?: number;
}

export interface FiboContext {
  registerService<T>(token: Token<T>, implementation: Provider<T>): void;
  registerStore(store: unknown, name?: string): void;
  getStore?<T = unknown>(name: string): T | undefined;
  registerRoute(route: RouteDefinition): void;
  registerSidebarItem(item: SidebarConfig): void;
  registerTopbarAction(component: () => FiboBuilder): void;
  registerOverlay(component: () => FiboBuilder): void;
}

export type PluginSetup = (context: FiboContext) => void;

export interface FiboPlugin {
  name: string;
  version?: string;
  setup: PluginSetup;
  teardown?: PluginSetup;
}
