export * from './core';
export * from './theme';
export * from './layout';
export * from './content';
export * from './interactive';
export * from './structure';
export * from './navigation';

// Re-export decorators (Inject from decorators takes precedence)
export { Component, Page, getRegisteredRoutes, clearRoutes, registerRoute } from './decorators';
export { Inject, useInject, OnMount, OnUnmount } from './decorators';
export { Store, useStore, getStore, clearStores, isStore } from './state';
export { Signal, getSignals, initializeSignals } from './decorators';

// Re-export DI
export { DIContainer, container, Injectable } from './core/di';
export { Inject as InjectDI } from './core/di';
export type { Token, Provider, Constructor, Factory, DIOptions } from './core/di';

// Export SignalType (type only, to avoid conflict with Signal decorator)
export { Signal as SignalType } from './core/state';

import './styles/base.css';
