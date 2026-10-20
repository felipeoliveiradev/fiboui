import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, Button, Text, page, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'

afterEach(() => {
  cleanup()
  resetWarnDev()
})

describe('observer owns style reads without warning', () => {
  it('does not warn when a filter chip reads a signal then paints a border', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const shown = signal<'all' | 'active'>('all')
    const Page = page(() =>
      Box()
        .observer()
        .children(() => {
          const on = shown.value === 'all'
          return [
            Button()
              .children(
                Box()
                  .border(`1px solid ${on ? '#c8ff00' : '#333'}`)
                  .children(Text(on ? 'All' : 'Other')),
              ),
          ]
        }),
    )
    render(<Page />)
    expect(spy.mock.calls.some((call) => String(call[0]).includes('[fiboui]'))).toBe(false)
    spy.mockRestore()
  })

  it('does not warn when the page builds an observer that paints from a read', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const live = signal(false)
    const Page = page(() => [
      Box()
        .observer()
        .children(() => {
          const on = live.value
          return [
            Text(on ? 'Live' : 'Idle').color(on ? '#c8ff00' : '#666'),
          ]
        }),
      Text('static'),
    ])
    render(<Page />)
    const fibo = spy.mock.calls.filter((call) => String(call[0]).includes('[fiboui]'))
    expect(fibo).toEqual([])
    spy.mockRestore()
  })
})
