import { afterEach, describe, expect, it, vi } from 'vitest'
import { signal } from '../src/core/state'
import {
  persist,
  getPersistedState,
  type StorageAdapter,
} from '../src/state/persistence'

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

describe('persist restore does not lie / crash', () => {
  it('keeps initial state when payload has matching version but no data', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1 }),
    })
    const s = signal({ n: 3, token: 'keep' })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const stop = persist(s, { key: 'user', storage, debounce: 0 })
    expect(s.value).toEqual({ n: 3, token: 'keep' })
    expect(s.value).not.toBeUndefined()
    stop()
    spy.mockRestore()
  })

  it('does not throw and keeps initial on JSON array / null / primitive payloads', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    for (const raw of ['[]', 'null', '"nope"', '0']) {
      const storage = memoryStorage({ user: raw })
      const s = signal({ n: 3 })
      expect(() => persist(s, { key: 'user', storage, debounce: 0 })).not.toThrow()
      expect(s.value).toEqual({ n: 3 })
    }
    spy.mockRestore()
  })

  it('exclude restore merges so ephemeral keys are not wiped', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { name: 'ada', n: 2 } }),
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

  it('include restore merges so non-included keys keep their initial values', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { name: 'ada' } }),
    })
    const s = signal({ name: 'guest', n: 7, token: 'secret' })
    const stop = persist(s, {
      key: 'user',
      storage,
      include: ['name'],
      debounce: 0,
    })
    expect(s.value).toEqual({ name: 'ada', n: 7, token: 'secret' })
    stop()
  })

  it('full restore (no include/exclude) still replaces the value', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { name: 'ada', n: 2 } }),
    })
    const s = signal({ name: 'guest', n: 0, extra: true })
    const stop = persist(s, { key: 'user', storage, debounce: 0 })
    expect(s.value).toEqual({ name: 'ada', n: 2 })
    stop()
  })
})

describe('getPersistedState payload shape', () => {
  it('returns null (not undefined) for JSON that is not a persist wrapper', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(getPersistedState('k', memoryStorage({ k: '{"n":1}' }))).toBeNull()
    expect(getPersistedState('k', memoryStorage({ k: '[]' }))).toBeNull()
    expect(getPersistedState('k', memoryStorage({ k: 'null' }))).toBeNull()
    expect(getPersistedState('k', memoryStorage({ k: '{"_version":1}' }))).toBeNull()
    spy.mockRestore()
  })

  it('returns data for a valid persist wrapper including falsy data', () => {
    expect(
      getPersistedState('k', memoryStorage({ k: JSON.stringify({ _version: 1, data: 0 }) })),
    ).toBe(0)
    expect(
      getPersistedState('k', memoryStorage({ k: JSON.stringify({ _version: 1, data: false }) })),
    ).toBe(false)
    expect(
      getPersistedState('k', memoryStorage({ k: JSON.stringify({ _version: 1, data: { n: 1 } }) })),
    ).toEqual({ n: 1 })
  })
})

describe('default adapter quota', () => {
  it('does not swallow quota: persist logs and does not throw', () => {
    vi.useFakeTimers()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'w8-03-quota', debounce: 0 })
    expect(() => {
      s.value = { n: 1 }
      vi.runAllTimers()
    }).not.toThrow()
    expect(spy).toHaveBeenCalled()
    const msg = String(spy.mock.calls[0]?.[0] ?? '')
    expect(msg).toContain('w8-03-quota')
    stop()
    spy.mockRestore()
  })
})
