import { afterEach, describe, expect, it, vi } from 'vitest'
import '../src/core/animations'
import { cssDecls, FIBO_MOTION_CSS } from '../src/core/motionCss'
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

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('W24-09 Signal.animate duration', () => {
  it('duration 0 snaps immediately and calls onComplete (no rAF)', () => {
    stubReducedMotion(false)
    const raf = vi.fn(() => 1)
    vi.stubGlobal('requestAnimationFrame', raf)
    const done = vi.fn()
    const s = signal(0)
    s.animate(10, { duration: 0, onComplete: done })
    expect(s.value).toBe(10)
    expect(done).toHaveBeenCalledTimes(1)
    expect(raf).not.toHaveBeenCalled()
  })

  it('Infinity duration does not hang on rAF forever', () => {
    stubReducedMotion(false)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => undefined)
    const done = vi.fn()
    const s = signal(0)
    s.animate(10, { duration: Number.POSITIVE_INFINITY, onComplete: done })
    for (let i = 0; i < 30; i += 1) {
      const cb = frames.shift()
      if (!cb) break
      cb(i * 16)
    }
    expect(s.value).toBe(10)
    expect(done).toHaveBeenCalledTimes(1)
    expect(frames.length).toBe(0)
  })

  it('negative duration snaps instead of looping rAF', () => {
    stubReducedMotion(false)
    const raf = vi.fn(() => 1)
    vi.stubGlobal('requestAnimationFrame', raf)
    const done = vi.fn()
    const s = signal(2)
    s.animate(8, { duration: -300, onComplete: done })
    expect(s.value).toBe(8)
    expect(done).toHaveBeenCalledTimes(1)
    expect(raf).not.toHaveBeenCalled()
  })
})

describe('W24-09 cssDecls keys', () => {
  it('does not let hostile property names break out of a keyframe block', () => {
    const css = cssDecls({
      '} body { display:none; x': 1,
      'foo; color: red; bar': 2,
      opacity: 1,
    })
    expect(css).not.toMatch(/\{/)
    expect(css).not.toMatch(/\}/)
    expect(css).not.toMatch(/color:\s*red/)
    expect(css).toMatch(/opacity:\s*1/)
  })
})

describe('W24-09 reduced-motion scroll progress', () => {
  it('does not force .fibo-scroll-progress transform to none', () => {
    const reduce = FIBO_MOTION_CSS.match(
      /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/,
    )?.[0] ?? ''
    expect(reduce.length).toBeGreaterThan(0)
    expect(reduce).not.toMatch(
      /\.fibo-scroll-progress[^{]*\{[^}]*transform:\s*none\s*!important/,
    )
    expect(FIBO_MOTION_CSS).toMatch(/\.fibo-scroll-progress[\s\S]*scaleX\(var\(--fibo-progress/)
  })
})
