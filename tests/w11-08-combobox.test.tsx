import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, Combobox, Form, required, listSignal } from '../src'

afterEach(() => {
  cleanup()
})

const LIBS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
]

function hiddenNamed(name: string): HTMLInputElement {
  const el = document.querySelector(`input[name="${name}"]`)
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`missing named input ${name}`)
  }
  return el
}

describe('Combobox .rules()', () => {
  it('required paints the field error and blocks submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).rules(required('Pick a lib')),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = document.querySelector('form') as HTMLFormElement
    const hidden = hiddenNamed('lib')
    expect((hidden as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Pick a lib')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Vue' }))
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ lib: 'vue' })
  })
})

describe('Combobox name hidden input', () => {
  it('named Combobox submits the committed value via hidden input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).placeholder('Pick'),
          Button('Go').submit(),
        ])
        .build() as any
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Vue' }))
    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ lib: 'vue' })
  })
})

describe('Combobox option label interp', () => {
  it('options([{ label: `A ${todos.$length}` }]) updates after add', async () => {
    const todos = listSignal<{ title: string }>([])
    const user = userEvent.setup()
    render(
      Combobox()
        .options([{ label: `A ${todos.$length}`, value: 'a' }])
        .build() as any
    )

    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'A 0' })).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'A 1' })).toBeInTheDocument()
  })
})

describe('Combobox filter', () => {
  it('typing after open filters from the typed query, not the committed label', async () => {
    const user = userEvent.setup()
    render(Combobox().options(LIBS).value('react').build() as any)

    const input = screen.getByRole('combobox') as HTMLInputElement
    await user.click(input)
    expect(screen.getAllByRole('option').map((el) => el.textContent)).toEqual([
      'React',
      'Vue',
      'Angular',
    ])

    await user.keyboard('v')
    expect(input).toHaveValue('v')
    expect(screen.getAllByRole('option').map((el) => el.textContent)).toEqual(['Vue'])
  })

  it('typing a substring still filters once the list is browsing', async () => {
    const user = userEvent.setup()
    render(Combobox().options(LIBS).build() as any)

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('ang')
    expect(screen.getAllByRole('option').map((el) => el.textContent)).toEqual(['Angular'])
  })
})
