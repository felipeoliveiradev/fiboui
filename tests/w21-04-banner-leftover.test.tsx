import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Banner } from '../src/structure/Banner'
import { Button, listSignal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-banner')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-banner')
  return el
}

describe('W21-04 Banner action button dropped', () => {
  it('renders .children() as the call-to-action (FiboBuilder API)', () => {
    const onRetry = vi.fn()
    render(
      Banner('Session expired')
        .status('warning')
        .children(Button('Retry').onPress(onRetry))
        .build(),
    )
    const btn = screen.getByRole('button', { name: 'Retry' })
    expect(host().contains(btn)).toBe(true)
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders a single action via .props({ children })', () => {
    render(
      Banner('Offline')
        .status('error')
        .props({ children: Button('Reconnect').build() })
        .build(),
    )
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeTruthy()
  })

  it('renders .props({ action }) instead of dropping it on the host', () => {
    const onUndo = vi.fn()
    render(
      Banner('Deleted')
        .status('info')
        .props({ action: Button('Undo').onPress(onUndo).build() })
        .build(),
    )
    const el = host()
    expect(el.hasAttribute('action')).toBe(false)
    const btn = screen.getByRole('button', { name: 'Undo' })
    expect(el.contains(btn)).toBe(true)
    fireEvent.click(btn)
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('keeps dismiss and the action button together', () => {
    const onClose = vi.fn()
    const onFix = vi.fn()
    render(
      Banner('Broken pipe')
        .status('error')
        .children(Button('Fix').onPress(onFix))
        .props({ onClose })
        .build(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Fix' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onFix).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('W21-04 Banner unknown intent / status', () => {
  it('unknown .status() does not crash and stays a polite status', () => {
    expect(() =>
      render(Banner('Chip').status('nope' as 'info').build()),
    ).not.toThrow()
    const el = screen.getByRole('status', { name: /Chip/ })
    expect(el.className).toMatch(/\bfibo-banner-info\b/)
    expect(el.className).not.toMatch(/\bnope\b/)
    expect(el.className.split(/\s+/)).not.toContain('undefined')
    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(el).not.toHaveAttribute('status')
  })

  it('unknown intent via props does not crash or leak onto the host', () => {
    expect(() =>
      render(
        Banner('Chip')
          .props({ intent: 'nope' })
          .build(),
      ),
    ).not.toThrow()
    const el = screen.getByRole('status', { name: /Chip/ })
    expect(el).not.toHaveAttribute('intent')
    expect(el.className.split(/\s+/)).not.toContain('undefined')
  })

  it('intent=error via props still locks role=alert (docs intent/status)', () => {
    render(
      Banner('Boom')
        .props({ intent: 'error', 'data-testid': 'intent-host' })
        .build(),
    )
    const el = screen.getByTestId('intent-host')
    expect(el).toHaveAttribute('role', 'alert')
    expect(el).toHaveAttribute('aria-live', 'assertive')
    expect(el).not.toHaveAttribute('intent')
    expect(el.className).toMatch(/\bfibo-banner-error\b/)
  })
})

describe('W21-04 Banner interp leftover', () => {
  it('children string interp updates and does not leak marks', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Banner('Queue')
        .status('info')
        .children(`n=${todos.$length}`)
        .build(),
    )
    expect(screen.getByText('n=0')).toBeInTheDocument()
    expect(host().innerHTML).not.toMatch(/\uE000FIBO:/)
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })
})

describe('W21-04 Banner SSR leftover', () => {
  it('renderToString keeps the action and live role', () => {
    const html = renderToString(
      Banner('Boom')
        .status('error')
        .children(Button('Retry'))
        .build() as ReactElement,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('Retry')
    expect(html).toContain('fibo-banner')
    expect(html).not.toContain('onClose')
    expect(html).not.toMatch(/\uE000FIBO:/)
  })
})
