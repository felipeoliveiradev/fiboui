import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Alert } from '../src/content/Alert'

afterEach(cleanup)

describe('W12-03 Alert roles', () => {
  it('error and warning use role=alert assertive', () => {
    const { unmount } = render(
      Alert().title('Boom').description('Failed').intent('error').build(),
    )
    const error = screen.getByRole('alert')
    expect(error).toHaveAttribute('aria-live', 'assertive')
    expect(error).toHaveAttribute('aria-atomic', 'true')
    expect(error).toHaveTextContent('Boom')
    unmount()

    render(Alert().title('Careful').intent('warning').build())
    const warn = screen.getByRole('alert')
    expect(warn).toHaveAttribute('aria-live', 'assertive')
    expect(warn).toHaveAttribute('aria-atomic', 'true')
  })

  it('info and success use role=status polite', () => {
    const { unmount } = render(
      Alert().title('Note').description('Body').intent('info').build(),
    )
    const info = screen.getByRole('status', { name: /Note/ })
    expect(info).toHaveAttribute('aria-live', 'polite')
    expect(info).toHaveAttribute('aria-atomic', 'true')
    unmount()

    render(Alert().title('Saved').intent('success').build())
    const ok = screen.getByRole('status', { name: /Saved/ })
    expect(ok).toHaveAttribute('aria-live', 'polite')
    expect(ok).toHaveAttribute('aria-atomic', 'true')
  })

  it('keeps the live role when extra props try to clobber it', () => {
    render(
      Alert()
        .title('Boom')
        .intent('error')
        .props({
          role: 'presentation',
          'aria-live': 'off',
          'aria-atomic': false,
          'data-testid': 'alert-host',
        })
        .build(),
    )
    const el = screen.getByTestId('alert-host')
    expect(el).toHaveAttribute('role', 'alert')
    expect(el).toHaveAttribute('aria-live', 'assertive')
    expect(el).toHaveAttribute('aria-atomic', 'true')
    expect(screen.getByRole('alert')).toBe(el)
  })

  it('honors a custom aria-label', () => {
    render(
      Alert()
        .title('Boom')
        .intent('error')
        .props({ 'aria-label': 'Payment failed' })
        .build(),
    )
    expect(screen.getByRole('alert', { name: 'Payment failed' })).toBeTruthy()
  })
})

describe('W12-03 Alert dismiss', () => {
  it('renders a named dismiss button when onClose is passed', () => {
    const onClose = vi.fn()
    render(
      Alert()
        .title('Session expired')
        .intent('warning')
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
    render(Alert().title('Note').intent('info').build())
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })
})

describe('W12-03 Alert host class', () => {
  it('stamps fibo-alert so skins can target it', () => {
    render(Alert().title('Note').intent('info').build())
    expect(screen.getByRole('status').className).toMatch(/fibo-alert/)
  })
})

describe('W12-03 Alert SSR', () => {
  it('renderToString emits the live role', () => {
    const html = renderToString(
      Alert().title('Boom').intent('error').build() as ReactElement,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain('aria-atomic="true"')
    expect(html).toContain('fibo-alert')
  })
})
