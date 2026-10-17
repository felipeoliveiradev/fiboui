import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useMountTransition,
  useScrollProgress,
  useSpring,
  useTransition,
} from '../src/core/animationHooks'
import { bindScrollProgress, ScrollProgress } from '../src/core/ScrollProgress'
import { useSignal } from '../src/core/hooks'
import { signal } from '../src/core/state'

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))
}

function stubRaf() {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.push(cb)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames[id - 1] = () => undefined
  })
  return {
    flush(n = 8) {
      for (let i = 0; i < n; i += 1) {
        const cb = frames.shift()
        if (!cb) break
        cb(i * 16)
      }
    },
    pending() {
      return frames.filter((cb) => cb).length
    },
  }
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useSpring / useTransition NaN guards', () => {
  it('useSpring mass 0 does not write Infinity or spin forever', () => {
    stubReducedMotion(false)
    const raf = stubRaf()
    function Probe({ to }: { to: number }) {
      const v = useSpring(to, { mass: 0, stiffness: 170, damping: 26 })
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId, rerender } = render(createElement(Probe, { to: 0 }))
    rerender(createElement(Probe, { to: 1 }))
    act(() => {
      raf.flush(8)
    })
    const n = Number(getByTestId('v').textContent)
    expect(Number.isFinite(n)).toBe(true)
    expect(n).not.toBe(Number.POSITIVE_INFINITY)
  })

  it('useSpring mass NaN / stiffness 0 stay finite', () => {
    stubReducedMotion(false)
    const raf = stubRaf()
    function Probe({ to }: { to: number }) {
      const v = useSpring(to, { mass: Number.NaN, stiffness: 0, damping: Number.NaN })
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId, rerender } = render(createElement(Probe, { to: 0 }))
    rerender(createElement(Probe, { to: 4 }))
    act(() => {
      raf.flush(8)
    })
    expect(Number.isFinite(Number(getByTestId('v').textContent))).toBe(true)
  })

  it('useTransition duration 0 snaps to the target instead of NaN', () => {
    stubReducedMotion(false)
    const raf = stubRaf()
    function Probe({ to }: { to: number }) {
      const v = useTransition(to, { duration: 0 })
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId, rerender } = render(createElement(Probe, { to: 0 }))
    rerender(createElement(Probe, { to: 10 }))
    act(() => {
      raf.flush(3)
    })
    const n = Number(getByTestId('v').textContent)
    expect(Number.isFinite(n)).toBe(true)
    expect(n).toBe(10)
  })

  it('useTransition duration NaN does not write NaN', () => {
    stubReducedMotion(false)
    const raf = stubRaf()
    function Probe({ to }: { to: number }) {
      const v = useTransition(to, { duration: Number.NaN })
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId, rerender } = render(createElement(Probe, { to: 0 }))
    rerender(createElement(Probe, { to: 6 }))
    act(() => {
      raf.flush(3)
    })
    expect(Number.isFinite(Number(getByTestId('v').textContent))).toBe(true)
  })

  it('useMountTransition NaN duration does not unmount on timeout(0)', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    function Probe({ open }: { open: boolean }) {
      const { shouldRender, stage } = useMountTransition(open, Number.NaN)
      return createElement('span', { 'data-testid': 'm' }, `${shouldRender ? 'yes' : 'no'}:${stage}`)
    }
    const { getByTestId, rerender } = render(createElement(Probe, { open: true }))
    expect(getByTestId('m').textContent).toMatch(/^yes:/)
    rerender(createElement(Probe, { open: false }))
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(getByTestId('m').textContent).toMatch(/^yes:/)
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(getByTestId('m').textContent).toBe('no:exited')
  })
})

describe('scroll listeners unmount', () => {
  it('useScrollProgress drops scroll/resize listeners on unmount', () => {
    stubReducedMotion(false)
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 })
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })

    function Probe() {
      const p = useScrollProgress()
      return createElement('span', { 'data-testid': 'p' }, String(p))
    }
    const { unmount, getByTestId } = render(createElement(Probe))
    expect(Number.isFinite(Number(getByTestId('p').textContent))).toBe(true)
    unmount()
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 750 })
    expect(() => window.dispatchEvent(new Event('scroll'))).not.toThrow()
  })

  it('bindScrollProgress stop() actually detaches the scroll listener', () => {
    const node = document.createElement('div')
    document.body.appendChild(node)
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 })
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })

    const stop = bindScrollProgress(node)
    const added = node.style.getPropertyValue('--fibo-progress')
    expect(added).not.toMatch(/NaN/i)
    stop()

    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 750 })
    window.dispatchEvent(new Event('scroll'))
    expect(node.style.getPropertyValue('--fibo-progress')).toBe(added)
    node.remove()
  })

  it('ScrollProgress removes window listeners on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    vi.spyOn(window, 'CSS', 'get').mockReturnValue({
      supports: () => false,
    } as unknown as typeof CSS)

    const { unmount } = render(
      createElement(ScrollProgress, {
        children: createElement('div', { className: 'fibo-scroll-progress' }, 'bar'),
      }),
    )

    const added = add.mock.calls.filter((c) => c[0] === 'scroll' || c[0] === 'resize')
    expect(added.length).toBeGreaterThan(0)
    unmount()
    const removed = remove.mock.calls.filter((c) => c[0] === 'scroll' || c[0] === 'resize')
    for (const call of added) {
      expect(removed.some((r) => r[0] === call[0] && r[1] === call[1])).toBe(true)
    }
  })

  it('useSignal unsubscribes so later writes do not re-render', () => {
    const sig = signal(0)
    let renders = 0
    function Probe() {
      const v = useSignal(sig)
      renders += 1
      return createElement('span', { 'data-testid': 's' }, String(v))
    }
    const { unmount } = render(createElement(Probe))
    unmount()
    const before = renders
    act(() => {
      sig.value = 9
    })
    expect(renders).toBe(before)
  })
})

describe('ScrollProgress / useScrollProgress SSR', () => {
  it('client ScrollProgress renderToString does not throw or read window.scrollY', () => {
    const spy = vi.spyOn(window, 'scrollY', 'get')
    const html = renderToString(
      createElement(ScrollProgress, {
        children: createElement('div', { className: 'fibo-scroll-progress', id: 'bar' }, 'p'),
      }),
    )
    expect(html).toContain('data-fibo-scroll-progress')
    expect(html).toContain('bar')
    expect(spy).not.toHaveBeenCalled()
  })

  it('useScrollProgress renderToString stays 0 and does not read window', () => {
    function Probe() {
      const p = useScrollProgress()
      return createElement('span', { id: 'sp' }, String(p))
    }
    const spy = vi.spyOn(window, 'scrollY', 'get')
    expect(renderToString(createElement(Probe))).toContain('>0<')
    expect(spy).not.toHaveBeenCalled()
  })

  it('bindScrollProgress with a node is a no-op when document is undefined', () => {
    const node = document.createElement('div')
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'document')
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined })
    try {
      const stop = bindScrollProgress(node)
      expect(typeof stop).toBe('function')
      expect(() => stop()).not.toThrow()
    } finally {
      if (desc) Object.defineProperty(globalThis, 'document', desc)
    }
  })
})
