import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SensoryFeedback } from '../src/interactive/SensoryFeedback'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SensoryFeedback', () => {
  it('calls navigator.vibrate with a short pattern, then onTrigger', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })
    const onTrigger = vi.fn()

    render(
      SensoryFeedback().kind('success').onTrigger(onTrigger).label('Buzz') as never,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Buzz' }))

    expect(vibrate).toHaveBeenCalledTimes(1)
    const pattern = vibrate.mock.calls[0][0] as number[]
    expect(pattern.length).toBeGreaterThan(0)
    expect(pattern.length).toBeLessThanOrEqual(5)
    expect(pattern.every((ms) => ms > 0 && ms <= 80)).toBe(true)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(vibrate.mock.invocationCallOrder[0]).toBeLessThan(
      onTrigger.mock.invocationCallOrder[0],
    )
  })

  it('uses a short pattern for warning and error', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { vibrate })

    const { unmount } = render(
      SensoryFeedback().kind('warning').label('Buzz') as never,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Buzz' }))
    unmount()

    render(SensoryFeedback().kind('error').label('Buzz') as never)
    fireEvent.click(screen.getByRole('button', { name: 'Buzz' }))

    expect(vibrate).toHaveBeenCalledTimes(2)
    for (const [pattern] of vibrate.mock.calls) {
      expect(Array.isArray(pattern)).toBe(true)
      expect((pattern as number[]).length).toBeGreaterThan(0)
      expect((pattern as number[]).every((ms) => ms > 0 && ms <= 80)).toBe(true)
    }
  })

  it('calls onTrigger and does not throw when vibrate is missing', () => {
    vi.stubGlobal('navigator', {})
    const onTrigger = vi.fn()

    render(
      SensoryFeedback().kind('error').onTrigger(onTrigger).label('Buzz') as never,
    )

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Buzz' }))
    }).not.toThrow()
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })
})
