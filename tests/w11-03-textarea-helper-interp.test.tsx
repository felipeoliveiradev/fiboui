import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Textarea } from '../src/interactive/Textarea'
import { Signal } from '../src/core/state'
import { interp } from '../src/core/interpolate'
import { required } from '../src/interactive/Form'

afterEach(cleanup)

describe('Textarea .helper() (parity with TextField)', () => {
  it('renders a muted hint under the field with .fibo-field-helper', () => {
    render(
      Textarea().name('bio').helper('Keep it short').placeholder('notes') as any
    )
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    expect(helper).toBeTruthy()
    expect(helper.textContent).toBe('Keep it short')
    expect(helper.style.display).not.toBe('none')
    expect(helper.id).toBe('fibo-help-bio')
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.getAttribute('aria-describedby')).toBe('fibo-help-bio')
    expect(control.getAttribute('aria-invalid')).not.toBe('true')
  })

  it('hides helper when .error() is showing and points aria-describedby at the error', () => {
    render(
      Textarea()
        .name('bio')
        .helper('Keep it short')
        .error('Required')
        .placeholder('notes') as any
    )
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    const err = document.getElementById('fibo-err-bio')
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(helper).toBeTruthy()
    expect(helper.style.display).toBe('none')
    expect(err).toBeTruthy()
    expect(err?.textContent).toBe('Required')
    expect(control.getAttribute('aria-invalid')).toBe('true')
    expect(control.getAttribute('aria-describedby')).toBe('fibo-err-bio')
  })

  it('hides helper when Form paints an error via __fiboShowError', () => {
    render(Textarea().name('bio').helper('hint').placeholder('notes') as any)
    const host = document.querySelector('.fibo-textarea-container') as HTMLElement & {
      __fiboShowError?: (msg: string | null) => void
    }
    const helper = document.querySelector('.fibo-field-helper') as HTMLElement
    expect(helper.style.display).not.toBe('none')
    act(() => {
      host.__fiboShowError?.('bad')
    })
    expect(helper.style.display).toBe('none')
    const err = document.querySelector('.fibo-field-error') as HTMLElement
    expect(err.textContent).toBe('bad')
    expect(err.style.display).not.toBe('none')
    act(() => {
      host.__fiboShowError?.(null)
    })
    expect(helper.style.display).not.toBe('none')
  })
})

describe('Textarea helper / error interp', () => {
  it('helper with interp stays live', () => {
    const who = new Signal('Ada')
    render(
      Textarea().name('n').helper(`Hint ${interp(who)}`).placeholder('notes') as any
    )
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Ada')
    act(() => {
      who.value = 'Bob'
    })
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Bob')
  })

  it('error with interp stays live', () => {
    const who = new Signal('Ada')
    render(
      Textarea().name('n').error(`Bad ${interp(who)}`).placeholder('notes') as any
    )
    expect(document.getElementById('fibo-err-n')?.textContent).toBe('Bad Ada')
    act(() => {
      who.value = 'Bob'
    })
    expect(document.getElementById('fibo-err-n')?.textContent).toBe('Bad Bob')
  })

  it('does not drop an uncontrolled typed value when helper interp ticks', () => {
    const who = new Signal('Ada')
    const bio = new Signal('')
    render(
      Textarea()
        .value(bio)
        .name('bio')
        .helper(`Hint ${interp(who)}`)
        .placeholder('notes') as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    fireEvent.change(control, { target: { value: 'typed notes' } })
    expect(bio.value).toBe('typed notes')
    act(() => {
      who.value = 'Bob'
    })
    expect(document.querySelector('.fibo-field-helper')?.textContent).toBe('Hint Bob')
    expect(control.value).toBe('typed notes')
    expect(bio.value).toBe('typed notes')
  })
})

describe('Textarea name / uncontrolled / rules', () => {
  it('stamps HTML name and stays uncontrolled (defaultValue)', () => {
    render(Textarea().name('bio').placeholder('notes') as any)
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.name).toBe('bio')
    expect(control.defaultValue).toBe('')
    fireEvent.change(control, { target: { value: 'hello' } })
    expect(control.value).toBe('hello')
    expect(control.hasAttribute('value')).toBe(false)
  })

  it('attaches .rules() onto the control for Form collectDomRules', () => {
    render(
      Textarea().name('bio').placeholder('notes').rules(required('Write a bio')) as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement & {
      __fiboRules?: unknown[]
    }
    expect(control.__fiboRules?.length).toBeGreaterThan(0)
  })
})
