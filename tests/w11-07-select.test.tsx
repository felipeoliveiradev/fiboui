import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, Form, interp, listSignal, required, Select, signal } from '../src'

afterEach(() => {
  cleanup()
})

const FRUIT = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
  { label: 'Cherry', value: 'c' },
]

function hiddenNamed(name: string): HTMLInputElement {
  const el = document.querySelector(`input[name="${name}"]`)
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`missing named input ${name}`)
  }
  return el
}

describe('Select .rules()', () => {
  it('required stamps __fiboRules, blocks submit, and paints the field error', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).rules(required('Need fruit')),
          Button('Save').submit(),
        ])
        .build()
    )

    const hidden = hiddenNamed('fruit')
    expect((hidden as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(hidden.closest('form')!)
    expect(await screen.findByText('Need fruit')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('aria-describedby', 'fibo-err-fruit')
    expect(document.getElementById('fibo-err-fruit')?.getAttribute('role')).toBe('alert')
  })

  it('opening the list after a failed submit keeps the painted error', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).rules(required('Need fruit')),
          Button('Save').submit(),
        ])
        .build()
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Need fruit')).toBeTruthy()

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Need fruit')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('commit after rules failure submits the named value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).rules(required('Need fruit')),
          Button('Save').submit(),
        ])
        .build()
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Need fruit')).toBeTruthy()

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    expect(screen.queryByText('Need fruit')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ fruit: 'a' })
  })
})

describe('Select .error() a11y', () => {
  it('named error span id is wired to the visible combobox', () => {
    render(
      Select().name('fruit').error('Must pick').label('Fruit').options(FRUIT).build()
    )
    const trigger = screen.getByRole('combobox')
    const err = document.getElementById('fibo-err-fruit')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Must pick')
    expect(err?.getAttribute('role')).toBe('alert')
    expect((err as HTMLElement).style.display).not.toBe('none')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAttribute('aria-describedby', 'fibo-err-fruit')
  })
})

describe('Select option interp', () => {
  it('option labels with $length update while the list is open', async () => {
    const user = userEvent.setup()
    const todos = listSignal<{ title: string }>([])
    render(
      Select()
        .options([{ label: `A ${todos.$length}`, value: 'a' }])
        .build()
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'A 0' })).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('option', { name: 'A 1' })).toBeInTheDocument()
  })

  it('selected option label interp updates the closed trigger', () => {
    const name = signal('Ada')
    render(
      Select()
        .value('x')
        .options([{ label: `Hi ${interp(name)}`, value: 'x' }])
        .build()
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Hi Ada')
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByRole('combobox')).toHaveTextContent('Hi Bob')
  })
})

describe('Select keyboard highlight', () => {
  it('opens on the current value so Enter does not steal the selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(Select().value('b').options(FRUIT).onChange(onChange).build())

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Banana')
    await user.click(trigger)

    const banana = screen.getByRole('option', { name: 'Banana' })
    expect(trigger).toHaveAttribute('aria-activedescendant', banana.id)
    expect(banana).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalledWith('a')
    expect(trigger).toHaveTextContent('Banana')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ArrowDown from a selected middle option moves to the next option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(Select().value('b').options(FRUIT).onChange(onChange).build())

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('c')
  })
})
