import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Text, page, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'

afterEach(() => {
  cleanup()
  resetWarnDev()
})

function fibouiMessages(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls
    .map((call) => String(call[0]))
    .filter((line) => line.includes('[fiboui]'))
}

describe('formula strings without bindSignal', () => {
  it('warns on bare n.value.toFixed(2) — use Format.fixed instead', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = signal(1.5)
    const Page = page(() => Text(`€ ${n.value.toFixed(2)}`))
    render(<Page />)
    const msgs = fibouiMessages(spy)
    expect(
      msgs.some(
        (m) =>
          m.includes('split') ||
          m.includes('Format') ||
          m.includes('computed') ||
          m.includes('bindSignal') ||
          m.includes('template'),
      ),
    ).toBe(true)
    spy.mockRestore()
  })


  it('warns or page-roots when two zero values make an ambiguous fraction', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const a = signal(0)
    const b = signal(0)
    const Page = page(() => Text(`${a.value}/${b.value}`))
    render(<Page />)
    const msgs = fibouiMessages(spy)
    expect(
      msgs.some(
        (m) =>
          m.includes('page root') ||
          m.includes('split') ||
          m.includes('ambiguous') ||
          m.includes('bindSignal') ||
          m.includes('template'),
      ),
    ).toBe(true)
    spy.mockRestore()
  })

  it('does not warn when Text uses bindSignal for formatting', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = signal(1.5)
    const Page = page(() => Text().bindSignal(n, (v) => `€ ${v.toFixed(2)}`))
    render(<Page />)
    expect(fibouiMessages(spy)).toEqual([])
    spy.mockRestore()
  })
})
