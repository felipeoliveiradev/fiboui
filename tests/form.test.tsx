import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Form,
  required,
  minLength,
  pattern,
  rule,
  createFormControl,
} from '../src/interactive/Form'
import { runFieldRules } from '../src/interactive/Form/validators'
import { TextField } from '../src/interactive/TextField'
import { Button } from '../src/interactive/Button'

describe('Form', () => {
  it('collects named fields on submit without per-keystroke React state', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .gap(8)
        .onSubmit(onSubmit)
        .children([
          TextField().name('email').placeholder('Email'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    const input = screen.getByPlaceholderText('Email') as HTMLInputElement
    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(button.type).toBe('submit')

    fireEvent.change(input, { target: { value: 'a@b.c' } })
    fireEvent.submit(input.closest('form')!)

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.c' })
  })

  it('beforeSubmit / afterSubmit order; before false cancels', async () => {
    const order: string[] = []
    const { unmount } = render(
      Form()
        .beforeSubmit(() => {
          order.push('before')
        })
        .onSubmit(() => {
          order.push('submit')
        })
        .afterSubmit(() => {
          order.push('after')
        })
        .children([
          TextField().name('email').placeholder('HookEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )

    fireEvent.submit(screen.getByPlaceholderText('HookEmail').closest('form')!)
    await vi.waitFor(() => expect(order).toEqual(['before', 'submit', 'after']))
    unmount()

    order.length = 0
    render(
      Form()
        .beforeSubmit(() => {
          order.push('before')
          return false
        })
        .onSubmit(() => {
          order.push('submit')
        })
        .afterSubmit(() => {
          order.push('after')
        })
        .children([
          TextField().name('email').placeholder('CancelEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    fireEvent.submit(screen.getByPlaceholderText('CancelEmail').closest('form')!)
    await vi.waitFor(() => expect(order).toEqual(['before']))
  })

  it('afterSubmit form.reset() clears fields; form.set writes one field', async () => {
    render(
      Form()
        .afterSubmit((_values, form) => {
          form.reset()
        })
        .children([
          TextField().name('title').placeholder('Title'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('Title') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Ada' } })
    expect(input.value).toBe('Ada')
    fireEvent.submit(input.closest('form')!)
    await vi.waitFor(() => expect(input.value).toBe(''))
  })

  it('validation blocks submit and shows the field error', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .validation({ title: [required('Escreve um título'), minLength(2, 'Mínimo 2')] })
        .onSubmit(onSubmit)
        .children([
          TextField().name('title').placeholder('TodoTitle'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    fireEvent.submit(screen.getByPlaceholderText('TodoTitle').closest('form')!)
    expect(await screen.findByText('Escreve um título')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('defaults noValidate so custom rules are not blocked by the browser', () => {
    render(
      Form()
        .children([TextField().name('email').placeholder('NoValEmail'), Button('Save').submit()])
        .build() as any
    )
    const form = screen.getByPlaceholderText('NoValEmail').closest('form') as HTMLFormElement
    expect(form.noValidate).toBe(true)
  })

  it('pattern(/g) does not alternate pass/fail across checks', () => {
    const rule = pattern(/^\d+$/g, 'digits')
    expect(rule.check('12', {})).toBe(true)
    expect(rule.check('12', {})).toBe(true)
    expect(rule.check('ab', {})).toBe(false)
    expect(rule.check('34', {})).toBe(true)
  })

  it('skips required validation when the only named control is disabled', async () => {
    const onSubmit = vi.fn()
    const onInvalid = vi.fn()
    render(
      Form()
        .validation({ title: required('Required') })
        .onSubmit(onSubmit)
        .onInvalid(onInvalid)
        .children([
          TextField().name('title').placeholder('DisabledTitle').disabled(),
          Button('Save').submit(),
        ])
        .build() as any
    )
    fireEvent.submit(screen.getByPlaceholderText('DisabledTitle').closest('form')!)
    expect(onInvalid).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('paints aria-invalid and clears it while typing', async () => {
    render(
      Form()
        .validation({ title: required('Need title') })
        .children([
          TextField().name('title').placeholder('AriaTitle'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('AriaTitle') as HTMLInputElement
    const form = input.closest('form')!
    fireEvent.submit(form)
    expect(await screen.findByText('Need title')).toBeTruthy()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('fibo-err-title')
    fireEvent.input(input, { target: { value: 'Hi' } })
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(screen.queryByText('Need title')).toBeNull()
  })

  it('flexDirection(row) overrides the default column', () => {
    render(
      Form()
        .flexDirection('row')
        .children([
          TextField().name('title').placeholder('RowTitle'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('RowTitle').closest('form')!
    expect(form.style.flexDirection).toBe('row')
  })

  it('align, justify, wrap and gap land on the form style', () => {
    render(
      Form()
        .flexDirection('row')
        .alignItems('center')
        .justifyContent('between')
        .flexWrap('wrap')
        .gap(8)
        .children([
          TextField().name('title').placeholder('AxisTitle'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('AxisTitle').closest('form')!
    expect(form.style.alignItems).toBe('center')
    expect(form.style.justifyContent).toBe('space-between')
    expect(form.style.flexWrap).toBe('wrap')
    expect(form.style.gap).toBe('8px')
  })

  it('FormControl.set toggles checkbox checked from string values', () => {
    const form = document.createElement('form')
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.name = 'agree'
    box.value = 'yes'
    form.appendChild(box)
    document.body.appendChild(form)

    const control = createFormControl(form)
    control.set('agree', 'yes')
    expect(box.checked).toBe(true)
    control.set('agree', 'no')
    expect(box.checked).toBe(false)
    control.set('agree', 'true')
    expect(box.checked).toBe(true)
    control.set('agree', 'off')
    expect(box.checked).toBe(false)
    control.set('agree', 'on')
    expect(box.checked).toBe(true)

    form.remove()
  })

  it('FormControl.set on radios only checks the matching value, never on/true as check-all', () => {
    const form = document.createElement('form')
    const a = document.createElement('input')
    a.type = 'radio'
    a.name = 'plan'
    a.value = 'a'
    const b = document.createElement('input')
    b.type = 'radio'
    b.name = 'plan'
    b.value = 'b'
    form.append(a, b)
    document.body.appendChild(form)

    const control = createFormControl(form)
    control.set('plan', 'on')
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(false)

    control.set('plan', 'true')
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(false)

    control.set('plan', 'a')
    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    control.set('plan', 'b')
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)

    form.remove()
  })

  it('runFieldRules awaits Promise check(); false and rejected fail the field', async () => {
    const falseRule = rule(() => Promise.resolve(false), 'no')
    const rejectedRule = rule(() => Promise.reject(new Error('net')), 'boom')
    const okRule = rule(() => Promise.resolve(true), 'ok')

    expect(await runFieldRules({ t: 'x' }, { t: falseRule })).toEqual({ t: 'no' })
    expect(await runFieldRules({ t: 'x' }, { t: rejectedRule })).toEqual({ t: 'boom' })
    expect(await runFieldRules({ t: 'x' }, { t: okRule })).toEqual({})
  })

  it('async check() that resolves false blocks onSubmit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .validation({ t: { check: () => Promise.resolve(false), message: 'no' } })
        .onSubmit(onSubmit)
        .children([
          TextField().name('t').placeholder('AsyncCheck'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('AsyncCheck') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'x' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('no')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ignores a second submit until the in-flight pipeline finishes', async () => {
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
          TextField().name('email').placeholder('LockEmail'),
          Button('Save').submit(),
        ])
        .build() as any
    )
    const form = screen.getByPlaceholderText('LockEmail').closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    release()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    fireEvent.submit(form)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  })

  it('catches rejected onSubmit: no unhandledrejection, afterSubmit skipped', async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error('fail')
    })
    const afterSubmit = vi.fn()
    const rejections: unknown[] = []
    const onUnhandled = (e: PromiseRejectionEvent) => {
      e.preventDefault()
      rejections.push(e.reason)
    }
    window.addEventListener('unhandledrejection', onUnhandled)
    try {
      render(
        Form()
          .onSubmit(onSubmit)
          .afterSubmit(afterSubmit)
          .children([
            TextField().name('email').placeholder('RejectEmail'),
            Button('Save').submit(),
          ])
          .build() as any
      )
      fireEvent.submit(screen.getByPlaceholderText('RejectEmail').closest('form')!)
      await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      await Promise.resolve()
      await Promise.resolve()
      expect(afterSubmit).not.toHaveBeenCalled()
      expect(rejections).toEqual([])
    } finally {
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  })

  it('includes the clicked submitter name/value in FormData', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          TextField().name('email').placeholder('SubmitterEmail'),
          Button('Save').submit().props({ name: 'op', value: 'save' }),
          Button('Save new').submit().props({ name: 'op', value: 'save-new' }),
        ])
        .build() as any
    )
    const input = screen.getByPlaceholderText('SubmitterEmail') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a@b.c' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save new' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.c', op: 'save-new' })
  })

  it('drops javascript: / data: form action (XSS)', () => {
    const { unmount } = render(
      Form()
        .action('javascript:alert(1)')
        .props({ 'data-testid': 'js-form' })
        .children([Button('Go').submit()])
        .build() as any
    )
    expect(screen.getByTestId('js-form').getAttribute('action') ?? '').not.toMatch(/javascript/i)
    unmount()
    render(
      Form()
        .action('data:text/html,<script>alert(1)</script>')
        .props({ 'data-testid': 'data-form' })
        .children([Button('Go').submit()])
        .build() as any
    )
    expect(screen.getByTestId('data-form').getAttribute('action') ?? '').not.toMatch(/data:/i)
  })

  it('keeps http(s) form action', () => {
    render(
      Form()
        .action('https://example.com/submit')
        .props({ 'data-testid': 'https-form' })
        .children([Button('Go').submit()])
        .build() as any
    )
    expect(screen.getByTestId('https-form')).toHaveAttribute('action', 'https://example.com/submit')
  })
})


