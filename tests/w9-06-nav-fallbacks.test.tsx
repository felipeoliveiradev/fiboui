import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DefaultErrorPage,
  DefaultLoader,
  generateBreadcrumbs,
  RouteErrorBoundary,
  setDocumentTitle,
} from '../src/navigation'

const Dummy = () => null

afterEach(() => {
  cleanup()
  document.title = ''
})

describe('generateBreadcrumbs: no parent title leak', () => {
  it('does not stamp a layout meta.title onto an unmatched child segment', () => {
    const crumbs = generateBreadcrumbs(
      [
        {
          path: '/app',
          component: Dummy,
          meta: { title: 'AppShell' },
          children: [{ path: '/app/dash', component: Dummy, meta: { title: 'Dash' } }],
        },
      ],
      '/app/settings',
    )
    expect(crumbs.map((c) => c.label)).toEqual(['AppShell', 'Settings'])
    expect(crumbs[1]?.meta?.title).not.toBe('AppShell')
  })

  it('still uses a parameterized leaf title (not the raw id)', () => {
    const crumbs = generateBreadcrumbs(
      [
        {
          path: '/users',
          component: Dummy,
          meta: { title: 'Users' },
          children: [{ path: '/users/:id', component: Dummy, meta: { title: 'User' } }],
        },
      ],
      '/users/42',
    )
    expect(crumbs.map((c) => c.label)).toEqual(['Users', 'User'])
    expect(crumbs[1]?.path).toBe('/users/42')
  })
})

describe('setDocumentTitle: no leak across routes', () => {
  it('restores the app name when the next route has no title', () => {
    setDocumentTitle({ path: '/a', component: Dummy, meta: { title: 'Alpha' } }, 'MyApp')
    expect(document.title).toBe('Alpha | MyApp')
    setDocumentTitle({ path: '/b', component: Dummy }, 'MyApp')
    expect(document.title).toBe('MyApp')
  })
})

describe('RouteErrorBoundary reset', () => {
  it('Try Again remounts children after cloneElement injects onReset', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let explode = true
    function Flaky() {
      if (explode) throw new Error('once-only')
      return createElement('div', null, 'recovered')
    }
    render(
      createElement(RouteErrorBoundary, {
        fallback: createElement(DefaultErrorPage),
        children: createElement(Flaky),
      }),
    )
    expect(screen.getByText('once-only')).toBeTruthy()
    explode = false
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(screen.getByText('recovered')).toBeTruthy()
    spy.mockRestore()
  })

  it('accepts string / array children without a type workaround', () => {
    render(
      createElement(RouteErrorBoundary, {
        children: ['hello', createElement('span', { key: 's' }, 'world')] as ReactNode,
      }),
    )
    expect(screen.getByText('hello')).toBeTruthy()
    expect(screen.getByText('world')).toBeTruthy()
  })
})

describe('DefaultLoader live region', () => {
  it('status text is the message, not the infinite keyframes CSS', () => {
    const { rerender } = render(createElement(DefaultLoader, { message: 'Please wait' }))
    const status = screen.getByRole('status')
    expect(status.textContent?.replace(/\s+/g, ' ').trim()).toBe('Please wait')
    expect(status.textContent).not.toMatch(/infinite|@keyframes|fibo-loader-spin/i)
    rerender(createElement(DefaultLoader, { message: 'Please wait' }))
    rerender(createElement(DefaultLoader, { message: 'Please wait' }))
    const styles = [...document.querySelectorAll('style')].filter((n) =>
      (n.textContent ?? '').includes('fibo-loader-spin'),
    )
    expect(styles).toHaveLength(1)
  })
})
