'use client';

import React, { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FiboPlugin } from './plugin/types';
import { PluginManager } from './plugin/PluginManager';
import { StateWrapper, ProviderWrapper } from './StateWrapper';
import { ReactivityRoot } from './ReactivityRoot';

export class FiboAppBuilder {
  private _rootComponent: React.ComponentType | null = null;
  private _rootElement: HTMLElement | null = null;
  private _plugins: FiboPlugin[] = [];
  private _reactRoot: Root | null = null;
  private _installed: string[] = [];

  use(plugin: FiboPlugin): this {
    this._plugins.push(plugin);
    return this;
  }

  plugins(pluginsList: FiboPlugin[]): this {
    this._plugins.push(...pluginsList);
    return this;
  }

  root(component: React.ComponentType): this {
    this._rootComponent = component;
    return this;
  }

  mount(elementId: string, options?: { strict?: boolean }): () => void {
    const doc = globalThis.document;
    if (typeof globalThis.window === 'undefined' || !globalThis.window || !doc?.getElementById) {
      return () => undefined;
    }
    const id = elementId.startsWith('#') ? elementId.slice(1) : elementId;
    const element = id ? doc.getElementById(id) : null;
    if (!element) {
      throw new Error(`Root element with id "${elementId}" not found`);
    }
    this._rootElement = element;
    this.build(options);
    return () => this.unmount();
  }

  unmount(): void {
    this._reactRoot?.unmount();
    this._reactRoot = null;
    const pm = PluginManager.getInstance();
    const names = this._installed.splice(0).reverse();
    for (const name of names) {
      try {
        pm.uninstall(name);
      } catch {
        // teardown threw; PluginManager already dropped the plugin
      }
    }
  }

  private build(options?: { strict?: boolean }): void {
    if (!this._rootComponent || !this._rootElement) {
      throw new Error('Root component and mount element must be provided');
    }

    this.unmount();

    const pluginManager = PluginManager.getInstance();
    try {
      for (const plugin of this._plugins) {
        const existed = pluginManager.has(plugin.name);
        pluginManager.use(plugin);
        if (!existed && pluginManager.has(plugin.name)) {
          this._installed.push(plugin.name);
        }
      }

      const RootComponent = this._rootComponent;
      const stores = pluginManager.getStores();

      const App = () => (
        React.createElement(ReactivityRoot, {
          children: React.createElement(StateWrapper, {
            stateMap: stores,
            children: React.createElement(ProviderWrapper, {
              providers: stores,
              children: React.createElement(RootComponent, null)
            })
          })
        })
      );

      this._reactRoot = createRoot(this._rootElement);
      const tree = React.createElement(App);
      this._reactRoot.render(
        options?.strict === false ? tree : React.createElement(StrictMode, null, tree)
      );
    } catch (err) {
      this.unmount();
      throw err;
    }
  }
}

export const FiboApp = () => new FiboAppBuilder();
