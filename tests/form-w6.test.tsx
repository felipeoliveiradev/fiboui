import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  Form,
  required,
  url,
  integer,
  equalTo,
} from '../src/interactive/Form'
import { runFieldRules } from '../src/interactive/Form/validators'
import { TextField } from '../src/interactive/TextField'
import { Button } from '../src/interactive/Button'

afterEach(() => {
  cleanup()
})

describe('url / integer / equalTo validators', () => {
  it('url() skips empty (like email) and accepts absolute URLs', async () => {
    const rule = url('bad url')
    expect(rule.message).toBe('bad url')
    expect(await rule.check('', {})).toBe(true)
    expect(await rule.check('   ', {})).toBe(true)
    expect(await rule.check('https://example.com/x', {})).toBe(true)
    expect(await rule.check('http://localhost:3000', {})).toBe(true)
    expect(await rule.check('not a url', {})).toBe(false)
    expect(await rule.check('example.com', {})).toBe(false)
    expect(await runFieldRules({ site: '' }, { site: url() })).toEqual({})
    expect(await runFieldRules({ site: 'https://x.test' }, { site: url() })).toEqual({})
    expect(await runFieldRules({ site: 'nope' }, { site: url('bad url') })).toEqual({
      site: 'bad url',
    })
  })

  it('url() rejects javascript: and data:', async () => {
    const rule = url()
    expect(await rule.check('javascript:alert(1)', {})).toBe(false)
    expect(await rule.check('data:text/html,<script>alert(1)</script>', {})).toBe(false)
    expect(await rule.check('vbscript:msgbox(1)', {})).toBe(false)
    expect(await rule.check('file:///etc/passwd', {})).toBe(false)
    expect(await rule.check('/path', {})).toBe(false)
  })

  it('url() accepts https://x.test', async () => {
    const rule = url()
    expect(await rule.check('https://x.test', {})).toBe(true)
    expect(await rule.check('https://example.com', {})).toBe(true)
    expect(await rule.check('http://example.com', {})).toBe(true)
  })

  it('empty url() passes', async () => {
    const rule = url()
    expect(await rule.check('', {})).toBe(true)
    expect(await rule.check('   ', {})).toBe(true)
  })

  it('integer() skips empty and rejects non-integers', async () => {
    const rule = integer('int')
    expect(rule.message).toBe('int')
    expect(await rule.check('', {})).toBe(true)
    expect(await rule.check('  ', {})).toBe(true)
    expect(await rule.check('42', {})).toBe(true)
    expect(await rule.check('-7', {})).toBe(true)
    expect(await rule.check(' 8 ', {})).toBe(true)
    expect(await rule.check('3.14', {})).toBe(false)
    expect(await rule.check('1e3', {})).toBe(false)
    expect(await rule.check('1.0', {})).toBe(false)
    expect(await rule.check('abc', {})).toBe(false)
    expect(await runFieldRules({ n: '' }, { n: integer() })).toEqual({})
    expect(await runFieldRules({ n: '9' }, { n: integer() })).toEqual({})
    expect(await runFieldRules({ n: '9.5' }, { n: integer('int') })).toEqual({ n: 'int' })
  })

  it('equalTo(other) compares against sibling field text', async () => {
    const rule = equalTo('password', 'Must match')
    expect(rule.message).toBe('Must match')
    expect(await rule.check('secret', { password: 'secret', confirm: 'secret' })).toBe(true)
    expect(await rule.check('nope', { password: 'secret', confirm: 'nope' })).toBe(false)
    expect(await rule.check('', { password: 'secret' })).toBe(false)
    expect(await rule.check('', { password: '' })).toBe(true)
    expect(
      await runFieldRules(
        { password: 'a', confirm: 'b' },
        { confirm: equalTo('password', 'Must match') }
      )
    ).toEqual({ confirm: 'Must match' })
    expect(
      await runFieldRules(
        { password: 'a', confirm: 'a' },
        { confirm: equalTo('password', 'Must match') }
      )
    ).toEqual({})
  })

  it('url / integer empty skip on submit; equalTo blocks mismatch', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .validation({
          site: url('bad url'),
          age: integer('int'),
          confirm: equalTo('password', 'Must match'),
        })
        .onSubmit(onSubmit)
        .children([
          TextField().name('site').placeholder('Site'),
          TextField().name('age').placeholder('Age'),
          TextField().name('password').placeholder('Password'),
          TextField().name('confirm').placeholder('Confirm'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('Site').closest('form')!
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pw' } })
    fireEvent.change(screen.getByPlaceholderText('Confirm'), { target: { value: 'no' } })
    fireEvent.submit(form)
    expect(await screen.findByText('Must match')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.queryByText('bad url')).toBeNull()
    expect(screen.queryByText('int')).toBeNull()

    fireEvent.change(screen.getByPlaceholderText('Confirm'), { target: { value: 'pw' } })
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({
      site: '',
      age: '',
      password: 'pw',
      confirm: 'pw',
    })
  })
})

describe('isSubmitting', () => {
  it('sets data-submitting and aria-busy while onSubmit is pending, then clears', async () => {
    let release!: () => void
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().name('email').placeholder('BusyEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('BusyEmail').closest('form') as HTMLFormElement
    expect(form.getAttribute('data-submitting')).toBeNull()
    expect(form.getAttribute('aria-busy')).toBeNull()

    fireEvent.submit(form)
    await vi.waitFor(() => expect(form.getAttribute('data-submitting')).toBe('true'))
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(onSubmit).toHaveBeenCalledTimes(1)

    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    release()
    await vi.waitFor(() => expect(form.getAttribute('data-submitting')).toBeNull())
    expect(form.getAttribute('aria-busy')).toBeNull()

    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    await vi.waitFor(() => expect(form.getAttribute('data-submitting')).toBe('true'))
  })

  it('clears submitting flags when onSubmit throws', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('fail')
    })
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().name('email').placeholder('ThrowEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('ThrowEmail').closest('form') as HTMLFormElement
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(form.getAttribute('data-submitting')).toBeNull())
    expect(form.getAttribute('aria-busy')).toBeNull()
  })
})

