import { Signal } from '../core/state';
import { getBrowserStorage } from './storage';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistOptions<T> {
  key: string;
  storage?: StorageAdapter;
  include?: (keyof NonNullable<T>)[];
  exclude?: (keyof NonNullable<T>)[];
  debounce?: number;
  version?: number;
  migrate?: (data: any, fromVersion: number) => T;
}

function makeBrowserAdapter(kind: 'localStorage' | 'sessionStorage'): StorageAdapter {
  return {
    getItem(key: string) {
      try {
        return getBrowserStorage(kind)?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string) {
      // quota/private-mode throw so persistNow can log; SSR storage is a no-op
      getBrowserStorage(kind)?.setItem(key, value);
    },
    removeItem(key: string) {
      try {
        getBrowserStorage(kind)?.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}

export const storageAdapters = {
  localStorage: makeBrowserAdapter('localStorage'),
  sessionStorage: makeBrowserAdapter('sessionStorage'),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function restorePersisted<T>(
  stored: string,
  version: number,
  migrate?: (data: any, fromVersion: number) => T
): { ok: true; data: T } | { ok: false } {
  const parsed = JSON.parse(stored) as unknown;
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('invalid persisted payload');
  }
  const rec = parsed as { _version?: number; data?: T };
  const fromVersion = typeof rec._version === 'number' ? rec._version : 0;
  if (fromVersion !== version) {
    if (!migrate) return { ok: false };
    return { ok: true, data: migrate(rec.data, fromVersion) };
  }
  if (!Object.prototype.hasOwnProperty.call(rec, 'data')) {
    return { ok: false };
  }
  return { ok: true, data: rec.data as T };
}

type PersistKeys<T> = (keyof NonNullable<T>)[];

function applyRestored<T>(
  current: T,
  data: T,
  include?: PersistKeys<T>,
  exclude?: PersistKeys<T>
): T {
  if (!(include || exclude) || !isPlainObject(data)) {
    return data;
  }
  // Slice incoming keys the same way save does so a stale/full snapshot
  // cannot restore excluded fields or bypass an include allowlist.
  // Null/undefined current (session = signal(null)) must still slice —
  // otherwise exclude/include are a no-op until the first object value.
  const sliced = filterData(data as T, include, exclude);
  if (isPlainObject(current)) {
    return { ...current, ...sliced } as T;
  }
  return sliced as T;
}

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

  try {
    const stored = storage.getItem(key);
    if (stored) {
      const restored = restorePersisted(stored, version, migrate);
      if (restored.ok) {
        signal.value = applyRestored(signal.value, restored.data, include, exclude);
      }
    }
  } catch (error) {
    console.error(`Failed to load persisted state for key "${key}":`, error);
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const persistNow = () => {
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
  };

  const save = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      persistNow();
    }, debounce);
  };

  const unsubscribe = signal.subscribe(save);

  return () => {
    unsubscribe();
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      persistNow();
    }
  };
}

function filterData<T>(
  data: T,
  include?: PersistKeys<T>,
  exclude?: PersistKeys<T>
): Partial<T> {
  if (!data || typeof data !== 'object') {
    return data as Partial<T>;
  }

  const result: Partial<T> = {};
  const keys = Object.keys(data) as PersistKeys<T>;
  const includeKeys = include as PersistKeys<T> | undefined;
  const excludeKeys = exclude as PersistKeys<T> | undefined;

  for (const key of keys) {
    if (includeKeys && !includeKeys.includes(key)) {
      continue;
    }

    if (excludeKeys && excludeKeys.includes(key)) {
      continue;
    }

    (result as Record<string, unknown>)[key as string] = (data as Record<string, unknown>)[key as string];
  }

  return result;
}

export function clearPersistedState(
  key: string,
  storage: StorageAdapter = storageAdapters.localStorage
): void {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear persisted state for key "${key}":`, error);
  }
}

export function getPersistedState<T>(
  key: string,
  storage: StorageAdapter = storageAdapters.localStorage
): T | null {
  try {
    const stored = storage.getItem(key);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as unknown;
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(parsed, 'data')) {
      return null;
    }
    return (parsed as { data: T }).data;
  } catch (error) {
    console.error(`Failed to parse persisted state for key "${key}":`, error);
    return null;
  }
}
