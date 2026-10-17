import { act, fireEvent, render, screen } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnimatedWrapper } from '../src/core/AnimatedWrapper'
import '../src/core/animations'
import { Presence } from '../src/core/Presence'
import { cssDecls } from '../src/core/motionCss'
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

function fireAnimEnd(el: HTMLElement, animationName: string) {
  const ev = new Event('animationend', { bubbles: true })
  Object.defineProperty(ev, 'animationName', { configurable: true, value: animationName })
  fireEvent(el, ev)
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Presence: exit must not leave the DOM too soon', () => {
  it('ignores a leftover enter animationend after hide', () => {
    stubReducedMotion(false)
    const { rerender } = render(
      <Presence show duration={400}>
        <span>panel</span>
      </Presence>,
    )
    expect(screen.getByText('panel')).toBeTruthy()
    rerender(
      <Presence show={false} enter="fadeIn" exit="fadeOut" duration={400}>
        <span>panel</span>
      </Presence>,
    )
    const wrap = document.querySelector('[data-fibo-presence="exit"]') as HTMLElement
    expect(wrap).toBeTruthy()
    fireAnimEnd(wrap, 'fibo-fadeIn')
    expect(screen.getByText('panel')).toBeTruthy()
    expect(document.querySelector('[data-fibo-presence="exit"]')).toBeTruthy()
    fireAnimEnd(wrap, 'fibo-fadeOut')
    expect(screen.queryByText('panel')).toBeNull()
  })

  it('NaN duration does not unmount on timeout(0)', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    const { rerender, container } = render(
      <Presence show duration={Number.NaN}>
        <span>panel</span>
      </Presence>,
    )
    rerender(
      <Presence show={false} exit="fadeOut" duration={Number.NaN}>
        <span>panel</span>
      </Presence>,
    )
    expect(container.textContent).toBe('panel')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(container.textContent).toBe('panel')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(container.textContent).toBe('')
  })

  it('unknown enter preset does not crash the tree', () => {
    expect(() =>
      render(
        <Presence show enter="not-a-preset">
          <span>still-here</span>
        </Presence>,
      ),
    ).not.toThrow()
    expect(screen.getByText('still-here')).toBeTruthy()
  })

  it('SSR renderToString does not read window timers', () => {
    const html = renderToString(
      createElement(Presence as unknown as (props: { show: boolean; children: ReactElement }) => ReactElement, {
        show: true,
        children: createElement('span', null, 'ssr-panel'),
      }),
    )
    expect(html).toContain('ssr-panel')
    const hidden = renderToString(
      createElement(Presence as unknown as (props: { show: boolean; children: ReactElement }) => ReactElement, {
        show: false,
        children: createElement('span', null, 'hidden-ssr'),
      }),
    )
    expect(hidden).not.toContain('hidden-ssr')
  })
})

describe('AnimatedWrapper children types', () => {
  it('does not crash cloneElement on text children', () => {
    const scale = signal(1.5)
    const animated = new Map<string, typeof scale>([['scale', scale]])
    expect(() =>
      render(
        <AnimatedWrapper animatedProps={animated}>
          hi
        </AnimatedWrapper>,
      ),
    ).not.toThrow()
    expect(screen.getByText('hi')).toBeTruthy()
    expect(document.body.innerHTML).toMatch(/scale\(1\.5\)/)
  })

  it('skips NaN transform tokens so the rest still apply', () => {
    const scale = signal(Number.NaN)
    const x = signal(10)
    const animated = new Map<string, typeof scale>([
      ['scale', scale],
      ['translateX', x],
    ])
    const { container } = render(
      <AnimatedWrapper animatedProps={animated}>
        <div data-testid="box">box</div>
      </AnimatedWrapper>,
    )
    expect(container.innerHTML).not.toMatch(/NaN/)
    expect(container.firstElementChild).toHaveStyle({ transform: 'translateX(10px)' })
  })
})

describe('motionCss cssDecls invalid values', () => {
  it('keeps scale/opacity unitless and omits NaN/Infinity', () => {
    const css = cssDecls({
      opacity: 0,
      scale: 0.94,
      width: 12,
      rotate: 45,
      height: Number.NaN,
      top: Number.POSITIVE_INFINITY,
    })
    expect(css).toMatch(/opacity:\s*0/)
    expect(css).toMatch(/scale:\s*0\.94(?!px)/)
    expect(css).toMatch(/width:\s*12px/)
    expect(css).toMatch(/rotate:\s*45deg/)
    expect(css).not.toMatch(/NaN/i)
    expect(css).not.toMatch(/Infinity/)
  })

  it('does not let braces break out of a keyframe block', () => {
    const css = cssDecls({
      opacity: 1,
      content: '"} body{display:none',
    })
    expect(css).not.toMatch(/\{/)
    expect(css).not.toMatch(/\}/)
    expect(css).toMatch(/opacity:\s*1/)
  })
})

describe('Signal.animate spring NaN / mass 0', () => {
  it('mass 0 does not write Infinity or spin forever', () => {
    stubReducedMotion(false)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => undefined)
    const s = signal(0)
    s.spring(1, { mass: 0, stiffness: 170, damping: 26 })
    expect(frames.length).toBeGreaterThan(0)
    for (let i = 0; i < 8; i += 1) {
      const cb = frames.shift()
      if (!cb) break
      cb(i * 16)
    }
    expect(Number.isFinite(s.value as number)).toBe(true)
    expect(s.value).not.toBe(Number.POSITIVE_INFINITY)
  })
})
