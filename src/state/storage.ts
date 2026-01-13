export function saveToStorage<T>(
  key: string,
  value: T,
  storage: Storage = localStorage
): boolean {
  try {
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
  storage: Storage = localStorage
): T {
  try {
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
  storage: Storage = localStorage
): void {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from storage (key: ${key}):`, error);
  }
}

export function clearStorage(storage: Storage = localStorage): void {
  try {
    storage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

export function hasInStorage(
  key: string,
  storage: Storage = localStorage
): boolean {
  try {
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error(`Failed to check storage (key: ${key}):`, error);
    return false;
  }
}

export function getStorageKeys(storage: Storage = localStorage): string[] {
  try {
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

export function getStorageSize(storage: Storage = localStorage): number {
  try {
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
  save: <T>(key: string, value: T) => saveToStorage(key, value, window.sessionStorage),
  load: <T>(key: string, defaultValue: T) => loadFromStorage(key, defaultValue, window.sessionStorage),
  remove: (key: string) => removeFromStorage(key, window.sessionStorage),
  clear: () => clearStorage(window.sessionStorage),
  has: (key: string) => hasInStorage(key, window.sessionStorage),
  keys: () => getStorageKeys(window.sessionStorage),
  size: () => getStorageSize(window.sessionStorage),
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
