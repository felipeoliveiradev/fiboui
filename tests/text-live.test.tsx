import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Text, listSignal, signal } from '../src/index'

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
