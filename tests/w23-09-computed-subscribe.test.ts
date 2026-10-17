import { describe, expect, it } from 'vitest'
import { listSignal } from '../src/core/listSignal'
import { resolveInterpString } from '../src/core/interpolate'
import { computed, signal } from '../src/core/state'

describe('W23-09 ComputedSignal.subscribe delivers the live value', () => {
  it('subscribe payload is the recomputed value, not the previous snapshot', () => {
    const n = signal(1)
    const doubled = computed(() => n.value * 2)
    const seen: number[] = []

    expect(doubled.value).toBe(2)
    doubled.subscribe((v) => {
      seen.push(v)
    })

    n.value = 5
    expect(seen).toEqual([10])
    n.value = 6
    expect(seen).toEqual([10, 12])
    expect(doubled.value).toBe(12)
  })

  it('keeps tracking after subscribe even if the listener does not re-read .value', () => {
    const n = signal(2)
    const tripled = computed(() => n.value * 3)
    const seen: number[] = []

    expect(tripled.value).toBe(6)
    tripled.subscribe((v) => {
      seen.push(v)
      // Intentionally do not read .value — BindableSignal payload must stay live.
    })

    n.value = 3
    n.value = 4
    expect(seen).toEqual([9, 12])
    expect(tripled.value).toBe(12)
  })

  it('listSignal $length stays live across view() and add()', () => {
    const todos = listSignal<{ title: string }>([{ title: 'Ship' }, { title: 'Docs' }])
    const seen: number[] = []
    const len = computed(() => todos.value.length)
    expect(len.value).toBe(2)
    len.subscribe((n) => seen.push(n))

    expect(resolveInterpString(`${todos.$length}`)).toBe('2')

    todos.view('ship', ['title'])
    expect(len.value).toBe(1)
    expect(resolveInterpString(`${todos.$length}`)).toBe('1')

    todos.add({ title: 'Shipping' })
    expect(len.value).toBe(2)
    expect(resolveInterpString(`${todos.$length}`)).toBe('2')

    todos.view('')
    expect(len.value).toBe(3)
    expect(resolveInterpString(`${todos.$length}`)).toBe('3')
    expect(seen).toEqual([1, 2, 3])
  })

  it('computed cycle does not stack-overflow', () => {
    const a: { value: unknown } = computed(() => b.value)
    const b: { value: unknown } = computed(() => a.value)
    expect(() => a.value).not.toThrow()
  })
})
