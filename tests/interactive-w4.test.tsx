import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'
import { Checkbox } from '../src/interactive/Checkbox'
import { Form, required } from '../src/interactive/Form'
import { Switch } from '../src/interactive/Switch'
import { Textarea } from '../src/interactive/Textarea'
import { TextField } from '../src/interactive/TextField'

afterEach(() => {
  cleanup()
})

describe('static error a11y (parity with TextField)', () => {
  it('Checkbox .error() paints, sets span id, aria-invalid and aria-describedby', () => {
    render(Checkbox().name('agree').error('Must accept').label('Agree') as any)
    const input = screen.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    const err = document.getElementById('fibo-err-agree')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Must accept')
    expect(err?.getAttribute('role')).toBe('alert')
    expect((err as HTMLElement).style.display).not.toBe('none')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-agree')
  })

  it('Switch .error() paints, sets span id, aria-invalid and aria-describedby', () => {
    render(Switch().name('dark').error('Required').label('Dark mode') as any)
    const input = screen.getByRole('switch', { name: 'Dark mode' }) as HTMLInputElement
    const err = document.getElementById('fibo-err-dark')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Required')
    expect(err?.getAttribute('role')).toBe('alert')
    expect((err as HTMLElement).style.display).not.toBe('none')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-dark')
  })
})

describe('labelledby / htmlFor', () => {
  it('Checkbox label htmlFor matches the input id', () => {
    render(Checkbox().label('Terms') as any)
    const input = screen.getByRole('checkbox', { name: 'Terms' }) as HTMLInputElement
    expect(input.id).toBeTruthy()
    const label = input.closest('label')
    expect(label).toBeTruthy()
    expect(label?.htmlFor).toBe(input.id)
  })

  it('Switch label htmlFor matches the input id', () => {
    render(Switch().label('Alerts') as any)
    const input = screen.getByRole('switch', { name: 'Alerts' }) as HTMLInputElement
    expect(input.id).toBeTruthy()
    const label = input.closest('label')
    expect(label).toBeTruthy()
    expect(label?.htmlFor).toBe(input.id)
  })
})

describe('Switch / Checkbox ARIA state', () => {
  it('Switch exposes aria-checked and updates it on toggle', async () => {
    render(Switch().label('Dark').build() as any)
    const input = screen.getByRole('switch', { name: 'Dark' }) as HTMLInputElement
    expect(input.getAttribute('aria-checked')).toBe('false')
    await userEvent.click(input)
    expect(input.getAttribute('aria-checked')).toBe('true')
  })

  it('Checkbox indeterminate sets aria-checked=mixed', () => {
    render(Checkbox().label('All').indeterminate(true).build() as any)
    const input = screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement
    expect(input.getAttribute('aria-checked')).toBe('mixed')
  })
})

describe('TextField remaining a11y / mask leftover', () => {
  it('password toggle has an accessible name', () => {
    render(TextField().type('password').placeholder('Pwd') as any)
    const toggle = screen.getByRole('button', { name: /password/i })
    expect(toggle).toBeTruthy()
    expect(toggle.getAttribute('type')).toBe('button')
  })

  it('mask truncates leftover extra digits on mount and on type', () => {
    render(
      TextField().mask('(999) 999-9999').value('12345678901234').placeholder('Phone') as any
    )
    const input = screen.getByPlaceholderText('Phone') as HTMLInputElement
    expect(input.value).toBe('(123) 456-7890')
    expect(input.hasAttribute('mask')).toBe(false)
    fireEvent.change(input, { target: { value: '98765432109999' } })
    expect(input.value).toBe('(987) 654-3210')
  })
})

describe('unnamed TextField / Textarea omit FormData keys', () => {
  it('unnamed TextField and Textarea do not appear in submit values', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().placeholder('AnonField').value('secret'),
          Textarea().placeholder('AnonArea').value('notes'),
          TextField().name('email').placeholder('NamedField').value('a@b.c'),
          Textarea().name('bio').placeholder('NamedArea').value('hello'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = screen.getByPlaceholderText('AnonField').closest('form') as HTMLFormElement
    const anonField = screen.getByPlaceholderText('AnonField') as HTMLInputElement
    const anonArea = screen.getByPlaceholderText('AnonArea') as HTMLTextAreaElement
    expect(anonField.name).toBe('')
    expect(anonArea.name).toBe('')

    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.c', bio: 'hello' })
  })
})

describe('disabled fields skip FormData and required', () => {
  it('disabled named Checkbox / Switch / Textarea are omitted and do not fail required', async () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    render(
      Form()
        .validation({
          agree: required('Need agree'),
          dark: required('Need dark'),
          bio: required('Need bio'),
        })
        .onSubmit(onSubmit)
        .onInvalid(onInvalid)
        .children([
          Checkbox().name('agree').label('Agree').checked(true).disabled(),
          Switch().name('dark').label('Dark').checked(true).disabled(),
          Textarea().name('bio').placeholder('Bio').value('hello').disabled(),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const agree = screen.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    const dark = screen.getByRole('switch', { name: 'Dark' }) as HTMLInputElement
    const bio = screen.getByPlaceholderText('Bio') as HTMLTextAreaElement
    expect(agree.disabled).toBe(true)
    expect(dark.disabled).toBe(true)
    expect(bio.disabled).toBe(true)

    fireEvent.submit(agree.closest('form')!)
    expect(onInvalid).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({})
  })
})

describe('Checkbox / Switch / Textarea .rules()', () => {
  it('Checkbox.rules required paints the field error and blocks submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Checkbox().name('agree').label('Agree').rules(required('Accept the terms')),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = document.querySelector('form') as HTMLFormElement
    const box = within(form).getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    expect((box as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Accept the terms')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(box.getAttribute('aria-invalid')).toBe('true')
    expect(box.getAttribute('aria-describedby')).toBe('fibo-err-agree')

    await userEvent.click(box)
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ agree: 'on' })
  })

  it('Switch.rules required paints the field error and blocks submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Switch().name('alerts').label('Alerts').rules(required('Turn alerts on')),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = document.querySelector('form') as HTMLFormElement
    const sw = within(form).getByRole('switch', { name: 'Alerts' }) as HTMLInputElement
    expect((sw as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Turn alerts on')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(sw.getAttribute('aria-invalid')).toBe('true')

    await userEvent.click(sw)
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ alerts: 'on' })
  })

  it('Textarea.rules required paints the field error and blocks submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Textarea().name('bio').placeholder('Bio').rules(required('Write a bio')),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = document.querySelector('form') as HTMLFormElement
    const ta = screen.getByPlaceholderText('Bio') as HTMLTextAreaElement
    expect((ta as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Write a bio')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(ta.getAttribute('aria-invalid')).toBe('true')
    expect(ta.getAttribute('aria-describedby')).toBe('fibo-err-bio')
    const err = document.getElementById('fibo-err-bio')
    expect(err?.style.display).not.toBe('none')

    fireEvent.change(ta, { target: { value: 'Hello there' } })
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ bio: 'Hello there' })
  })
})
