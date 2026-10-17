import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'
import { Checkbox } from '../src/interactive/Checkbox'
import { Form, required } from '../src/interactive/Form'

afterEach(cleanup)

type ErrorHost = HTMLElement & {
  __fiboShowError?: (msg: string | null) => void
  __fiboRules?: unknown[]
}

describe('W19-05 Checkbox indeterminate DOM / a11y', () => {
  it('sets input.indeterminate and aria-checked=mixed', () => {
    render(Checkbox().label('All').indeterminate(true).build() as any)
    const input = screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    expect(input.getAttribute('aria-checked')).toBe('mixed')
  })

  it('keeps input.indeterminate after controlled click when parent still passes mixed', async () => {
    function Host() {
      const [checked, setChecked] = useState(false)
      return Checkbox()
        .controlled(true)
        .checked(checked)
        .indeterminate(true)
        .label('All')
        .onChange(setChecked)
        .build()
    }
    render(<Host />)
    const input = screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    await userEvent.click(input)
    expect(input.indeterminate).toBe(true)
    expect(input.getAttribute('aria-checked')).toBe('mixed')
  })
})

describe('W19-05 Checkbox label click / associated id', () => {
  it('label htmlFor matches input id and text click toggles once', async () => {
    render(Checkbox().label('Terms').build() as any)
    const input = screen.getByRole('checkbox', { name: 'Terms' }) as HTMLInputElement
    const label = input.closest('label')
    expect(input.id).toBeTruthy()
    expect(label?.htmlFor).toBe(input.id)
    expect(input.checked).toBe(false)
    await userEvent.click(screen.getByText('Terms'))
    expect(input.checked).toBe(true)
    await userEvent.click(screen.getByText('Terms'))
    expect(input.checked).toBe(false)
  })
})

describe('W19-05 Checkbox FormData vs required', () => {
  it('unchecked named box is omitted from FormData but .rules(required) still blocks', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Checkbox().name('agree').label('Agree').value('yes').rules(required('Accept the terms')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = document.querySelector('form') as HTMLFormElement
    const box = screen.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement
    expect(new FormData(form).has('agree')).toBe(false)
    expect((box as unknown as ErrorHost).__fiboRules?.length).toBeGreaterThan(0)
    const host = box.closest('.fibo-checkbox-container') as ErrorHost | null
    expect(host?.__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Accept the terms')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.click(box)
    expect(new FormData(form).get('agree')).toBe('yes')
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ agree: 'yes' })
  })
})

describe('W19-05 unnamed error host SHOW_ERROR_KEY', () => {
  it('unnamed host exposes __fiboShowError that paints the field error', () => {
    render(Checkbox().label('Anon').error('Must accept').build() as any)
    const input = screen.getByRole('checkbox', { name: 'Anon' }) as HTMLInputElement
    const host = input.closest('.fibo-checkbox-container') as ErrorHost | null
    expect(typeof host?.__fiboShowError).toBe('function')
    host!.__fiboShowError!('Nope')
    const err = host!.querySelector('.fibo-field-error') as HTMLElement
    expect(err.textContent).toBe('Nope')
    expect(err.style.display).not.toBe('none')
    host!.__fiboShowError!(null)
    expect(err.textContent).toBe('')
    expect(err.style.display).toBe('none')
  })
})
