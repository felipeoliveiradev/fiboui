import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Checkbox } from '../src/interactive/Checkbox'
import { interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('Checkbox .error() live interp', () => {
  it('error(`Need ${todos.$length}`) auto-updates after add', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Checkbox()
        .name('agree')
        .label('Agree')
        .error(`Need ${todos.$length}`)
        .build() as any
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Need 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Need 1')
  })

  it('error(`e ${interp(n)}`) auto-updates', () => {
    const n = signal(0)
    render(Checkbox().label('X').error(`e ${interp(n)}`).build() as any)
    expect(screen.getByRole('alert')).toHaveTextContent('e 0')
    act(() => {
      n.value = 2
    })
    expect(screen.getByRole('alert')).toHaveTextContent('e 2')
  })
})

describe('Checkbox unnamed .error() a11y', () => {
  it('points aria-describedby at the error span id without requiring .name()', () => {
    render(Checkbox().label('Agree').error('Must accept').build() as any)
    const input = screen.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    const described = input.getAttribute('aria-describedby')
    expect(described).toBeTruthy()
    const err = document.getElementById(described!)
    expect(err).toBeTruthy()
    expect(err?.classList.contains('fibo-field-error')).toBe(true)
    expect(err?.textContent).toBe('Must accept')
    expect(err?.getAttribute('role')).toBe('alert')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('named .error() still uses fibo-err-${name}', () => {
    render(Checkbox().name('agree').label('Agree').error('Must accept').build() as any)
    const input = screen.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-agree')
    expect(document.getElementById('fibo-err-agree')?.textContent).toBe('Must accept')
  })
})
