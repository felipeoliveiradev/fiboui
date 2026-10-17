import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Switch } from '../src/interactive/Switch'

afterEach(cleanup)

describe('Switch unnamed .error() a11y (parity with Checkbox W11-01)', () => {
  it('points aria-describedby at the error span id without requiring .name()', () => {
    render(Switch().label('Dark').error('Must accept').build() as any)
    const input = screen.getByRole('switch', { name: 'Dark' }) as HTMLInputElement
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
    render(Switch().name('dark').label('Dark').error('Must accept').build() as any)
    const input = screen.getByRole('switch', { name: 'Dark' }) as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-dark')
    expect(document.getElementById('fibo-err-dark')?.textContent).toBe('Must accept')
  })
})
