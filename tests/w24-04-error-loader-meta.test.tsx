import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DefaultErrorPage,
  DefaultLoader,
  generateBreadcrumbs,
  RouteErrorBoundary,
} from '../src/navigation'

const Dummy = () => null

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('W24-04 RouteErrorBoundary non-Error throws', () => {
  it('throw null shows an alert instead of re-rendering the crashing child', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Boom(): ReactNode {
      throw null
    }
    render(createElement(RouteErrorBoundary, { children: createElement(Boom) }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByText(/Something went wrong/i)).toBeTruthy()
    spy.mockRestore()
  })

  it('throw "chunk-fail" surfaces the string on DefaultErrorPage', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    function Boom(): ReactNode {
      throw 'chunk-fail'
    }
    render(
      createElement(RouteErrorBoundary, {
        fallback: createElement(DefaultErrorPage),
        children: createElement(Boom),
      }),
    )
    expect(screen.getByText('chunk-fail')).toBeTruthy()
    spy.mockRestore()
  })

  it('default fallback Try Again remounts children', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let explode = true
    function Flaky(): ReactNode {
      if (explode) throw new Error('once-only')
      return createElement('div', null, 'recovered')
    }
    render(createElement(RouteErrorBoundary, { children: createElement(Flaky) }))
    expect(screen.getByText('once-only')).toBeTruthy()
    explode = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('recovered')).toBeTruthy()
    spy.mockRestore()
  })
})

describe('W24-04 generateBreadcrumbs query/hash', () => {
  const routes = [
    { path: '/users', component: Dummy, meta: { title: 'Users' } },
    { path: '/users/:id', component: Dummy, meta: { title: 'User' } },
  ]

  it('strips ?search so a static path still matches', () => {
    const crumbs = generateBreadcrumbs(routes, '/users?tab=info')
    expect(crumbs.map((c) => c.label)).toEqual(['Users'])
    expect(crumbs[0]?.path).toBe('/users')
  })

  it('strips #hash from the last segment', () => {
    const crumbs = generateBreadcrumbs(routes, '/users/42#bio')
    expect(crumbs.map((c) => c.label)).toEqual(['Users', 'User'])
    expect(crumbs[1]?.path).toBe('/users/42')
  })
})

describe('W24-04 DefaultErrorPage production stack', () => {
  it('does not expose stack traces in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const error = new Error('disk full')
    error.stack = 'Error: disk full\n    at secret.ts:9:1'
    render(createElement(DefaultErrorPage, { error }))
    expect(screen.getByText('disk full')).toBeTruthy()
    expect(screen.queryByText('Stack Trace')).toBeNull()
    expect(screen.queryByText(/secret\.ts/)).toBeNull()
  })
})

describe('W24-04 DefaultLoader spinner a11y', () => {
  it('hides the decorative spinner from the accessibility tree', () => {
    render(createElement(DefaultLoader, { message: 'Please wait' }))
    const status = screen.getByRole('status')
    const spinner = status.querySelector('.fibo-loader-spinner')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(status.textContent?.replace(/\s+/g, ' ').trim()).toBe('Please wait')
  })
})
