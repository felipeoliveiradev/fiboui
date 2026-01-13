import 'reflect-metadata';

const storeRegistry = new Map<any, any>();

const STORE_METADATA_KEY = Symbol('store');

export function Store(): ClassDecorator {
  return function <T extends Function>(target: T): T {

    Reflect.defineMetadata(STORE_METADATA_KEY, true, target);

    const instance = new (target as any)();

    storeRegistry.set(target, instance);

    return target;
  };
}

export function useStore<T>(StoreClass: new () => T): T {
  if (!storeRegistry.has(StoreClass)) {

    const instance = new StoreClass();
    storeRegistry.set(StoreClass, instance);
  }

  return storeRegistry.get(StoreClass);
}

export function getStore<T>(StoreClass: new () => T): T {
  return useStore(StoreClass);
}

export function clearStores(): void {
  storeRegistry.clear();
}

export function isStore(target: Function): boolean {
  return Reflect.getMetadata(STORE_METADATA_KEY, target) === true;
}
