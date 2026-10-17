import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '../src/interactive/TextField'
import { Form } from '../src/interactive/Form'
import { Button } from '../src/interactive/Button'

afterEach(cleanup)

describe('TextField password toggle', () => {
  it('flips type password ↔ text without wiping the value or firing onCommit', async () => {
    const commit = vi.fn()
    const user = userEvent.setup()
    render(
      TextField().type('password').placeholder('Pwd').onCommit(commit) as any
    )
    const input = screen.getByPlaceholderText('Pwd') as HTMLInputElement
    expect(input.type).toBe('password')
    await user.type(input, 's3cret')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input.type).toBe('text')
    expect(input.value).toBe('s3cret')
    expect(commit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(input)
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input.type).toBe('password')
    expect(input.value).toBe('s3cret')
    expect(commit).not.toHaveBeenCalled()
  })

  it('does not submit the enclosing form', async () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    const user = userEvent.setup()
    render(
      <form onSubmit={onSubmit as any}>
        {TextField().type('password').value('x').placeholder('Pwd') as any}
      </form>
    )
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('TextField type number', () => {
  it("type('number') sets the DOM input type without .build()", () => {
    render(TextField().type('number').placeholder('Qty') as any)
    expect((screen.getByPlaceholderText('Qty') as HTMLInputElement).type).toBe('number')
  })

  it('submits the typed numeric string in FormData', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().type('number').name('qty').placeholder('Qty'),
          Button('Save').submit(),
        ]) as any
    )
    const input = screen.getByPlaceholderText('Qty') as HTMLInputElement
    fireEvent.change(input, { target: { value: '12.5' } })
    fireEvent.submit(input.closest('form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ qty: '12.5' })
  })
})

describe('TextField prefix (leadingIcon)', () => {
  it('renders the prefix and pads the input so text does not overlap', () => {
    render(TextField().leadingIcon('$').placeholder('Amount') as any)
    const input = screen.getByPlaceholderText('Amount') as HTMLInputElement
    expect(input.parentElement?.textContent).toContain('$')
    expect(input.style.paddingLeft).toBe('2.75rem')
  })
})

describe('TextField unnamed error id prefix', () => {
  it('points aria-describedby at a real error id without requiring .name()', () => {
    render(TextField().error('bad').placeholder('E') as any)
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const described = input.getAttribute('aria-describedby')
    expect(described).toBeTruthy()
    const err = document.getElementById(described!)
    expect(err).toBeTruthy()
    expect(err?.classList.contains('fibo-field-error')).toBe(true)
    expect(err?.textContent).toBe('bad')
    expect(err?.getAttribute('role')).toBe('alert')
  })
})
