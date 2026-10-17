import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Select, interp, listSignal, signal } from '../src'

afterEach(cleanup)

const OPTS = [{ label: 'A', value: 'a' }]

describe('Select live interp', () => {
  it('placeholder with interp updates', () => {
    const hint = signal('zero')
    render(
      Select()
        .placeholder(`Pick ${interp(hint)}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    expect(screen.getByText('Pick zero')).toBeInTheDocument()
    act(() => {
      hint.value = 'one'
    })
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('error with interp updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Select()
        .error(`Need ${todos.$length}`)
        .options(OPTS)
        .name('x')
        .build() as any
    )
    expect(screen.getByText('Need 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Need 1')).toBeInTheDocument()
  })
})
