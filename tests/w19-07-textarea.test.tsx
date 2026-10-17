import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Signal } from '../src/core/state'
import { interp } from '../src/core/interpolate'
import { Button } from '../src/interactive/Button'
import { Form, maxLength, required } from '../src/interactive/Form'
import { Textarea } from '../src/interactive/Textarea'

afterEach(cleanup)

describe('Textarea Form errorMode field (SHOW_ERROR_KEY)', () => {
  it('paints .fibo-field-error on submit and skips .fibo-form-error', async () => {
    const onInvalid = vi.fn()
    const onSubmit = vi.fn()
    render(
      Form()
        .errorMode('field')
        .onInvalid(onInvalid)
        .onSubmit(onSubmit)
        .children([
          Textarea().name('bio').placeholder('notes').rules(required('Required')),
          Button('Save').submit(),
        ]) as any
    )
    fireEvent.submit(screen.getByPlaceholderText('notes').closest('form')!)
    expect(await screen.findByText('Required')).toBeTruthy()
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement
    expect(fieldErr.textContent).toBe('Required')
    expect(fieldErr.style.display).not.toBe('none')
    expect(document.querySelector('.fibo-form-error')).toBeNull()
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.getAttribute('aria-invalid')).toBe('true')
    expect(control.getAttribute('aria-describedby')).toBe('fibo-err-bio')
    expect(onInvalid).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps the painted field error when helper interp ticks', async () => {
    const who = new Signal('Ada')
    render(
      Form()
        .errorMode('field')
        .children([
          Textarea()
            .name('bio')
            .placeholder('notes')
            .helper(`Hint ${interp(who)}`)
            .rules(required('Required')),
          Button('Save').submit(),
        ]) as any
    )
    fireEvent.submit(screen.getByPlaceholderText('notes').closest('form')!)
    expect(await screen.findByText('Required')).toBeTruthy()
    act(() => {
      who.value = 'Bob'
    })
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement
    expect(fieldErr.textContent).toBe('Required')
    expect(fieldErr.style.display).not.toBe('none')
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Bob')
    expect((document.querySelector('.fibo-field-helper') as HTMLElement).style.display).toBe(
      'none'
    )
  })
})

describe('Textarea signal value is live', () => {
  it('shows the signal, writes on type, and patches the DOM on external set', () => {
    const bio = new Signal('hello')
    render(Textarea().value(bio).placeholder('notes') as any)
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.value).toBe('hello')
    fireEvent.change(control, { target: { value: 'typed' } })
    expect(bio.value).toBe('typed')
    expect(control.value).toBe('typed')
    act(() => {
      bio.value = 'world'
    })
    expect(control.value).toBe('world')
    expect(bio.value).toBe('world')
  })
})

describe('Textarea .resize() / .rows()', () => {
  it('stamps resize on the textarea, not the container', () => {
    render(Textarea().resize('none').placeholder('notes') as any)
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.style.resize).toBe('none')
    const host = control.closest('.fibo-textarea-container') as HTMLElement
    expect(host.style.resize).not.toBe('none')
  })

  it('keeps resize when .style() lands on the host', () => {
    render(
      Textarea().resize('none').style({ color: 'rgb(1, 2, 3)' }).placeholder('notes') as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.style.resize).toBe('none')
  })

  it('keeps resize when .props({ style }) also sets control styles', () => {
    render(
      Textarea()
        .resize('none')
        .props({ style: { color: 'rgb(1, 2, 3)' } })
        .placeholder('notes') as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.style.resize).toBe('none')
    expect(control.style.color).toBe('rgb(1, 2, 3)')
  })

  it('honours .rows() on the native control', () => {
    render(Textarea().rows(8).placeholder('notes') as any)
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.rows).toBe(8)
  })
})

describe('Textarea maxLength HTML vs rules', () => {
  it('rules(maxLength) does not set HTML maxlength so the user can exceed and see the error', async () => {
    const onInvalid = vi.fn()
    render(
      Form()
        .errorMode('field')
        .onInvalid(onInvalid)
        .children([
          Textarea()
            .name('bio')
            .placeholder('notes')
            .rules(maxLength(8, 'Maximum 8 characters')),
          Button('Save').submit(),
        ]) as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.maxLength).toBe(-1)
    fireEvent.change(control, { target: { value: '123456789' } })
    expect(control.value).toBe('123456789')
    fireEvent.submit(control.closest('form')!)
    expect(await screen.findByText('Maximum 8 characters')).toBeTruthy()
    expect(onInvalid).toHaveBeenCalledTimes(1)
  })

  it('props({ maxLength }) sets the HTML attribute (native cap, not a rule)', () => {
    render(
      Textarea().name('bio').placeholder('notes').props({ maxLength: 8 }) as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.maxLength).toBe(8)
  })
})
