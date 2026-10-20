import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, Format, Plural, Text, Unit, page, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'

afterEach(() => {
  cleanup()
  resetWarnDev()
})

function fibouiWarns(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls.some((c) => String(c[0]).includes('[fiboui]'))
}

describe('Unit', () => {
  it('Box().width(Unit.px(n)) updates without fiboui warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const w = signal(100)
    const Page = page(() => Box().width(Unit.px(w)).children(Text('x')))
    const { container } = render(<Page />)
    expect(container.querySelector('[style*="100px"]') || container.innerHTML).toBeTruthy()
    expect(fibouiWarns(spy)).toBe(false)
    act(() => {
      w.value = 160
    })
    expect(fibouiWarns(spy)).toBe(false)
    spy.mockRestore()
  })
})

describe('Plural', () => {
  it('Plural.of updates the label', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = signal(1)
    const Page = page(() => Text(Plural.of(n, 'task', 'tasks')))
    render(<Page />)
    expect(screen.getByText('1 task')).toBeTruthy()
    act(() => {
      n.value = 3
    })
    expect(screen.getByText('3 tasks')).toBeTruthy()
    expect(fibouiWarns(spy)).toBe(false)
    spy.mockRestore()
  })
})

describe('Format extras', () => {
  it('Format.integer and Format.currency stay quiet', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = signal(12.7)
    const Page = page(() => [
      Text(Format.integer(n)),
      Text(Format.currency(n, 'EUR', 'en-US')),
    ])
    render(<Page />)
    expect(screen.getByText('13')).toBeTruthy()
    expect(fibouiWarns(spy)).toBe(false)
    spy.mockRestore()
  })
})
