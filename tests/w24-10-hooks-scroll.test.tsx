import { act, cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useMountTransition,
  useSpring,
  useTransition,
} from '../src/core/animationHooks'

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
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useMountTransition does not replay on mount', () => {
  it('stays exited when mounted hidden — does not flash exiting', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    function Probe({ open }: { open: boolean }) {
      const { shouldRender, stage } = useMountTransition(open, 300)
      return createElement('span', { 'data-testid': 'm' }, `${shouldRender ? 'yes' : 'no'}:${stage}`)
    }
    const { getByTestId } = render(createElement(Probe, { open: false }))
    expect(getByTestId('m').textContent).toBe('no:exited')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(getByTestId('m').textContent).toBe('no:exited')
  })

  it('stays entered when mounted visible — does not replay entering', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    function Probe({ open }: { open: boolean }) {
      const { shouldRender, stage } = useMountTransition(open, 300)
      return createElement('span', { 'data-testid': 'm' }, `${shouldRender ? 'yes' : 'no'}:${stage}`)
    }
    const { getByTestId } = render(createElement(Probe, { open: true }))
    expect(getByTestId('m').textContent).toBe('yes:entered')
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(getByTestId('m').textContent).toBe('yes:entered')
  })

  it('hidden → visible still plays entering then entered', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    function Probe({ open }: { open: boolean }) {
      const { shouldRender, stage } = useMountTransition(open, 300)
      return createElement('span', { 'data-testid': 'm' }, `${shouldRender ? 'yes' : 'no'}:${stage}`)
    }
    const { getByTestId, rerender } = render(createElement(Probe, { open: false }))
    rerender(createElement(Probe, { open: true }))
    expect(getByTestId('m').textContent).toBe('yes:entering')
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(getByTestId('m').textContent).toBe('yes:entered')
  })

  it('changing duration while visible does not replay enter', () => {
    stubReducedMotion(false)
    vi.useFakeTimers()
    function Probe({ open, duration }: { open: boolean; duration: number }) {
      const { shouldRender, stage } = useMountTransition(open, duration)
      return createElement('span', { 'data-testid': 'm' }, `${shouldRender ? 'yes' : 'no'}:${stage}`)
    }
    const { getByTestId, rerender } = render(createElement(Probe, { open: true, duration: 300 }))
    expect(getByTestId('m').textContent).toBe('yes:entered')
    rerender(createElement(Probe, { open: true, duration: 800 }))
    expect(getByTestId('m').textContent).toBe('yes:entered')
  })
})

describe('useTransition / useSpring first paint is finite', () => {
  it('useTransition(NaN) does not return NaN on the first render', () => {
    stubReducedMotion(false)
    function Probe() {
      const v = useTransition(Number.NaN)
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId } = render(createElement(Probe))
    expect(Number.isFinite(Number(getByTestId('v').textContent))).toBe(true)
  })

  it('useSpring(Infinity) does not return Infinity on the first render', () => {
    stubReducedMotion(false)
    function Probe() {
      const v = useSpring(Number.POSITIVE_INFINITY)
      return createElement('span', { 'data-testid': 'v' }, String(v))
    }
    const { getByTestId } = render(createElement(Probe))
    const n = Number(getByTestId('v').textContent)
    expect(Number.isFinite(n)).toBe(true)
    expect(n).not.toBe(Number.POSITIVE_INFINITY)
  })
})
