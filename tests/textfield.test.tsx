import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextField } from '../src/interactive/TextField'
import { Signal } from '../src/core/state'

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

  it('Signal syncs without controlled value prop', () => {
    const email = new Signal('')
    render(TextField().value(email).placeholder('Mail').build() as any)
    const input = screen.getByPlaceholderText('Mail') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a@b.c' } })
    expect(email.value).toBe('a@b.c')
    expect((input as any).value).toBe('a@b.c')
  })
})
