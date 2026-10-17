import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Switch } from '../src/interactive/Switch'
import { interp, listSignal, signal } from '../src/index'

afterEach(cleanup)

describe('Switch error live interp', () => {
  it('error(`Need ${todos.$length}`) updates after add', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Switch()
        .name('dark')
        .label('Dark')
        .error(`Need ${todos.$length}`)
        .build() as any
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Need 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Need 1')
  })

  it('error with interp() updates', () => {
    const msg = signal('off')
    render(
      Switch()
        .name('alerts')
        .label('Alerts')
        .error(`Must be ${interp(msg)}`)
        .build() as any
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Must be off')
    act(() => {
      msg.value = 'on'
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Must be on')
  })

  it('named switch keeps input[name] after error interp update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Switch()
        .name('dark')
        .label('Dark')
        .error(`e ${todos.$length}`)
        .build() as any
    )
    const input = screen.getByRole('switch') as HTMLInputElement
    expect(input.name).toBe('dark')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect((screen.getByRole('switch') as HTMLInputElement).name).toBe('dark')
    expect(screen.getByRole('alert')).toHaveTextContent('e 1')
  })

  it('error interp still sets aria-invalid and describedby', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Switch()
        .name('dark')
        .label('Dark')
        .error(`Need ${todos.$length}`)
        .build() as any
    )
    const input = screen.getByRole('switch', { name: 'Dark' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-dark')
    expect(document.getElementById('fibo-err-dark')?.textContent).toBe('Need 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(document.getElementById('fibo-err-dark')?.textContent).toBe('Need 1')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
})
