import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'
import { Checkbox } from '../src/interactive/Checkbox'
import { Form, required } from '../src/interactive/Form'
import { RadioGroup } from '../src/interactive/RadioGroup'
import { Switch } from '../src/interactive/Switch'

afterEach(() => {
  cleanup()
})

const OPTIONS = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
]

describe('RadioGroup a11y', () => {
  it('exposes radios without hidden:true', () => {
    render(RadioGroup().options(OPTIONS).value('a').build() as any)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toBeChecked()
    expect(radios[0].closest('[aria-hidden="true"]')).toBeNull()
  })
})

describe('unnamed controls omit FormData keys', () => {
  it('unnamed RadioGroup does not inject useId into FormData; named groups submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          RadioGroup().options(OPTIONS).value('a'),
          RadioGroup().name('plan').options(OPTIONS).value('b'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const form = document.querySelector('form') as HTMLFormElement
    const radios = within(form).getAllByRole('radio') as HTMLInputElement[]
    radios.forEach((el) => {
      const name = el.name
      expect(name === '' || name === 'plan').toBe(true)
      expect(name).not.toMatch(/^[:_]/)
    })

    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ plan: 'b' })
  })

  it('unnamed Checkbox and Switch are omitted from FormData', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Checkbox().label('AnonBox').checked(true),
          Switch().label('AnonSwitch').checked(true),
          Checkbox().name('agree').label('NamedBox').checked(true),
          Switch().name('dark').label('NamedSwitch').checked(true),
          Button('Save').submit(),
        ])
        .build() as any
    )

    fireEvent.submit(screen.getByRole('checkbox', { name: 'AnonBox' }).closest('form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ agree: 'on', dark: 'on' })
  })
})

describe('focus ring on decorative control', () => {
  it('Checkbox box, Switch track, and Radio circle keep the focus ring inside the control', () => {
    render(
      <>
        {Checkbox().label('RingBox').build()}
        {Switch().label('RingSwitch').build()}
        {RadioGroup().options(OPTIONS).value('a').build()}
      </>
    )

    const box = document.querySelector('.fibo-checkbox-box') as HTMLElement
    const track = document.querySelector('.fibo-switch-track') as HTMLElement
    const circle = document.querySelector('.fibo-radio-circle') as HTMLElement
    for (const el of [box, track, circle]) {
      expect(el).toBeTruthy()
      expect(el.className).not.toMatch(/focus-within:ring/)
      expect(el.className).not.toMatch(/ring-offset/)
      expect(el.getAttribute('aria-hidden')).toBe('true')
    }

    const css = readFileSync(resolve(__dirname, '../src/styles/core.css'), 'utf8')
    expect(css).toContain('.group:focus-within .fibo-checkbox-box')
    expect(css).toContain('.group:focus-within .fibo-switch-track')
    expect(css).toContain('.group:focus-within .fibo-radio-circle')
    expect(css).toContain('box-shadow: inset 0 0 0 2px var(--fibo-primary, #3b82f6) !important')
  })
})

describe('RadioGroup.rules', () => {
  it('attaches __fiboRules and paints the field error on submit', async () => {
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
    const first = within(form).getAllByRole('radio')[0] as HTMLInputElement
    expect((first as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0)

    fireEvent.submit(form)
    expect(await screen.findByText('Pick a plan')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.click(within(form).getByRole('radio', { name: 'A' }))
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ plan: 'a' })
  })
})

describe('named RadioGroup FormData', () => {
  it('keeps a shared name across options', () => {
    render(
      RadioGroup()
        .name('plan')
        .options(OPTIONS)
        .value('a')
        .build() as any
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios).toHaveLength(2)
    expect(radios.map((r) => r.name)).toEqual(['plan', 'plan'])
  })
})