describe('validation on blur', () => {
  it('paints field rules on focusout and still live-clears while typing', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().name('title').placeholder('BlurTitle').rules(required('Need title')),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('BlurTitle') as HTMLInputElement
    fireEvent.input(input, { target: { value: '' } })
    expect(screen.queryByText('Need title')).toBeNull()

    fireEvent.focusOut(input)
    expect(await screen.findByText('Need title')).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.input(input, { target: { value: 'Hi' } })
    expect(screen.queryByText('Need title')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
  })

  it('runs form schema rules on focusout of a named field', async () => {
    render(
      Form()
        .validation({ title: required('Need title') })
        .children([
          TextField().name('title').placeholder('SchemaBlur'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('SchemaBlur') as HTMLInputElement
    fireEvent.focusOut(input)
    expect(await screen.findByText('Need title')).toBeTruthy()
  })

  it('marks data-touched on blur and data-dirty on input', () => {
    render(
      Form()
        .children([
          TextField().name('title').placeholder('TouchTitle'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('TouchTitle') as HTMLInputElement
    const form = input.closest('form') as HTMLFormElement
    const host = (input.closest('.fibo-textfield-container') ?? input) as HTMLElement

    expect(host.getAttribute('data-touched')).toBeNull()
    expect(host.getAttribute('data-dirty')).toBeNull()

    fireEvent.focusOut(input)
    expect(host.getAttribute('data-touched')).toBe('true')
    expect(form.getAttribute('data-touched')).toBe('true')

    fireEvent.input(input, { target: { value: 'x' } })
    expect(host.getAttribute('data-dirty')).toBe('true')
    expect(form.getAttribute('data-dirty')).toBe('true')
  })
})
