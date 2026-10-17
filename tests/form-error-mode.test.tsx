import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { FormErrorMode as RootFormErrorMode } from '../src'
import {
  Button,
  Form,
  required,
  TextField,
} from '../src/interactive-entry'
import type { FormErrorMode } from '../src/interactive-entry'

afterEach(() => {
  cleanup()
})

const MODES: FormErrorMode[] = ['field', 'below', 'manual']
const _rootModes: RootFormErrorMode[] = MODES

function submitTitle(mode?: FormErrorMode, onInvalid = vi.fn(), onSubmit = vi.fn()) {
  const builder = Form()
    .validation({ title: required('Need title') })
    .onInvalid(onInvalid)
    .onSubmit(onSubmit)
    .children([
      TextField().name('title').placeholder('ErrTitle'),
      Button('Save').submit(),
    ])
  if (mode) builder.errorMode(mode)
  render(builder.build() as any)
  fireEvent.submit(screen.getByPlaceholderText('ErrTitle').closest('form')!)
  return { onInvalid, onSubmit }
}

describe('FormErrorMode export', () => {
  it('is re-exported from the package root and fiboui/interactive (interactive-entry)', () => {
    const root = readFileSync(resolve(__dirname, '../src/index.ts'), 'utf8')
    const interactive = readFileSync(
      resolve(__dirname, '../src/interactive-entry.ts'),
      'utf8'
    )
    expect(root).toMatch(/export type \{[\s\S]*\bFormErrorMode\b[\s\S]*\} from '\.\/interactive\/Form'/)
    expect(interactive).toMatch(/export type \{ FormErrorMode \} from '\.\/interactive\/Form'/)
    expect(interactive).toMatch(/\bForm\b/)
    expect(_rootModes).toEqual(['field', 'below', 'manual'])
    expect(MODES).toEqual(['field', 'below', 'manual'])
  })

  it('interactive-entry Form is a builder and submits named fields', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().name('email').placeholder('EntryEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    expect(typeof Form).toBe('function')
    const input = screen.getByPlaceholderText('EntryEmail') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a@b.c' } })
    fireEvent.submit(input.closest('form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.c' })
  })
})

describe('Form.errorMode', () => {
  it('field (default) paints .fibo-field-error and skips .fibo-form-error', async () => {
    const { onInvalid, onSubmit } = submitTitle('field')
    expect(await screen.findByText('Need title')).toBeTruthy()
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement | null
    expect(fieldErr?.textContent).toBe('Need title')
    expect(fieldErr?.style.display).not.toBe('none')
    expect(document.querySelector('.fibo-form-error')).toBeNull()
    await vi.waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))
    expect(onInvalid.mock.calls[0][0]).toEqual({ title: 'Need title' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('below paints .fibo-form-error after the host and hides the field span', async () => {
    const { onInvalid, onSubmit } = submitTitle('below')
    expect(await screen.findByText('Need title')).toBeTruthy()
    const generic = document.querySelector('.fibo-form-error') as HTMLElement | null
    expect(generic?.textContent).toBe('Need title')
    expect(generic?.getAttribute('data-for')).toBe('title')
    const host = document.querySelector('.fibo-textfield-container')
    expect(generic?.previousElementSibling).toBe(host)
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement | null
    expect(fieldErr?.style.display).toBe('none')
    expect(onInvalid).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('manual only calls onInvalid — no painted field or below error', async () => {
    const { onInvalid, onSubmit } = submitTitle('manual')
    await vi.waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1))
    expect(onInvalid.mock.calls[0][0]).toEqual({ title: 'Need title' })
    expect(screen.queryByText('Need title')).toBeNull()
    expect(document.querySelector('.fibo-form-error')).toBeNull()
    const fieldErr = document.querySelector('.fibo-field-error') as HTMLElement | null
    expect(fieldErr?.textContent).toBe('')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('Form.errorMode on blur', () => {
  it('below paints .fibo-form-error after focusout', async () => {
    render(
      Form()
        .errorMode('below')
        .children([
          TextField().name('title').placeholder('BlurBelow').rules(required('Need title')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('BlurBelow') as HTMLInputElement
    fireEvent.focusOut(input)
    expect(await screen.findByText('Need title')).toBeTruthy()
    const generic = document.querySelector('.fibo-form-error') as HTMLElement | null
    expect(generic?.textContent).toBe('Need title')
    expect(generic?.getAttribute('data-for')).toBe('title')
  })

  it('manual does not paint on focusout', async () => {
    render(
      Form()
        .errorMode('manual')
        .children([
          TextField().name('title').placeholder('BlurManual').rules(required('Need title')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('BlurManual') as HTMLInputElement
    fireEvent.focusOut(input)
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText('Need title')).toBeNull()
    expect(document.querySelector('.fibo-form-error')).toBeNull()
  })
})
