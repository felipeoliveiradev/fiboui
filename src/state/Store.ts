import 'reflect-metadata';

// Store registry
const storeRegistry = new Map<any, any>();

// Metadata keys
const STORE_METADATA_KEY = Symbol('store');

/**
 * @Store decorator
 * Marks a class as a global store
 */
export function Store(): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // Mark as store
    Reflect.defineMetadata(STORE_METADATA_KEY, true, target);

    // Register singleton instance
    const instance = new (target as any)();
    storeRegistry.set(target, instance);

    return target;
  };
}

/**
 * useStore hook
 * Get a store instance
 */
export function useStore<T>(StoreClass: new () => T): T {
  if (!storeRegistry.has(StoreClass)) {
    // Auto-create if not registered
    const instance = new StoreClass();
    storeRegistry.set(StoreClass, instance);
  }

  return storeRegistry.get(StoreClass);
}

/**
 * Get store instance (non-hook version)
 */
export function getStore<T>(StoreClass: new () => T): T {
  return useStore(StoreClass);
}

/**
 * Clear all stores (useful for testing)
 */
export function clearStores(): void {
  storeRegistry.clear();
}

/**
 * Check if a class is a store
 */
export function isStore(target: Function): boolean {
  return Reflect.getMetadata(STORE_METADATA_KEY, target) === true;
}
