import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, Combobox, Form, required, Select, TextField } from '../src'

afterEach(() => {
  cleanup()
})

const FRUIT = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
]

const LIBS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
]

describe('W11-04 Form leftover: Select/Combobox a11y + blur + native reset', () => {
  it('puts aria-invalid on the Select combobox, not the hidden named input', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .validation({ fruit: required('Need fruit') })
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).placeholder('Pick fruit'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    fireEvent.submit(document.querySelector('form')!)
    expect(await screen.findByText('Need fruit')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    const hidden = document.querySelector('input[name="fruit"]') as HTMLInputElement
    const combo = screen.getByRole('combobox')
    expect(hidden.type).toBe('hidden')
    expect(combo.getAttribute('aria-invalid')).toBe('true')
    expect(combo.getAttribute('aria-describedby')).toBe('fibo-err-fruit')
    expect(hidden.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('puts aria-invalid on the Combobox combobox, not the hidden named input', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .validation({ lib: required('Need lib') })
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).placeholder('Pick lib'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    fireEvent.submit(document.querySelector('form')!)
    expect(await screen.findByText('Need lib')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    const hidden = document.querySelector('input[name="lib"]') as HTMLInputElement
    const combo = screen.getByRole('combobox')
    expect(hidden.type).toBe('hidden')
    expect(combo.getAttribute('aria-invalid')).toBe('true')
    expect(combo.getAttribute('aria-describedby')).toBe('fibo-err-lib')
    expect(hidden.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('Select commit live-clears combobox aria-invalid', async () => {
    const user = userEvent.setup()
    render(
      Form()
        .validation({ fruit: required('Need fruit') })
        .children([
          Select().name('fruit').options(FRUIT),
          Button('Save').submit(),
        ])
        .build() as any
    )

    fireEvent.submit(document.querySelector('form')!)
    expect(await screen.findByText('Need fruit')).toBeTruthy()
    const combo = screen.getByRole('combobox')
    expect(combo.getAttribute('aria-invalid')).toBe('true')

    await user.click(combo)
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(screen.queryByText('Need fruit')).toBeNull()
    expect(combo.getAttribute('aria-invalid')).toBeNull()
  })

  it('validates Select.rules on focusout of the combobox', async () => {
    render(
      Form()
        .children([
          Select().name('fruit').options(FRUIT).rules(required('Need fruit')),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const combo = screen.getByRole('combobox')
    fireEvent.focusOut(combo)
    expect(await screen.findByText('Need fruit')).toBeTruthy()
    expect(combo.getAttribute('aria-invalid')).toBe('true')
    const host = combo.closest('.fibo-textfield-container') as HTMLElement
    expect(host.getAttribute('data-touched')).toBe('true')
  })

  it('validates Combobox schema on focusout of the combobox input', async () => {
    render(
      Form()
        .validation({ lib: required('Need lib') })
        .children([
          Combobox().name('lib').options(LIBS).placeholder('BlurLib'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const combo = screen.getByRole('combobox')
    fireEvent.focusOut(combo)
    expect(await screen.findByText('Need lib')).toBeTruthy()
    expect(combo.getAttribute('aria-invalid')).toBe('true')
  })

  it('native Button.reset() clears painted errors and aria-invalid', async () => {
    render(
      Form()
        .validation({ title: required('Need title') })
        .children([
          TextField().name('title').placeholder('ResetTitle'),
          Button('Save').submit(),
          Button('Clear').reset(),
        ])
        .build() as any
    )

    const input = screen.getByPlaceholderText('ResetTitle') as HTMLInputElement
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Need title')).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.queryByText('Need title')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(document.querySelector('.fibo-form-error')).toBeNull()
  })
})
