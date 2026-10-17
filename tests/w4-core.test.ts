import { createElement, type ReactElement } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { signal } from '../src/core/state'
import { scrollTo } from '../src/core/scroll'
import { Gesture } from '../src/core/gestures/Gesture'
import { LongPressGesture } from '../src/core/gestures/GestureBuilders'
import { PanRecognizer } from '../src/core/gestures/Pan'
import {
  persist,
  clearPersistedState,
  getPersistedState,
  storageAdapters,
  type StorageAdapter,
} from '../src/state/persistence'
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  hasInStorage,
  sessionStorage as sessionStorageUtils,
} from '../src/state/storage'

function memoryStorage(seed: Record<string, string> = {}): StorageAdapter & { dump: () => Record<string, string> } {
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
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('storage SSR / JSON / quota', () => {
  it('saveToStorage returns false when storage is missing (SSR)', () => {
    expect(saveToStorage('k', { a: 1 }, null)).toBe(false)
  })

  it('load/remove/has do not throw when storage is missing (SSR)', () => {
    expect(loadFromStorage('k', { a: 1 }, null)).toEqual({ a: 1 })
    expect(() => removeFromStorage('k', null)).not.toThrow()
    expect(hasInStorage('k', null)).toBe(false)
  })

  it('loadFromStorage returns default on invalid JSON', () => {
    const storage = {
      getItem: () => '{not json',
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    } as unknown as Storage
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(loadFromStorage('k', { ok: true }, storage)).toEqual({ ok: true })
    spy.mockRestore()
  })

  it('saveToStorage returns false on quota errors', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      },
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    } as unknown as Storage
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(saveToStorage('k', { big: true }, storage)).toBe(false)
    spy.mockRestore()
  })

  it('sessionStorage utils do not throw when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('sessionStorage', undefined)
    try {
      expect(() => sessionStorageUtils.save('k', 1)).not.toThrow()
      expect(sessionStorageUtils.load('k', 7)).toBe(7)
      expect(() => sessionStorageUtils.remove('k')).not.toThrow()
      expect(sessionStorageUtils.has('k')).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('persist', () => {
  it('restores matching version', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { n: 9 } }),
    })
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'user', storage, debounce: 0 })
    expect(s.value).toEqual({ n: 9 })
    stop()
  })

  it('skips restore on version mismatch when migrate is omitted', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { n: 9 } }),
    })
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'user', storage, version: 2, debounce: 0 })
    expect(s.value).toEqual({ n: 0 })
    stop()
  })

  it('applies migrate on version mismatch', () => {
    const storage = memoryStorage({
      user: JSON.stringify({ _version: 1, data: { n: 9 } }),
    })
    const s = signal({ n: 0 })
    const stop = persist(s, {
      key: 'user',
      storage,
      version: 2,
      debounce: 0,
      migrate: (data, from) => ({ n: (data as { n: number }).n + from }),
    })
    expect(s.value).toEqual({ n: 10 })
    stop()
  })

  it('does not throw on invalid JSON (keeps initial)', () => {
    const storage = memoryStorage({ user: '{not json' })
    const s = signal({ n: 3 })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => persist(s, { key: 'user', storage })).not.toThrow()
    expect(s.value).toEqual({ n: 3 })
    spy.mockRestore()
  })

  it('does not throw when getItem throws', () => {
    const storage: StorageAdapter = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => persist(signal({ n: 1 }), { key: 'user', storage })).not.toThrow()
    spy.mockRestore()
  })

  it('does not throw when setItem hits quota', () => {
    vi.useFakeTimers()
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'user', storage, debounce: 0 })
    expect(() => {
      s.value = { n: 1 }
      vi.runAllTimers()
    }).not.toThrow()
    stop()
    spy.mockRestore()
  })

  it('flushes a pending save on dispose', () => {
    const storage = memoryStorage()
    const s = signal({ n: 0 })
    const stop = persist(s, { key: 'user', storage, debounce: 30_000 })
    s.value = { n: 4 }
    expect(storage.getItem('user')).toBeNull()
    stop()
    expect(JSON.parse(storage.getItem('user')!).data).toEqual({ n: 4 })
  })

  it('getPersistedState returns null on invalid JSON', () => {
    const storage = memoryStorage({ user: '{not json' })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(getPersistedState('user', storage)).toBeNull()
    spy.mockRestore()
  })

  it('getPersistedState / clearPersistedState do not throw when adapter throws', () => {
    const storage: StorageAdapter = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => undefined,
      removeItem: () => {
        throw new Error('denied')
      },
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => getPersistedState('user', storage)).not.toThrow()
    expect(getPersistedState('user', storage)).toBeNull()
    expect(() => clearPersistedState('user', storage)).not.toThrow()
    spy.mockRestore()
  })

  it('default adapters do not throw when localStorage getItem throws (SSR / blocked)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => persist(signal({ n: 1 }), { key: 'ssr-user' })).not.toThrow()
    expect(() => getPersistedState('ssr-user', storageAdapters.localStorage)).not.toThrow()
    spy.mockRestore()
  })
})

