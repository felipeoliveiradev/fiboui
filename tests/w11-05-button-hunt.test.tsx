import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isValidElement } from 'react'
import { Button } from '../src/interactive/Button'
import { Form } from '../src/interactive/Form'
import { interp, signal } from '../src'
import * as effects from '../src/core/effects'

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('fibo-theme-material')
  vi.restoreAllMocks()
})

describe('W11-05 Button type=submit', () => {
  it('clicking .type("submit") submits a native form', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit as any}>
        {Button('Save').type('submit')}
      </form>,
    )
    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(button.type).toBe('submit')
    expect(isValidElement(Button('Save').type('submit'))).toBe(true)
    fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('clicking .submit() inside Form fires onSubmit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([Button('Go').submit()]) as any,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('disabled submit button does not submit the form', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit as any}>
        {Button('Save').type('submit').disabled()}
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('.props({ type: "submit" }) sets HTML type submit and clicks submit the form', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit as any}>
        {Button('ViaProps').props({ type: 'submit' })}
      </form>,
    )
    const button = screen.getByRole('button', { name: 'ViaProps' }) as HTMLButtonElement
    expect(button.type).toBe('submit')
    fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('.type("button") wins over .props({ type: "submit" })', () => {
    render(Button('Stay').props({ type: 'submit' }).type('button') as any)
    const button = screen.getByRole('button', { name: 'Stay' }) as HTMLButtonElement
    expect(button.type).toBe('button')
  })
})

describe('W11-05 Button interp children', () => {
  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Button().children([`Go ${interp(n)}`]) as any)
    expect(screen.getByRole('button')).toHaveTextContent('Go 1')
    act(() => {
      n.value = 2
    })
    expect(screen.getByRole('button')).toHaveTextContent('Go 2')
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Button().children(() => `Go ${interp(n)}`) as any)
    expect(screen.getByRole('button')).toHaveTextContent('Go 1')
    act(() => {
      n.value = 2
    })
    expect(screen.getByRole('button')).toHaveTextContent('Go 2')
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Button().children(interp(n)) as any)
    expect(screen.getByRole('button')).toHaveTextContent('7')
    act(() => {
      n.value = 8
    })
    expect(screen.getByRole('button')).toHaveTextContent('8')
  })

  it('function label with interp stays live', () => {
    const n = signal(1)
    render(Button(() => `Go ${interp(n)}`) as any)
    expect(screen.getByRole('button')).toHaveTextContent('Go 1')
    act(() => {
      n.value = 2
    })
    expect(screen.getByRole('button')).toHaveTextContent('Go 2')
  })
})

describe('W11-05 Button ripple', () => {
  beforeEach(() => {
    document.documentElement.classList.add('fibo-theme-material')
  })

  it('material click calls createRipple with the live button node', async () => {
    const spy = vi.spyOn(effects, 'createRipple')
    render(Button('Ink'))
    fireEvent.click(screen.getByRole('button', { name: 'Ink' }), {
      clientX: 12,
      clientY: 34,
    })
    await waitFor(() => expect(spy).toHaveBeenCalled())
    const [event, node] = spy.mock.calls[0]
    expect(node).toBeInstanceOf(HTMLButtonElement)
    expect(node.isConnected).toBe(true)
    expect(event.clientX).toBe(12)
    expect(event.clientY).toBe(34)
  })

  it('disabled material click does not ripple', async () => {
    const spy = vi.spyOn(effects, 'createRipple')
    render(Button('Off').disabled())
    fireEvent.click(screen.getByRole('button', { name: 'Off' }))
    await Promise.resolve()
    await Promise.resolve()
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('W11-05 Button disabled', () => {
  it('ghost/soft/outline drop hover utilities when disabled', () => {
    for (const variant of ['ghost', 'soft', 'outline', 'filled'] as const) {
      const { unmount } = render(Button(variant).variant(variant).disabled())
      const button = screen.getByRole('button', { name: variant })
      expect(button).toBeDisabled()
      expect(button.className).not.toMatch(/hover:/)
      expect(button.className).not.toMatch(/active:scale/)
      expect(button.className).toMatch(/pointer-events-none/)
      unmount()
    }
  })
})
