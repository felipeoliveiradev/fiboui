import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '../src/interactive/Hero'

afterEach(() => {
  cleanup()
  delete (document as { startViewTransition?: unknown }).startViewTransition
})

describe('Hero onFlight', () => {
  it('calls startViewTransition and onFlight when the hero is clicked', () => {
    const onFlight = vi.fn()
    const startViewTransition = vi.fn()
    ;(document as unknown as { startViewTransition: typeof startViewTransition }).startViewTransition =
      startViewTransition

    const { container } = render(Hero().tag('card').onFlight(onFlight).child('go'))
    fireEvent.click(container.querySelector('[data-hero]') as HTMLElement)

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(onFlight).toHaveBeenCalledTimes(1)
    expect(startViewTransition.mock.invocationCallOrder[0]).toBeLessThan(
      onFlight.mock.invocationCallOrder[0],
    )
  })
})
