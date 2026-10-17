/** Resolve window storage without throwing on SSR / private mode. */
export function getBrowserStorage(
  kind: 'localStorage' | 'sessionStorage' = 'localStorage'
): Storage | null {
  try {
    const g = globalThis as typeof globalThis & {
      localStorage?: Storage;
      sessionStorage?: Storage;
      window?: { localStorage?: Storage; sessionStorage?: Storage };
    };
    const store = g[kind] ?? g.window?.[kind];
    if (!store || typeof store.getItem !== 'function') return null;
    return store;
  } catch {
    return null;
  }
}

export function saveToStorage<T>(
  key: string,
  value: T,
  storage: Storage | null = getBrowserStorage('localStorage')
): boolean {
  try {
    if (!storage) return false;
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to save to storage (key: ${key}):`, error);
    return false;
  }
}

export function loadFromStorage<T>(
  key: string,
  defaultValue: T,
  storage: Storage | null = getBrowserStorage('localStorage')
): T {
  try {
    if (!storage) return defaultValue;
    const item = storage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from storage (key: ${key}):`, error);
    return defaultValue;
  }
}

export function removeFromStorage(
  key: string,
  storage: Storage | null = getBrowserStorage('localStorage')
): void {
  try {
    storage?.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from storage (key: ${key}):`, error);
  }
}

export function clearStorage(storage: Storage | null = getBrowserStorage('localStorage')): void {
  try {
    storage?.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

export function hasInStorage(
  key: string,
  storage: Storage | null = getBrowserStorage('localStorage')
): boolean {
  try {
    if (!storage) return false;
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error(`Failed to check storage (key: ${key}):`, error);
    return false;
  }
}

export function getStorageKeys(storage: Storage | null = getBrowserStorage('localStorage')): string[] {
  try {
    if (!storage) return [];
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  } catch (error) {
    console.error('Failed to get storage keys:', error);
    return [];
  }
}

export function getStorageSize(storage: Storage | null = getBrowserStorage('localStorage')): number {
  try {
    if (!storage) return 0;
    let size = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size * 2;
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
    return 0;
  }
}

export const sessionStorage = {
  save: <T>(key: string, value: T) => saveToStorage(key, value, getBrowserStorage('sessionStorage')),
  load: <T>(key: string, defaultValue: T) =>
    loadFromStorage(key, defaultValue, getBrowserStorage('sessionStorage')),
  remove: (key: string) => removeFromStorage(key, getBrowserStorage('sessionStorage')),
  clear: () => clearStorage(getBrowserStorage('sessionStorage')),
  has: (key: string) => hasInStorage(key, getBrowserStorage('sessionStorage')),
  keys: () => getStorageKeys(getBrowserStorage('sessionStorage')),
  size: () => getStorageSize(getBrowserStorage('sessionStorage')),
};

export const localStorageUtils = {
  save: saveToStorage,
  load: loadFromStorage,
  remove: removeFromStorage,
  clear: clearStorage,
  has: hasInStorage,
  keys: getStorageKeys,
  size: getStorageSize,
};
