import React from 'react';
import { createRoot } from 'react-dom/client';
import { FiboPlugin } from './plugin/types';
import { PluginManager } from './plugin/PluginManager';
import { StateWrapper } from './StateWrapper';
import { ProviderWrapper } from './StateWrapper';

export class FiboAppBuilder {
  private _rootComponent: React.ComponentType | null = null;
  private _rootElement: HTMLElement | null = null;
  private _plugins: FiboPlugin[] = [];

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

  mount(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Root element with id "${elementId}" not found`);
    }
    this._rootElement = element;
    this.build();
  }

  private build(): void {
    if (!this._rootComponent || !this._rootElement) {
      throw new Error('Root component and mount element must be provided');
    }

    // Register all plugins
    const pluginManager = PluginManager.getInstance();
    this._plugins.forEach(plugin => {
      pluginManager.use(plugin);
    });

    const RootComponent = this._rootComponent;

    // We wrap the app with necessary providers
    // Note: This is an initial implementation. We might need to wrap with more providers later.
    const App = () => (
      React.createElement(StateWrapper, {
        stateMap: new Map(),
        children: React.createElement(ProviderWrapper, {
          providers: new Map(),
          children: React.createElement(RootComponent, null)
        })
      })
    );

    const root = createRoot(this._rootElement);
    root.render(React.createElement(App));
  }
}

export const FiboApp = () => new FiboAppBuilder();
