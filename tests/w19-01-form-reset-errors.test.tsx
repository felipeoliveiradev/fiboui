import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Button, Form, minLength, required, TextField } from '../src'
import type { FormControl } from '../src/interactive/Form'

afterEach(() => {
  cleanup()
})

describe('W19-01 FormControl.reset leftover painted errors', () => {
  it('reset(name) restores the default and clears leftover field error + aria-invalid', async () => {
    let control: FormControl | undefined
    render(
      Form()
        .validation({ title: minLength(3, 'Min 3') })
        .onInvalid((_errors, form) => {
          control = form
        })
        .children([
          TextField().name('title').placeholder('ResetNamed').value('hello'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const input = screen.getByPlaceholderText('ResetNamed') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'x' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Min 3')).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.value).toBe('x')
    expect(control).toBeTruthy()

    control!.reset('title')

    expect(input.value).toBe('hello')
    expect(screen.queryByText('Min 3')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeNull()
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement | null
    expect(fieldErr?.textContent ?? '').toBe('')
  })

  it('reset(name) clears leftover .fibo-form-error in errorMode below', async () => {
    let control: FormControl | undefined
    render(
      Form()
        .errorMode('below')
        .validation({ title: required('Need title') })
        .onInvalid((_errors, form) => {
          control = form
        })
        .children([
          TextField().name('title').placeholder('ResetBelow'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const input = screen.getByPlaceholderText('ResetBelow') as HTMLInputElement
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Need title')).toBeTruthy()
    expect(document.querySelector('.fibo-form-error')).toBeTruthy()
    expect(control).toBeTruthy()

    control!.reset('title')

    expect(screen.queryByText('Need title')).toBeNull()
    expect(document.querySelector('.fibo-form-error')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
  })

  it('reset() all fields also clears painted errors (parity with native type=reset)', async () => {
    let control: FormControl | undefined
    render(
      Form()
        .validation({ title: required('Need title') })
        .onInvalid((_errors, form) => {
          control = form
        })
        .children([
          TextField().name('title').placeholder('ResetAll'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const input = screen.getByPlaceholderText('ResetAll') as HTMLInputElement
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Need title')).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(control).toBeTruthy()

    control!.reset()

    expect(screen.queryByText('Need title')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(document.querySelector('.fibo-form-error')).toBeNull()
  })
})
