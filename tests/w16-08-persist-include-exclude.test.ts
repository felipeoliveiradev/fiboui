import { afterEach, describe, expect, it, vi } from 'vitest'
import { signal } from '../src/core/state'
import { persist, type StorageAdapter } from '../src/state/persistence'

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
})

describe('persist include/exclude restore slices stored keys (W16-08)', () => {
  it('exclude restore does not apply excluded keys still present in a stale snapshot', () => {
    const storage = memoryStorage({
      user: JSON.stringify({
        _version: 1,
        data: { name: 'ada', n: 2, token: 'stolen' },
      }),
    })
    const s = signal({ name: 'guest', n: 0, token: 'secret' })
    const stop = persist(s, {
      key: 'user',
      storage,
      exclude: ['token'],
      debounce: 0,
    })
    expect(s.value).toEqual({ name: 'ada', n: 2, token: 'secret' })
    stop()
  })

  it('include restore is an allowlist: extra stored keys do not enter state', () => {
    const storage = memoryStorage({
      user: JSON.stringify({
        _version: 1,
        data: { name: 'ada', n: 99, token: 'stolen', isAdmin: true },
      }),
    })
    const s = signal({ name: 'guest', n: 7, token: 'secret', isAdmin: false })
    const stop = persist(s, {
      key: 'user',
      storage,
      include: ['name'],
      debounce: 0,
    })
    expect(s.value).toEqual({
      name: 'ada',
      n: 7,
      token: 'secret',
      isAdmin: false,
    })
    stop()
  })
})
