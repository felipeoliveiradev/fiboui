import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Text, Label, Button, listSignal, signal, interp } from '../src/index'
import { interpSlotCount, resolveInterpString } from '../src/core/interpolate'

describe('Text auto-bind + extra bindSignal', () => {
  it('Text(`…${todos.$length}`) auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Text(`Total todos: ${todos.$length}`).build() as any)
    expect(screen.getAllByText('Total todos: 0').length).toBeGreaterThan(0)
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getAllByText('Total todos: 1').length).toBeGreaterThan(0)
  })

  it('extra bindSignal is allowed alongside auto-bind', () => {
    const todos = listSignal<{ title: string }>([])
    const tick = signal(0)
    render(
      Text(`Total todos: ${todos.$length}`).bindSignal(tick).build() as any
    )
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getAllByText('Total todos: 1').length).toBeGreaterThan(0)
    act(() => {
      tick.value = 1
    })
    // still shows current total after extra signal tick
    expect(screen.getAllByText('Total todos: 1').length).toBeGreaterThan(0)
  })
})

describe('interp slot reuse', () => {
  it('reuses a slot for the same signal instead of growing forever', () => {
    const count = signal(0)
    const before = interpSlotCount()
    let marked = ''
    for (let i = 0; i < 400; i++) {
      marked = `n=${interp(count)}`
    }
    expect(interpSlotCount()).toBe(before + 1)
    expect(resolveInterpString(marked)).toBe('n=0')
    count.value = 9
    expect(resolveInterpString(marked)).toBe('n=9')
  })

  it('rebuilds of Text(`…${list.$length}`) do not allocate a slot per render', () => {
    const todos = listSignal<{ title: string }>([])
    const before = interpSlotCount()
    for (let i = 0; i < 80; i++) {
      Text(`Total todos: ${todos.$length}`)
    }
    // one computed ($length) → one slot, reused across builder rebuilds
    expect(interpSlotCount()).toBe(before + 1)
  })
})

describe('live interp outside Text (W6-02)', () => {
  it('Label(`…${todos.$length}`) auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Label(`Total todos: ${todos.$length}`).build() as any)
    expect(screen.getAllByText('Total todos: 0').length).toBeGreaterThan(0)
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getAllByText('Total todos: 1').length).toBeGreaterThan(0)
  })

  it('Button(`…${todos.$length}`) auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Button(`Total todos: ${todos.$length}`).build() as any)
    expect(screen.getByRole('button')).toHaveTextContent('Total todos: 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('button')).toHaveTextContent('Total todos: 1')
  })
})
