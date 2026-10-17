import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react'
import { TextField } from '../src/interactive/TextField'
import { Signal } from '../src/core/state'

afterEach(cleanup)

describe('TextField (uncontrolled)', () => {
  it('types without React owning value (defaultValue)', () => {
    render(TextField().placeholder('Email').build() as any)
    const input = screen.getByPlaceholderText('Email') as HTMLInputElement
    expect(input.defaultValue).toBe('')
    fireEvent.change(input, { target: { value: 'hi@x.com' } })
    expect(input.value).toBe('hi@x.com')
  })

  it('onCommit fires on blur, not required per keystroke', () => {
    const commit = vi.fn()
    render(TextField().placeholder('Name').onCommit(commit).build() as any)
    const input = screen.getByPlaceholderText('Name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Ada' } })
    expect(commit).not.toHaveBeenCalled()
    fireEvent.blur(input)
    expect(commit).toHaveBeenCalledWith('Ada')
  })

  it('resetStyle drops the built-in padding, border, and height', () => {
    render(TextField().placeholder('Bare').resetStyle().build() as any)
    const input = screen.getByPlaceholderText('Bare') as HTMLInputElement
    expect(input.style.padding).toBe('0px')
    expect(input.style.height).toBe('1lh')
    expect(input.style.lineHeight).toBe('inherit')
    expect(input.style.width).toBe('100%')
    expect(input.style.display).toBe('block')
    expect(input.className).not.toContain('py-2.5')
    const field = input.parentElement
    expect(field?.className).not.toContain('border-b')
    expect(field?.className).not.toContain('h-14')
    expect(input.closest('.fibo-textfield-container')?.className).toContain('fibo-reset')
  })

  it('Signal syncs without controlled value prop', () => {
    const email = new Signal('')
    render(TextField().value(email).placeholder('Mail').build() as any)
    const input = screen.getByPlaceholderText('Mail') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a@b.c' } })
    expect(email.value).toBe('a@b.c')
    expect((input as any).value).toBe('a@b.c')
  })

  it("type('email') sets input type without .build()", () => {
    render(TextField().type('email').placeholder('E') as any)
    expect((screen.getByPlaceholderText('E') as HTMLInputElement).type).toBe('email')
  })

  it('static error wires aria-invalid and aria-describedby; span id is fibo-err-${name}', () => {
    render(
      TextField().name('email').error('Invalid email').placeholder('E') as any
    )
    const input = screen.getByPlaceholderText('E') as HTMLInputElement
    const err = document.getElementById('fibo-err-email')
    expect(err).toBeTruthy()
    expect(err?.id).toBe('fibo-err-email')
    expect(err?.textContent).toBe('Invalid email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-email')
  })

  it('mask applies to the initial value on first paint', () => {
    render(
      TextField().mask('(999) 999-9999').value('1234567890').placeholder('Phone') as any
    )
    const input = screen.getByPlaceholderText('Phone') as HTMLInputElement
    expect(input.value).toBe('(123) 456-7890')
  })

  it('mask applies when the value prop / signal changes', () => {
    const phone = new Signal('1234567890')
    render(
      TextField().mask('(999) 999-9999').value(phone).placeholder('Phone') as any
    )
    const input = screen.getByPlaceholderText('Phone') as HTMLInputElement
    expect(input.value).toBe('(123) 456-7890')
    act(() => {
      phone.value = '9876543210'
    })
    expect(input.value).toBe('(987) 654-3210')
  })
})
