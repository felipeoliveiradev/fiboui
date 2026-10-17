import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Combobox, interp, listSignal, signal } from '../src'

afterEach(cleanup)

const OPTS = [{ label: 'A', value: 'a' }]

describe('Combobox live interp', () => {
  it('label with $length auto-updates after add', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Combobox()
        .label(`N ${todos.$length}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    expect(screen.getByText('N 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('N 1')).toBeInTheDocument()
  })

  it('placeholder with interp updates', () => {
    const hint = signal('zero')
    render(
      Combobox()
        .placeholder(`Pick ${interp(hint)}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    const input = screen.getByRole('combobox') as HTMLInputElement
    expect(input.placeholder).toBe('Pick zero')
    act(() => {
      hint.value = 'one'
    })
    expect(input.placeholder).toBe('Pick one')
  })

  it('error with interp updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Combobox()
        .error(`Need ${todos.$length}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Need 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Need 1')
  })

  it('todos.length (plain number) still freezes', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Combobox()
        .label(`Frozen: ${todos.length}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    expect(screen.getByText('Frozen: 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Frozen: 0')).toBeInTheDocument()
  })
})
