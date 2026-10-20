import React from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, Text, page, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'

afterEach(() => {
  cleanup()
  resetWarnDev()
})

describe('page refresh stays inside React', () => {
  it('re-runs a page root without calling hooks outside render', () => {
    const flag = signal('off')
    let builds = 0
    const Page = page(() => {
      builds += 1
      React.useState(0)
      void flag.value
      return Box()
        .width(40)
        .children(Text(flag.peek() === 'on' ? 'Live' : 'Idle'))
    })

    render(<Page />)
    expect(screen.getByText('Idle')).toBeTruthy()
    const before = builds
    act(() => {
      flag.value = 'on'
    })
    expect(screen.getByText('Live')).toBeTruthy()
    expect(builds).toBeGreaterThan(before)
  })

  it('warns once when a signal becomes a page root', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const n = signal(1)
    const Page = page(() => {
      void n.value
      return Box().width(40)
    })
    render(<Page />)
    expect(spy.mock.calls.some((call) => String(call[0]).includes('page root'))).toBe(true)
    spy.mockRestore()
  })
})
