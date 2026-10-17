import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RadioGroup } from '../src/interactive/RadioGroup'
import { listSignal } from '../src/index'

afterEach(cleanup)

const OPTIONS = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
]

describe('RadioGroup .error() a11y (parity with Switch/Checkbox)', () => {
  it('named error paints alert, id, aria-invalid and aria-describedby on radios', () => {
    render(
      RadioGroup()
        .name('plan')
        .options(OPTIONS)
        .error('Pick a plan')
        .build() as any
    )
    const err = document.getElementById('fibo-err-plan')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Pick a plan')
    expect(err?.getAttribute('role')).toBe('alert')
    expect((err as HTMLElement).style.display).not.toBe('none')
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    for (const radio of radios) {
      expect(radio.getAttribute('aria-invalid')).toBe('true')
      expect(radio.getAttribute('aria-describedby')).toBe('fibo-err-plan')
    }
    const group = document.querySelector('.fibo-radio-group')
    expect(group?.getAttribute('aria-invalid')).toBe('true')
    expect(group?.getAttribute('aria-describedby')).toBe('fibo-err-plan')
  })

  it('error interp keeps a11y wiring after signal update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      RadioGroup()
        .name('plan')
        .options([{ label: 'A', value: 'a' }])
        .error(`Need ${todos.$length}`)
        .build() as any
    )
    const radio = screen.getByRole('radio', { name: 'A' })
    expect(document.getElementById('fibo-err-plan')?.textContent).toBe('Need 0')
    expect(radio.getAttribute('aria-invalid')).toBe('true')
    expect(radio.getAttribute('aria-describedby')).toBe('fibo-err-plan')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(document.getElementById('fibo-err-plan')?.textContent).toBe('Need 1')
    expect(radio.getAttribute('aria-invalid')).toBe('true')
    expect(radio.getAttribute('aria-describedby')).toBe('fibo-err-plan')
    expect((screen.getByRole('radio') as HTMLInputElement).name).toBe('plan')
  })
})

describe('RadioGroup keyboard', () => {
  it('ArrowDown/ArrowUp move selection and focus, wrapping, unnamed stays out of FormData', () => {
    const onChange = vi.fn()
    render(
      RadioGroup()
        .options(OPTIONS)
        .value('a')
        .onChange(onChange)
        .build() as any
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios[0]).toBeChecked()
    expect(radios.map((r) => r.name)).toEqual(['', '', ''])
    expect(radios[0].tabIndex).toBe(0)
    expect(radios[1].tabIndex).toBe(-1)
    expect(radios[2].tabIndex).toBe(-1)

    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: 'ArrowDown' })
    expect(radios[1]).toBeChecked()
    expect(radios[1]).toHaveFocus()
    expect(onChange).toHaveBeenLastCalledWith('b')
    expect(radios[0].tabIndex).toBe(-1)
    expect(radios[1].tabIndex).toBe(0)

    fireEvent.keyDown(radios[1], { key: 'ArrowDown' })
    expect(radios[2]).toBeChecked()
    fireEvent.keyDown(radios[2], { key: 'ArrowDown' })
    expect(radios[0]).toBeChecked()
    expect(radios[0]).toHaveFocus()

    fireEvent.keyDown(radios[0], { key: 'ArrowUp' })
    expect(radios[2]).toBeChecked()
    fireEvent.keyDown(radios[2], { key: 'Home' })
    expect(radios[0]).toBeChecked()
    fireEvent.keyDown(radios[0], { key: 'End' })
    expect(radios[2]).toBeChecked()
  })

  it('named group arrows skip disabled options and keep shared name', () => {
    const onChange = vi.fn()
    render(
      RadioGroup()
        .name('plan')
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
          { label: 'C', value: 'c' },
        ])
        .value('a')
        .onChange(onChange)
        .build() as any
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.map((r) => r.name)).toEqual(['plan', 'plan', 'plan'])
    radios[0].focus()
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' })
    expect(radios[2]).toBeChecked()
    expect(radios[2]).toHaveFocus()
    expect(onChange).toHaveBeenCalledWith('c')
    expect(radios[1]).not.toBeChecked()
  })
})
