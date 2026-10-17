import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../src/interactive/Button'
import { Form, minLength, required } from '../src/interactive/Form'
import { TextField } from '../src/interactive/TextField'

afterEach(cleanup)

describe('W19-02 TextField leftover: aria-describedby helper + error', () => {
  it('restores helper aria-describedby after Form live-clears a painted error', async () => {
    render(
      Form()
        .validation({ email: required('Need email') })
        .children([
          TextField().name('email').helper('We will not share this').placeholder('E'),
          Button('Save').submit(),
        ]) as any
    )
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('fibo-help-email')
    expect(input.getAttribute('aria-invalid')).not.toBe('true')

    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Need email')).toBeTruthy()
    expect(input.getAttribute('aria-describedby')).toContain('fibo-err-email')
    expect(input.getAttribute('aria-invalid')).toBe('true')

    fireEvent.input(input, { target: { value: 'a@b.c' } })
    expect(screen.queryByText('Need email')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBe('fibo-help-email')
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('__fiboShowError wires both ids, then restores helper describedby', () => {
    render(TextField().name('email').helper('hint').placeholder('E') as any)
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    const host = document.querySelector('.fibo-textfield-container') as HTMLElement & {
      __fiboShowError?: (msg: string | null) => void
    }
    expect(input.getAttribute('aria-describedby')).toBe('fibo-help-email')

    act(() => {
      host.__fiboShowError?.('bad')
    })
    const described = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    expect(described).toContain('fibo-err-email')
    expect(described).toContain('fibo-help-email')
    expect(input.getAttribute('aria-invalid')).toBe('true')

    act(() => {
      host.__fiboShowError?.(null)
    })
    expect(input.getAttribute('aria-describedby')).toBe('fibo-help-email')
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
  })
})

describe('W19-02 TextField leftover: native HTML type', () => {
  it('coerces invalid .type() to text (checkbox/submit/hidden must not leak)', () => {
    const { unmount } = render(TextField().type('checkbox' as any).placeholder('Box') as any)
    const checkbox = screen.getByPlaceholderText('Box') as HTMLInputElement
    expect(checkbox.type).toBe('text')
    expect(checkbox.getAttribute('type')).toBe('text')
    unmount()

    render(TextField().type('submit' as any).placeholder('Go') as any)
    const submit = screen.getByPlaceholderText('Go') as HTMLInputElement
    expect(submit.type).toBe('text')
    expect(submit.getAttribute('type')).toBe('text')
  })

  it('still writes documented types onto the input', () => {
    render(TextField().type('email').placeholder('Mail') as any)
    expect((screen.getByPlaceholderText('Mail') as HTMLInputElement).type).toBe('email')
  })
})

describe('W19-02 TextField leftover: password autocomplete', () => {
  it('defaults autocomplete=current-password and keeps it when shown as text', async () => {
    const user = userEvent.setup()
    render(TextField().type('password').placeholder('Pwd') as any)
    const input = screen.getByPlaceholderText('Pwd') as HTMLInputElement
    expect(input.autocomplete).toBe('current-password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input.type).toBe('text')
    expect(input.autocomplete).toBe('current-password')
  })

  it('does not override an explicit autocomplete on a password field', () => {
    render(
      TextField().type('password').props({ autoComplete: 'new-password' }).placeholder('Pwd') as any
    )
    expect((screen.getByPlaceholderText('Pwd') as HTMLInputElement).autocomplete).toBe(
      'new-password'
    )
  })
})

describe('W19-02 TextField leftover: inputMode / enterKeyHint', () => {
  it('lands inputMode and enterKeyHint on the native input (not as CSS)', () => {
    render(
      TextField().inputMode('numeric').enterKeyHint('done').placeholder('Amt') as any
    )
    const input = screen.getByPlaceholderText('Amt') as HTMLInputElement
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('enterkeyhint')).toBe('done')
    expect(input.className).not.toMatch(/input-mode/)
    expect(input.closest('.fibo-textfield-container')?.className).not.toMatch(/input-mode/)
  })
})

describe('W19-02 TextField leftover: clear vs Form / controlled', () => {
  it('Clear dispatches input so Form live-clears a painted error', async () => {
    render(
      Form()
        .validation({ q: minLength(8, 'Too short') })
        .children([
          TextField().name('q').clearable().value('short').placeholder('Q'),
          Button('Save').submit(),
        ]) as any
    )
    const input = screen.getByPlaceholderText('Q') as HTMLInputElement
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Too short')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(input.value).toBe('')
    expect(screen.queryByText('Too short')).toBeNull()
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('clear on a controlled field empties the React value and hides the button', () => {
    const onChange = vi.fn()
    render(
      TextField()
        .controlled()
        .value('hello')
        .clearable()
        .onChange(onChange)
        .placeholder('E') as any
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(input.value).toBe('')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('')
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })
})
