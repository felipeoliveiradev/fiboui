import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildChild, isBuildable, normalizeFiboChildren } from '../src/core/children'
import { nextStableId, resetStableIds } from '../src/core/ids'
import { open } from '../src/core/platform'
import { endSsrRequest } from '../src/core/styleManager'
import { signal } from '../src/core/state'
import { Box, Text } from '../src'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetStableIds()
})

describe('buildChild null / signal', () => {
  it('does not throw on null, undefined, or booleans', () => {
    expect(() => buildChild(null)).not.toThrow()
    expect(() => buildChild(undefined)).not.toThrow()
    expect(() => buildChild(false)).not.toThrow()
    expect(() => buildChild(true)).not.toThrow()
    expect(buildChild(null)).toBeNull()
    expect(buildChild(undefined)).toBeNull()
    expect(isBuildable(null)).toBe(false)
    expect(isBuildable(undefined)).toBe(false)
  })

  it('does not treat a signal as a builder', () => {
    const count = signal('hello')
    expect(isBuildable(count)).toBe(false)
    expect(() => buildChild(count)).not.toThrow()
  })

  it('renders a signal child as its live value (no object-child crash)', () => {
    const label = signal('alpha')
    expect(() =>
      render(Box().id('sig-box').children(label as never).build() as ReactElement),
    ).not.toThrow()
    expect(screen.getByText('alpha')).toBeInTheDocument()

    act(() => {
      label.value = 'beta'
    })
    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(screen.queryByText('alpha')).toBeNull()
  })

  it('SSRs a signal child without throwing Objects-are-not-valid', () => {
    const label = signal('ssr-sig')
    const html = renderToString(
      Box().children([null, label as never, Text('tail')]).build() as ReactElement,
    )
    expect(html).toContain('ssr-sig')
    expect(html).toContain('tail')
    expect(html).not.toMatch(/Objects are not valid/)
  })

  it('normalizeFiboChildren skips nulls and keeps a signal sibling', () => {
    const label = signal('kept')
    const nodes = normalizeFiboChildren([null, false, label as never, 'plain'])
    expect(nodes).toHaveLength(2)
    const { container } = render(createElement('div', null, ...nodes))
    expect(container).toHaveTextContent('kept')
    expect(container).toHaveTextContent('plain')
  })
})

describe('nextStableId SSR collision', () => {
  it('endSsrRequest on Node resets the sequence so the next request matches a cold client', () => {
    resetStableIds()
    expect(nextStableId('gradient')).toBe('gradient-1')
    expect(nextStableId('gradient')).toBe('gradient-2')

    vi.stubGlobal('window', undefined)
    endSsrRequest()

    expect(nextStableId('gradient')).toBe('gradient-1')
  })
})

describe('platform window', () => {
  it('open no-ops when window.open is missing (partial SSR polyfill)', () => {
    vi.stubGlobal('window', { location: { href: 'http://localhost/' } })
    expect(() => open('https://example.com')).not.toThrow()
  })

  it('open no-ops when window.open is not a function', () => {
    vi.stubGlobal('window', {
      location: { href: 'http://localhost/' },
      open: 1,
    })
    expect(() => open('https://example.com')).not.toThrow()
  })
})
