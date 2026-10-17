import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, Combobox, Form, required } from '../src'

afterEach(() => {
  cleanup()
})

const LIBS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
]

function hiddenNamedAll(name: string): HTMLInputElement[] {
  return [...document.querySelectorAll(`input[name="${name}"]`)].filter(
    (el): el is HTMLInputElement => el instanceof HTMLInputElement
  )
}

describe('W19-04 Combobox disabled still opens', () => {
  it('disabled Combobox does not open the listbox on click or focus', async () => {
    const user = userEvent.setup()
    render(Combobox().disabled().options(LIBS).placeholder('Pick').build())

    const input = screen.getByRole('combobox')
    expect(input).toBeDisabled()
    await user.click(input)
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.focus(input)
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('disabled multiple Combobox does not remove tags', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      Combobox()
        .disabled()
        .multiple()
        .name('libs')
        .value(['react', 'vue'])
        .options(LIBS)
        .onChange(onChange)
        .build()
    )

    expect(hiddenNamedAll('libs').map((el) => el.value)).toEqual(['react', 'vue'])
    await user.click(screen.getByRole('button', { name: 'Remove React' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(hiddenNamedAll('libs').map((el) => el.value)).toEqual(['react', 'vue'])
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})

describe('W19-04 Combobox committed value vs typed draft', () => {
  it('submit sends the committed hidden value, not the typed draft', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').value('react').options(LIBS),
          Button('Go').submit(),
        ])
        .build()
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('zzzz')
    expect(input).toHaveValue('zzzz')
    expect(screen.getByText('No results found.')).toBeTruthy()
    expect(hiddenNamedAll('lib')[0].value).toBe('react')

    await user.click(screen.getByRole('button', { name: 'Go' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ lib: 'react' })
  })
})

describe('W19-04 Combobox multiple FormData', () => {
  it('picking two options writes two same-name hiddens, not one comma string', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('libs').multiple().options(LIBS),
          Button('Go').submit(),
        ])
        .build()
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'React' }))
    await user.click(screen.getByRole('option', { name: 'Vue' }))

    const values = hiddenNamedAll('libs').map((el) => el.value)
    expect(values).toEqual(['react', 'vue'])
    expect(values.join(',')).not.toBe(values[0])

    await user.click(screen.getByRole('button', { name: 'Go' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ libs: ['react', 'vue'] })
  })

  it('comma inside a selected value is not split across FormData', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox()
            .name('libs')
            .multiple()
            .value(['a,b', 'c'])
            .options([
              { label: 'A,B', value: 'a,b' },
              { label: 'C', value: 'c' },
            ]),
          Button('Go').submit(),
        ])
        .build()
    )

    expect(hiddenNamedAll('libs').map((el) => el.value)).toEqual(['a,b', 'c'])
    await user.click(screen.getByRole('button', { name: 'Go' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ libs: ['a,b', 'c'] })
  })
})

describe('W19-04 Combobox rules RULES_KEY', () => {
  it('attaches __fiboRules on the hidden named input', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).rules(required('Pick a lib')),
          Button('Save').submit(),
        ])
        .build()
    )

    const hidden = hiddenNamedAll('lib')[0]
    expect(hidden).toBeTruthy()
    expect((hidden as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(document.querySelector('form')!)
    expect(await screen.findByText('Pick a lib')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('W19-04 Combobox keyboard leftover', () => {
  it('Escape closes the list and restores the committed label', async () => {
    const user = userEvent.setup()
    render(Combobox().options(LIBS).value('react').build())

    const input = screen.getByRole('combobox') as HTMLInputElement
    await user.click(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('v')
    expect(input).toHaveValue('v')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input).toHaveValue('React')
  })

  it('Escape while closed does not preventDefault leftover', async () => {
    const user = userEvent.setup()
    const onEsc = vi.fn()
    render(
      <div
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !event.defaultPrevented) onEsc()
        }}
      >
        {Combobox().options(LIBS).value('react').build()}
      </div>
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    onEsc.mockClear()

    await user.keyboard('{Escape}')
    expect(onEsc).toHaveBeenCalled()
  })

  it('ArrowDown opens and Enter commits the highlight', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(Combobox().options(LIBS).onChange(onChange).name('lib').build())

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('vue')
    expect(hiddenNamedAll('lib')[0].value).toBe('vue')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('W19-04 Combobox onAdd vs filter XSS', () => {
  it('filter/add payload is text, not HTML', async () => {
    const user = userEvent.setup()
    const payload = '<img src=x onerror="alert(1)">'
    const onAdd = vi.fn()
    render(
      Combobox()
        .options([{ label: payload, value: 'xss' }, { label: 'Safe', value: 'ok' }])
        .onAdd(onAdd)
        .build()
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    const option = screen.getByRole('option', { name: payload })
    expect(option.querySelector('img')).toBeNull()
    expect(option.textContent).toBe(payload)

    fireEvent.change(input, { target: { value: `${payload} extra` } })
    const add = screen.getByText(`Add "${payload} extra"`)
    expect(add.querySelector('img')).toBeNull()
    await user.click(add)
    expect(onAdd).toHaveBeenCalledWith(`${payload} extra`)
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})
