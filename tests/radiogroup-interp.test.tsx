import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { RadioGroup } from '../src/interactive/RadioGroup'
import { listSignal, signal } from '../src/index'

afterEach(cleanup)

describe('RadioGroup live interp', () => {
  it('options([{ label: `A ${todos.$length}` }]) updates after add', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      RadioGroup()
        .options([{ label: `A ${todos.$length}`, value: 'a' }])
        .build() as any
    )
    expect(screen.getByRole('radio', { name: 'A 0' })).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('radio', { name: 'A 1' })).toBeInTheDocument()
  })

  it('error(`e ${todos.$length}`) updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      RadioGroup()
        .options([{ label: 'A', value: 'a' }])
        .error(`e ${todos.$length}`)
        .build() as any
    )
    expect(screen.getByText('e 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('e 1')).toBeInTheDocument()
  })

  it('named group still has input[name]', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      RadioGroup()
        .name('plan')
        .options([{ label: `A ${todos.$length}`, value: 'a' }])
        .build() as any
    )
    const radio = screen.getByRole('radio') as HTMLInputElement
    expect(radio.name).toBe('plan')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect((screen.getByRole('radio') as HTMLInputElement).name).toBe('plan')
  })

  it('extra bindSignal is allowed alongside auto-bind', () => {
    const todos = listSignal<{ title: string }>([])
    const tick = signal(0)
    render(
      RadioGroup()
        .options([{ label: `A ${todos.$length}`, value: 'a' }])
        .bindSignal(tick)
        .build() as any
    )
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('radio', { name: 'A 1' })).toBeInTheDocument()
    act(() => {
      tick.value = 1
    })
    expect(screen.getByRole('radio', { name: 'A 1' })).toBeInTheDocument()
  })
})
