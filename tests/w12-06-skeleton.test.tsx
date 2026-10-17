import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Skeleton } from '../src/content/Skeleton'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))
}

describe('Skeleton a11y: aria-busy', () => {
  it('marks the status region busy while the placeholder is on screen', () => {
    render(Skeleton().width(80).height(12).build())
    const el = screen.getByRole('status', { name: 'Loading' })
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('keeps aria-busy when extra props try to clobber it', () => {
    render(
      Skeleton()
        .props({
          'aria-busy': false,
          role: 'img',
          'data-testid': 'sk-busy',
        })
        .build()
    )
    const el = screen.getByTestId('sk-busy')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-busy', 'true')
  })
})

describe('Skeleton reduced-motion', () => {
  it('drops the pulse animation when the user prefers reduced motion', () => {
    stubReducedMotion(true)
    render(Skeleton().width(64).height(16).build())
    const el = screen.getByRole('status') as HTMLElement
    expect(el.className).not.toMatch(/animate-pulse/)
    expect(el.style.animation).toBe('none')
  })

  it('keeps the pulse animation when reduced-motion is off', () => {
    stubReducedMotion(false)
    render(Skeleton().width(64).height(16).build())
    const el = screen.getByRole('status') as HTMLElement
    expect(el.className).toMatch(/animate-pulse/)
    expect(el.style.animation).not.toBe('none')
  })
})

describe('Skeleton crash locks', () => {
  it('unknown shape does not crash', () => {
    expect(() =>
      render(Skeleton().shape('hexagon' as 'circle').width(40).height(40).build())
    ).not.toThrow()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('NaN / Infinity size does not crash', () => {
    expect(() =>
      render(Skeleton().width(Number.NaN).height(Number.POSITIVE_INFINITY).build())
    ).not.toThrow()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(Skeleton().width(80).height(12).shape('circle').build() as ReactElement)
    ).not.toThrow()
  })

  it('plain-object constructor / extra children do not crash', () => {
    expect(() => render((Skeleton as (arg?: unknown) => ReturnType<typeof Skeleton>)({ foo: 'bar' }).build())).not.toThrow()
    expect(() =>
      render(
        Skeleton()
          .props({ children: createElement('span', null, 'slot') })
          .build()
      )
    ).not.toThrow()
  })
})
