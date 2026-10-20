import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Format, Text, Transform, page, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'
import { allocLiveSlot, renderParts, runBuildFrame, type LiveSlot } from '../src/core/state'

afterEach(() => {
  cleanup()
  resetWarnDev()
})

describe('Format.fixed in live Text', () => {
  it('splits € 1.50 when Format.fixed registered the printer', () => {
    const n = signal(1.5)
    const slots: LiveSlot[] = []
    const parts = runBuildFrame([], slots, () => {
      const printed = Format.fixed(n)
      expect(printed).toBe('1.50')
      return allocLiveSlot(`€ ${printed}`)?.parts ?? null
    }).result
    expect(parts).not.toBeNull()
    expect(renderParts(parts!)).toBe('€ 1.50')
    n.value = 2
    expect(renderParts(parts!)).toBe('€ 2.00')
  })

  it('updates Text(`€ ${Format.fixed(price)}`) without warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const price = signal(12.5)
    const Page = page(() => Text(`€ ${Format.fixed(price)}`))
    render(<Page />)
    expect(screen.getByText('€ 12.50')).toBeTruthy()
    expect(spy.mock.calls.some((c) => String(c[0]).includes('[fiboui]'))).toBe(false)
    act(() => {
      price.value = 9
    })
    expect(screen.getByText('€ 9.00')).toBeTruthy()
    spy.mockRestore()
  })

  it('Format.euro owns the signal the same way', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const price = signal(3)
    const Page = page(() => Text(Format.euro(price)))
    render(<Page />)
    expect(screen.getByText('€ 3.00')).toBeTruthy()
    act(() => {
      price.value = 4.2
    })
    expect(screen.getByText('€ 4.20')).toBeTruthy()
    expect(spy.mock.calls.some((c) => String(c[0]).includes('[fiboui]'))).toBe(false)
    spy.mockRestore()
  })

  it('Transform is an alias of Format', () => {
    expect(Transform.fixed).toBe(Format.fixed)
    expect(Transform.euro).toBe(Format.euro)
  })
})
