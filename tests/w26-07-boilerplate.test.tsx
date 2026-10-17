import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStores, useStore } from '../src/state/Store'
import { PerformanceViewModel } from '../boilerplate/src/modules/performance/ViewModels/PerformanceViewModel'

const BOILER = resolve(__dirname, '../boilerplate')

function readBoiler(rel: string): string {
  return readFileSync(resolve(BOILER, rel), 'utf8')
}

afterEach(() => {
  cleanup()
  clearStores()
  vi.useRealTimers()
})

beforeEach(() => {
  clearStores()
})

describe('W26-07 boilerplate PerformanceViewModel singleton dispose', () => {
  it('dispose stops earnings ticks and resets isOnline so a remount is not frozen "online"', () => {
    vi.useFakeTimers()
    const vm = useStore(PerformanceViewModel)
    act(() => {
      vm.toggleOnlineStatus()
    })
    expect(vm.isOnline.value).toBe(true)

    const before = vm.earnings.value
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(vm.earnings.value).toBeGreaterThan(before)

    act(() => {
      vm.dispose()
    })
    expect(vm.isOnline.value).toBe(false)

    const frozen = vm.earnings.value
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(vm.earnings.value).toBe(frozen)
  })

  it('PerformancePage still disposes the singleton on unmount', () => {
    const src = readBoiler('src/modules/performance/Views/PerformancePage.tsx')
    expect(src).toMatch(/useEffect/)
    expect(src).toMatch(/\.dispose\s*\(/)
  })
})

describe('W26-07 boilerplate BottomNavBar Home', () => {
  it('Home uses fiboui useNavigate to /todo (not a dead button)', () => {
    const src = readBoiler('src/modules/performance/Views/components/BottomNavBar.tsx')
    expect(src).toMatch(/useNavigate/)
    expect(src).toMatch(/navigate\s*\(\s*['"]\/todo['"]/)
  })
})
