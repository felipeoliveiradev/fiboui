import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Banner } from '../src/structure/Banner'
import { listSignal } from '../src'

afterEach(cleanup)

describe('W13-04 Banner roles', () => {
  it('error and warning use role=alert assertive', () => {
    const { unmount } = render(
      Banner('Boom').subtitle('Failed').status('error').build(),
    )
    const error = screen.getByRole('alert')
    expect(error).toHaveAttribute('aria-live', 'assertive')
    expect(error).toHaveAttribute('aria-atomic', 'true')
    expect(error).toHaveTextContent('Boom')
    unmount()

    render(Banner('Careful').status('warning').build())
    const warn = screen.getByRole('alert')
    expect(warn).toHaveAttribute('aria-live', 'assertive')
    expect(warn).toHaveAttribute('aria-atomic', 'true')
  })

  it('info and success use role=status polite', () => {
    const { unmount } = render(
      Banner('Note').subtitle('Body').status('info').build(),
    )
    const info = screen.getByRole('status', { name: /Note/ })
    expect(info).toHaveAttribute('aria-live', 'polite')
    expect(info).toHaveAttribute('aria-atomic', 'true')
    unmount()

    render(Banner('Saved').status('success').build())
    const ok = screen.getByRole('status', { name: /Saved/ })
    expect(ok).toHaveAttribute('aria-live', 'polite')
    expect(ok).toHaveAttribute('aria-atomic', 'true')
  })

  it('keeps the live role when extra props try to clobber it', () => {
    render(
      Banner('Boom')
        .status('error')
        .props({
          role: 'presentation',
          'aria-live': 'off',
          'aria-atomic': false,
          'data-testid': 'banner-host',
        })
        .build(),
    )
    const el = screen.getByTestId('banner-host')
    expect(el).toHaveAttribute('role', 'alert')
    expect(el).toHaveAttribute('aria-live', 'assertive')
    expect(el).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByRole('alert')).toBe(el)
  })

  it('honors a custom aria-label', () => {
    render(
      Banner('Boom')
        .status('error')
        .props({ 'aria-label': 'Payment failed' })
        .build(),
    )
    expect(screen.getByRole('alert', { name: 'Payment failed' })).toBeTruthy()
  })
})

describe('W13-04 Banner dismiss', () => {
  it('renders a named dismiss button when onClose is passed', () => {
    const onClose = vi.fn()
    render(
      Banner('Session expired')
        .status('warning')
        .props({ onClose })
        .build(),
    )
    const host = screen.getByRole('alert')
    expect(host).not.toHaveAttribute('onClose')
    const btn = screen.getByRole('button', { name: 'Dismiss' }) as HTMLButtonElement
    expect(btn.type).toBe('button')
    expect(host.contains(btn)).toBe(true)
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not paint a dismiss control without onClose', () => {
    render(Banner('Note').status('info').build())
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })
})

describe('W13-04 Banner host class', () => {
  it('stamps fibo-banner so skins can target it', () => {
    render(Banner('Note').status('info').build())
    const host = screen.getByRole('status')
    expect(host.className).toMatch(/fibo-banner/)
    expect(host.className).toMatch(/fibo-banner-info/)
  })

  it('keeps fibo-banner when extra className is passed', () => {
    render(
      Banner('Note')
        .status('error')
        .props({ className: 'extra-skin' })
        .build(),
    )
    const host = screen.getByRole('alert')
    expect(host.className).toMatch(/fibo-banner/)
    expect(host.className).toMatch(/fibo-banner-error/)
    expect(host.className).toMatch(/extra-skin/)
  })
})

describe('W13-04 Banner SSR', () => {
  it('renderToString emits the live role', () => {
    const html = renderToString(
      Banner('Boom').status('error').build() as ReactElement,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain('aria-atomic="true"')
    expect(html).toContain('fibo-banner')
  })
})

describe('W13-04 Banner interp still live', () => {
  it('title interp updates after bind', () => {
    const todos = listSignal<{ title: string }>([])
    render(Banner(`Open ${todos.$length}`).subtitle(`n=${todos.$length}`).build())
    expect(screen.getByText('Open 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Open 1')).toBeInTheDocument()
  })
})
