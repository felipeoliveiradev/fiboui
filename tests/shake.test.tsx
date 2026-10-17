import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SHAKE_ACCELERATION_THRESHOLD,
  Shake,
  accelerationDelta,
  exceedsShakeThreshold,
} from '../src/interactive/Shake'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function dispatchMotion(acceleration: { x: number; y: number; z: number }) {
  const event = new Event('devicemotion')
  Object.assign(event, { acceleration })
  window.dispatchEvent(event)
}

describe('Shake', () => {
  it('renders the child when devicemotion never fires', () => {
    const { getByText } = render(
      Shake().onShake(() => {}).child(createElement('span', null, 'steady')),
    )
    expect(getByText('steady')).toBeTruthy()
  })

  it('calls onShake once when the acceleration delta exceeds 20, then ignores 500ms', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(0)

    const onShake = vi.fn()
    render(Shake().onShake(onShake).child(createElement('span', null, 'phone')))

    const spike = accelerationDelta({ x: 25, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })
    expect(spike).toBeGreaterThan(SHAKE_ACCELERATION_THRESHOLD)
    expect(exceedsShakeThreshold(spike)).toBe(true)
    expect(exceedsShakeThreshold(SHAKE_ACCELERATION_THRESHOLD)).toBe(false)

    dispatchMotion({ x: 0, y: 0, z: 0 })
    expect(onShake).not.toHaveBeenCalled()

    dispatchMotion({ x: 25, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(1)

    dispatchMotion({ x: 0, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(1)

    vi.setSystemTime(499)
    dispatchMotion({ x: 30, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(1)

    vi.setSystemTime(500)
    dispatchMotion({ x: 0, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(2)
  })
})
