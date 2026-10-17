import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'
import { Form, required } from '../src/interactive/Form'
import { RadioGroup } from '../src/interactive/RadioGroup'

afterEach(cleanup)

const OPTIONS = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
]

describe('W19-08 RadioGroup hunt', () => {
  it('named group uses roving tabindex (selected 0, others -1) and arrows update it', () => {
    render(
      RadioGroup()
        .name('plan')
        .options(OPTIONS)
        .value('a')
        .build() as any
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios[0].tabIndex).toBe(0)
    expect(radios[1].tabIndex).toBe(-1)
    expect(radios[2].tabIndex).toBe(-1)

    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: 'ArrowDown' })
    expect(radios[1]).toBeChecked()
    expect(radios[1]).toHaveFocus()
    expect(radios[0].tabIndex).toBe(-1)
    expect(radios[1].tabIndex).toBe(0)
    expect(radios[2].tabIndex).toBe(-1)
  })

  it('disabled option is not selected even when .value() points at it', () => {
    const onChange = vi.fn()
    render(
      RadioGroup()
        .name('plan')
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
          { label: 'C', value: 'c' },
        ])
        .value('b')
        .onChange(onChange)
        .build() as any
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios[1]).toBeDisabled()
    expect(radios[1]).not.toBeChecked()
    expect(radios[0]).not.toBeChecked()
    expect(radios[2]).not.toBeChecked()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clicking a disabled option does not select it', async () => {
    const onChange = vi.fn()
    render(
      RadioGroup()
        .name('plan')
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ])
        .value('a')
        .onChange(onChange)
        .build() as any
    )
    await userEvent.click(screen.getByText('B'))
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios[0]).toBeChecked()
    expect(radios[1]).not.toBeChecked()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('two named groups with different names do not leak selection', async () => {
    render(
      <>
        {RadioGroup().name('plan').options(OPTIONS).value('a').build()}
        {RadioGroup().name('size').options(OPTIONS).value('c').build()}
      </>
    )
    const groups = document.querySelectorAll('.fibo-radio-group')
    const plan = within(groups[0] as HTMLElement).getAllByRole('radio') as HTMLInputElement[]
    const size = within(groups[1] as HTMLElement).getAllByRole('radio') as HTMLInputElement[]
    expect(plan[0]).toBeChecked()
    expect(size[2]).toBeChecked()
    await userEvent.click(size[0])
    expect(size[0]).toBeChecked()
    expect(plan[0]).toBeChecked()
    expect(plan[0].name).toBe('plan')
    expect(size[0].name).toBe('size')
  })

  it('two unnamed groups stay independent (no shared name leak)', async () => {
    render(
      <>
        {RadioGroup().options(OPTIONS).value('a').build()}
        {RadioGroup().options(OPTIONS).value('c').build()}
      </>
    )
    const groups = document.querySelectorAll('.fibo-radio-group')
    const first = within(groups[0] as HTMLElement).getAllByRole('radio') as HTMLInputElement[]
    const second = within(groups[1] as HTMLElement).getAllByRole('radio') as HTMLInputElement[]
    expect(first.map((r) => r.name)).toEqual(['', '', ''])
    expect(second.map((r) => r.name)).toEqual(['', '', ''])
    expect(first[0]).toBeChecked()
    expect(second[2]).toBeChecked()
    await userEvent.click(second[1])
    expect(second[1]).toBeChecked()
    expect(first[0]).toBeChecked()
    expect(first[1]).not.toBeChecked()
  })

  it('FormData omits the name when none selected; .rules(required()) still blocks submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          RadioGroup().name('plan').options(OPTIONS).rules(required('Pick a plan')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = document.querySelector('form') as HTMLFormElement
    const radios = within(form).getAllByRole('radio') as HTMLInputElement[]
    expect(radios.some((r) => r.checked)).toBe(false)
    expect(new FormData(form).get('plan')).toBeNull()
    const carrier = radios.find((r) => !r.disabled) as HTMLInputElement & { __fiboRules?: unknown[] }
    expect(carrier.__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Pick a plan')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('collects .rules() when the first option is disabled', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          RadioGroup()
            .name('plan')
            .options([
              { label: 'A', value: 'a', disabled: true },
              { label: 'B', value: 'b' },
            ])
            .rules(required('Pick a plan')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)
    expect(await screen.findByText('Pick a plan')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(new FormData(form).get('plan')).toBeNull()

    await userEvent.click(within(form).getByRole('radio', { name: 'B' }))
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ plan: 'b' })
  })

  it('disabled selected value is omitted from FormData so required still fails', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          RadioGroup()
            .name('plan')
            .options([
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b', disabled: true },
            ])
            .value('b')
            .rules(required('Pick a plan')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = document.querySelector('form') as HTMLFormElement
    expect(new FormData(form).get('plan')).toBeNull()
    fireEvent.submit(form)
    expect(await screen.findByText('Pick a plan')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
