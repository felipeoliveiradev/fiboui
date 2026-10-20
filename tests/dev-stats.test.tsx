import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Text, fiboDevStats, page, resetFiboDevStats, signal } from '../src'
import { resetWarnDev } from '../src/core/warn'

afterEach(() => {
  cleanup()
  resetWarnDev()
  resetFiboDevStats()
})

describe('fiboDevStats', () => {
  it('increments produces on page render', () => {
    const n = signal('hi')
    const Page = page(() => Box().children(Text(`${n.value}`)))
    expect(fiboDevStats().produces).toBe(0)
    render(<Page />)
    expect(fiboDevStats().produces).toBeGreaterThanOrEqual(1)
  })

  it('increments pageRoots when a bare read promotes a signal', () => {
    const n = signal(1)
    const Page = page(() => {
      void n.value
      return Box().width(40)
    })
    render(<Page />)
    expect(fiboDevStats().pageRoots).toBeGreaterThanOrEqual(1)
  })

  it('reset clears counters', () => {
    const n = signal(1)
    const Page = page(() => {
      void n.value
      return Box().width(40)
    })
    render(<Page />)
    expect(fiboDevStats().produces).toBeGreaterThan(0)
    resetFiboDevStats()
    expect(fiboDevStats()).toEqual({
      produces: 0,
      replays: 0,
      pageRoots: 0,
      warns: 0,
    })
  })
})
