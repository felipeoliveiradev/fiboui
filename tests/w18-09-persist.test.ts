import { afterEach, describe, expect, it, vi } from 'vitest'
import { signal } from '../src/core/state'
import {
  persist,
  storageAdapters,
  type StorageAdapter,
} from '../src/state/persistence'
import {
  getBrowserStorage,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  hasInStorage,
  clearStorage,
  getStorageKeys,
  getStorageSize,
  sessionStorage as sessionStorageUtils,
  localStorageUtils,
} from '../src/state/storage'

function memoryStorage(seed: Record<string, string> = {}): StorageAdapter & {
  dump: () => Record<string, string>
} {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
    dump: () => Object.fromEntries(map),
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('persist include/exclude restore when current is not a plain object (W18-09)', () => {
  it('exclude still drops excluded keys when the signal starts as null', () => {
    const storage = memoryStorage({
      session: JSON.stringify({
        _version: 1,
        data: { name: 'ada', token: 'stolen', n: 2 },
      }),
    })
    const s = signal<{ name: string; token: string | null; n: number } | null>(null)
    const stop = persist(s, {
      key: 'session',
      storage,
      exclude: ['token'],
      debounce: 0,
    })
    expect(s.value).toEqual({ name: 'ada', n: 2 })
    expect(s.value).not.toHaveProperty('token')
    stop()
  })

  it('include is still an allowlist when the signal starts as null', () => {
    const storage = memoryStorage({
      session: JSON.stringify({
        _version: 1,
        data: { name: 'ada', token: 'stolen', isAdmin: true, n: 99 },
      }),
    })
    const s = signal<{
      name: string
      token: string | null
      isAdmin: boolean
      n: number
    } | null>(null)
    const stop = persist(s, {
      key: 'session',
      storage,
      include: ['name'],
      debounce: 0,
    })
    expect(s.value).toEqual({ name: 'ada' })
    expect(s.value).not.toHaveProperty('token')
    expect(s.value).not.toHaveProperty('isAdmin')
    stop()
  })

  it('exclude after migrate still drops excluded keys when current is null', () => {
    const storage = memoryStorage({
      session: JSON.stringify({
        _version: 1,
        data: { name: 'ada', token: 'stolen' },
      }),
    })
    const s = signal<{ name: string; token: string | null; n: number } | null>(null)
    const stop = persist(s, {
      key: 'session',
      storage,
      version: 2,
      exclude: ['token'],
      debounce: 0,
      migrate: (data) => ({ ...(data as object), n: 1 }) as { name: string; token: string | null; n: number } | null,
    })
    expect(s.value).toEqual({ name: 'ada', n: 1 })
    expect(s.value).not.toHaveProperty('token')
    stop()
  })
})

describe('persist / storage SSR window + quota leftovers (W18-09)', () => {
  it('getBrowserStorage / helpers / persist do not throw when window storage is gone', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', undefined)
    vi.stubGlobal('sessionStorage', undefined)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(getBrowserStorage('localStorage')).toBeNull()
    expect(getBrowserStorage('sessionStorage')).toBeNull()
    expect(saveToStorage('k', { a: 1 })).toBe(false)
    expect(loadFromStorage('k', 7)).toBe(7)
    expect(() => removeFromStorage('k')).not.toThrow()
    expect(hasInStorage('k')).toBe(false)
    expect(() => clearStorage()).not.toThrow()
    expect(getStorageKeys()).toEqual([])
    expect(getStorageSize()).toBe(0)
    expect(localStorageUtils.load('k', 3)).toBe(3)
    expect(sessionStorageUtils.load('k', 4)).toBe(4)
    const s = signal({ n: 1 })
    expect(() => persist(s, { key: 'w18-09-ssr', debounce: 0 })).not.toThrow()
    expect(s.value).toEqual({ n: 1 })
    expect(() => persist(s, { key: 'w18-09-ssr', storage: storageAdapters.sessionStorage })).not.toThrow()
    spy.mockRestore()
  })

  it('dispose flush logs quota and does not throw', () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'w18-09-quota', storage, debounce: 30_000 })
    s.value = { n: 1 }
    expect(() => stop()).not.toThrow()
    expect(spy).toHaveBeenCalled()
    const msg = String(spy.mock.calls[0]?.[0] ?? '')
    expect(msg).toContain('w18-09-quota')
    spy.mockRestore()
  })
})
