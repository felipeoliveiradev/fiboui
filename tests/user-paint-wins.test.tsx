import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fiboCn } from '../src/core/cn'
import { Button } from '../src/interactive/Button'
import { TextField } from '../src/interactive/TextField'

describe('user paint wins over host utilities', () => {
  it('drops h-auto, h-14, and bg-transparent when the builder set that property', () => {
    expect(fiboCn('inline-flex h-auto p-0', 'fibo-height-44px')).toBe('inline-flex p-0 fibo-height-44px')
    expect(fiboCn('relative w-full h-14', 'fibo-height-40px')).toBe('relative w-full fibo-height-40px')
    expect(fiboCn('bg-transparent text-inherit', 'fibo-background-color-_c8ff00')).toBe(
      'text-inherit fibo-background-color-_c8ff00',
    )
  })

  it('clean button .height(44) is inline and is not h-auto', () => {
    render(Button().clean().height(44).text('Add').build() as never)
    const button = screen.getByRole('button', { name: 'Add' })
    expect(button.className).not.toMatch(/\bh-auto\b/)
    expect(button.style.height).toBe('44px')
  })

  it('text field .height(44) replaces h-14 on the field', () => {
    const { container } = render(
      TextField().name('text').variant('outlined').height(44).build() as never,
    )
    const field = container.querySelector('.h-14')
    expect(field).toBeNull()
    const host = container.querySelector('.fibo-textfield-container') as HTMLElement
    expect(host.style.height).toBe('44px')
  })
})
