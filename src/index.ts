export * from './core';
export * from './theme';
export * from './layout';
export * from './content';
export * from './interactive';
export * from './structure';
export * from './navigation';

export { Component, Page, getRegisteredRoutes, clearRoutes, registerRoute } from './decorators';
export { Inject, useInject, OnMount, OnUnmount, BeforeMount, OnUpdate, BeforeUnmount, OnError } from './decorators';
export { getSignals, initializeSignals } from './decorators';
export { Store, useStore, getStore, clearStores, isStore } from './state';
export { persist, clearPersistedState, getPersistedState, storageAdapters } from './state';
export type { PersistOptions, StorageAdapter } from './state';

export { DIContainer, container, Injectable } from './core/di';
export { Inject as InjectDI } from './core/di';
export type { Token, Provider, Constructor, Factory, DIOptions } from './core/di';

export { Signal, computed, ComputedSignal } from './core/state';

export { PseudoStateBuilder } from './core/PseudoStateBuilder';

export { FiboApp, FiboAppBuilder } from './core/FiboApp';
export { PluginManager } from './core/plugin/PluginManager';
export type { FiboPlugin, FiboContext, RouteDefinition, SidebarConfig } from './core/plugin/types';

import './styles/base.css';