describe('scrollTo', () => {
  it('does not throw on an invalid selector / missing target', () => {
    expect(() => scrollTo('foo bar')).not.toThrow()
    expect(() => scrollTo('1id:weird')).not.toThrow()
  })

  it('scrolls an element whose id is not a valid CSS identifier', () => {
    const el = document.createElement('div')
    el.id = 'foo bar'
    el.scrollIntoView = vi.fn()
    document.body.appendChild(el)
    scrollTo('foo bar')
    expect(el.scrollIntoView).toHaveBeenCalled()
    el.remove()
  })
})

describe('gestures', () => {
  it('PanRecognizer onPointerCancel notifies onEnd so UI can reset', () => {
    const onEnd = vi.fn()
    const pan = new PanRecognizer({ onEnd })
    pan.onPointerDown({ clientX: 0, clientY: 0 } as PointerEvent)
    pan.onPointerCancel({ clientX: 8, clientY: 2 } as PointerEvent)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('keeps an in-progress pan when parent callbacks change identity', () => {
    const captured = new Set<number>()
    const proto = HTMLElement.prototype
    const prev = {
      set: proto.setPointerCapture,
      has: proto.hasPointerCapture,
      release: proto.releasePointerCapture,
    }
    proto.setPointerCapture = function (id: number) {
      captured.add(id)
    }
    proto.hasPointerCapture = function (id: number) {
      return captured.has(id)
    }
    proto.releasePointerCapture = function (id: number) {
      captured.delete(id)
    }

    try {
      const onUpdate = vi.fn()
      const tree = (cb: (e: unknown) => void) =>
        createElement(Gesture, {
          onPanUpdate: cb,
          children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
        })

      const { rerender, getByTestId } = render(tree(() => undefined) as ReactElement)
      const host = getByTestId('pad').parentElement as HTMLElement
      fireEvent.pointerDown(host, { pointerId: 1, clientX: 0, clientY: 0 })
      rerender(tree(onUpdate) as ReactElement)
      fireEvent.pointerMove(host, { pointerId: 1, clientX: 12, clientY: 0 })
      expect(onUpdate).toHaveBeenCalled()
    } finally {
      proto.setPointerCapture = prev.set
      proto.hasPointerCapture = prev.has
      proto.releasePointerCapture = prev.release
    }
  })

  it('LongPress does not fire onEnd after unmount', () => {
    vi.useFakeTimers()
    const onEnd = vi.fn()
    const node = LongPressGesture({ duration: 400 }).onEnd(onEnd).wrap('hold') as ReactElement
    const { container, unmount } = render(node)
    fireEvent.pointerDown(container.firstElementChild as HTMLElement)
    unmount()
    vi.advanceTimersByTime(400)
    expect(onEnd).not.toHaveBeenCalled()
  })
})
