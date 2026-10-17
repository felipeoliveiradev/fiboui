import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'

afterEach(cleanup)

describe('W18-02 Button HTML type + a11y leftover', () => {
  it('invalid .type() stays type=button and does not submit a form', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit as any}>
        {Button('Save').type('email' as any)}
      </form>,
    )
    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(button.type).toBe('button')
    expect(button.getAttribute('type')).toBe('button')
    fireEvent.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('.props({ type: "reset" }) is a real reset control', () => {
    render(
      <form>
        <input aria-label="title" defaultValue="hello" />
        {Button('Clear').props({ type: 'reset' })}
      </form>,
    )
    const input = screen.getByLabelText('title') as HTMLInputElement
    const button = screen.getByRole('button', { name: 'Clear' }) as HTMLButtonElement
    expect(button.type).toBe('reset')
    fireEvent.change(input, { target: { value: 'changed' } })
    expect(input.value).toBe('changed')
    fireEvent.click(button)
    expect(input.value).toBe('hello')
  })

  it('forwards aria-busy and aria-label onto the host button', () => {
    render(
      Button('Go').props({
        'aria-busy': true,
        'aria-label': 'Saving',
      }) as any,
    )
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button.tagName).toBe('BUTTON')
  })
})
