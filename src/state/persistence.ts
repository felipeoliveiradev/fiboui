import { Signal } from '../core/state';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistOptions<T> {
  key: string;
  storage?: StorageAdapter;
  include?: (keyof T)[];
  exclude?: (keyof T)[];
  debounce?: number;
  version?: number;
  migrate?: (data: any, fromVersion: number) => T;
}

export const storageAdapters = {
  localStorage: {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
  } as StorageAdapter,

  sessionStorage: {
    getItem: (key: string) => sessionStorage.getItem(key),
    setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
    removeItem: (key: string) => sessionStorage.removeItem(key),
  } as StorageAdapter,
};

export function persist<T>(
  signal: Signal<T>,
  options: PersistOptions<T>
): () => void {
  const {
    key,
    storage = storageAdapters.localStorage,
    include,
    exclude,
    debounce = 300,
    version = 1,
    migrate,
  } = options;

  const stored = storage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      if (parsed._version !== version && migrate) {
        const migrated = migrate(parsed.data, parsed._version || 0);
        signal.value = migrated;
      } else {
        signal.value = parsed.data;
      }
    } catch (error) {
      console.error(`Failed to load persisted state for key "${key}":`, error);
    }
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const save = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      try {
        let dataToSave = signal.value;

        if (include || exclude) {
          dataToSave = filterData(signal.value, include, exclude) as T;
        }

        const payload = {
          _version: version,
          data: dataToSave,
        };

        storage.setItem(key, JSON.stringify(payload));
      } catch (error) {
        console.error(`Failed to persist state for key "${key}":`, error);
      }
    }, debounce);
  };

  const unsubscribe = signal.subscribe(save);

  return () => {
    unsubscribe();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

function filterData<T>(
  data: T,
  include?: (keyof T)[],
  exclude?: (keyof T)[]
): Partial<T> {
  if (!data || typeof data !== 'object') {
    return data as Partial<T>;
  }

  const result: Partial<T> = {};
  const keys = Object.keys(data) as (keyof T)[];

  for (const key of keys) {

    if (include && !include.includes(key)) {
      continue;
    }

    if (exclude && exclude.includes(key)) {
      continue;
    }

    result[key] = data[key];
  }

  return result;
}

export function clearPersistedState(
  key: string,
  storage: StorageAdapter = storageAdapters.localStorage
): void {
  storage.removeItem(key);
}

export function getPersistedState<T>(
  key: string,
  storage: StorageAdapter = storageAdapters.localStorage
): T | null {
  const stored = storage.getItem(key);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored);
    return parsed.data;
  } catch (error) {
    console.error(`Failed to parse persisted state for key "${key}":`, error);
    return null;
  }
}
