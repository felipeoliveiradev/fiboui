import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TextField } from '../src/interactive/TextField'
import { Signal } from '../src/core/state'
import { interp } from '../src/core/interpolate'

afterEach(cleanup)

describe('TextField .helper()', () => {
  it('renders a muted hint under the field with .fibo-field-helper', () => {
    render(
      TextField().name('email').helper('We will not share this').placeholder('E') as any
    )
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    expect(helper).toBeTruthy()
    expect(helper.textContent).toBe('We will not share this')
    expect(helper.style.display).not.toBe('none')
    expect(helper.id).toBe('fibo-help-email')
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('fibo-help-email')
    expect(input.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('hides helper when .error() is showing and points aria-describedby at the error', () => {
    render(
      TextField()
        .name('email')
        .helper('We will not share this')
        .error('Invalid email')
        .placeholder('E') as any
    )
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    const err = document.getElementById('fibo-err-email')
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(helper).toBeTruthy()
    expect(helper.style.display).toBe('none')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Invalid email')
    expect(err?.id).toBe('fibo-err-email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-email')
  })

  it('hides helper when Form paints an error via __fiboShowError', () => {
    render(
      TextField().name('email').helper('hint').placeholder('E') as any
    )
    const host = document.querySelector('.fibo-textfield-container') as HTMLElement & {
      __fiboShowError?: (msg: string | null) => void
    }
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    expect(helper.style.display).not.toBe('none')
    act(() => {
      host.__fiboShowError?.('bad')
    })
    expect(helper.style.display).toBe('none')
    const err = document.querySelector('.fibo-field-error') as HTMLElement
    expect(err.textContent).toBe('bad')
    expect(err.style.display).not.toBe('none')
    act(() => {
      host.__fiboShowError?.(null)
    })
    expect(helper.style.display).not.toBe('none')
  })
})

describe('TextField .clearable() / .clear(true)', () => {
  it('hides the clear button when empty', () => {
    render(TextField().clearable().placeholder('E') as any)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('shows a type=button Clear control when the input has a value', () => {
    render(TextField().clearable().value('hello').placeholder('E') as any)
    const btn = screen.getByRole('button', { name: 'Clear' })
    expect(btn.getAttribute('type')).toBe('button')
    expect(btn.getAttribute('aria-label')).toBe('Clear')
  })

  it('clicking Clear empties the input, fires onChange(""), and hides the button', () => {
    const onChange = vi.fn()
    render(
      TextField().clearable().value('hello').onChange(onChange).placeholder('E') as any
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(input.value).toBe('')
    expect(onChange).toHaveBeenCalledWith('')
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('updates a bound Signal on clear', () => {
    const email = new Signal('a@b.c')
    render(TextField().value(email).clearable().placeholder('E') as any)
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(email.value).toBe('')
    expect((screen.getByPlaceholderText('E') as HTMLInputElement).value).toBe('')
  })

  it('appears after typing into an empty field', () => {
    render(TextField().clearable().placeholder('E') as any)
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    fireEvent.change(input, { target: { value: 'x' } })
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy()
  })

  it('is hidden when the field is disabled even if it has a value', () => {
    render(TextField().value('kept').disabled().clearable().placeholder('E') as any)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('.clear(true) is an alias of .clearable()', () => {
    render(TextField().clear(true).value('x').placeholder('E') as any)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy()
  })

  it('does not submit the enclosing form', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit as any}>
        {TextField().clearable().value('x').placeholder('E') as any}
      </form>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('coexists with the password eye; clear sits to the left of the eye', () => {
    render(
      TextField().type('password').value('secret').clearable().placeholder('Pwd') as any
    )
    const clear = screen.getByRole('button', { name: 'Clear' })
    const eye = screen.getByRole('button', { name: /password/i })
    expect(eye.getAttribute('type')).toBe('button')
    expect(clear.compareDocumentPosition(eye) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('TextField label interp', () => {
  it('live-updates the label when interp() signals change', () => {
    const who = new Signal('Ada')
    render(TextField().label(`Hello ${interp(who)}`).placeholder('E') as any)
    expect(screen.getByText('Hello Ada')).toBeTruthy()
    const label = document.querySelector('.fibo-textfield-label') as HTMLLabelElement
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    expect(label.htmlFor).toBe(input.id)
    act(() => {
      who.value = 'Bob'
    })
    expect(screen.getByText('Hello Bob')).toBeTruthy()
    expect(screen.queryByText('Hello Ada')).toBeNull()
  })

  it('does not drop an uncontrolled typed value when the label signal ticks', () => {
    const who = new Signal('Ada')
    const email = new Signal('')
    render(
      TextField().value(email).label(`Hi ${interp(who)}`).placeholder('E') as any
    )
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'typed@x.com' } })
    expect(email.value).toBe('typed@x.com')
    act(() => {
      who.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeTruthy()
    expect(input.value).toBe('typed@x.com')
    expect(email.value).toBe('typed@x.com')
  })

  it('helper with interp stays live', () => {
    const who = new Signal('Ada')
    render(TextField().name('n').helper(`Hint ${interp(who)}`).placeholder('E') as any)
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Ada')
    act(() => {
      who.value = 'Bob'
    })
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Bob')
  })

  it('error with interp stays live', () => {
    const who = new Signal('Ada')
    render(TextField().name('n').error(`Bad ${interp(who)}`).placeholder('E') as any)
    expect(document.getElementById('fibo-err-n')?.textContent).toBe('Bad Ada')
    act(() => {
      who.value = 'Bob'
    })
    expect(document.getElementById('fibo-err-n')?.textContent).toBe('Bad Bob')
  })
})
