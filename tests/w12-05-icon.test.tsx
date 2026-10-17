import { createElement, type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Icon } from '../src/content/Icon'

afterEach(cleanup)

function imgOf(node: Parameters<typeof render>[0]): HTMLImageElement {
  const { container } = render(node)
  const img = container.querySelector('img') as HTMLImageElement | null
  expect(img).toBeTruthy()
  return img as HTMLImageElement
}

function glyph(extra?: Record<string, unknown>): ReactElement {
  return createElement('svg', { 'data-testid': 'glyph', viewBox: '0 0 24 24', ...extra })
}

describe('W12-05 Icon aria-hidden', () => {
  it('URL source without alt is decorative', () => {
    const img = imgOf(Icon('https://cdn.example/icon.svg').build())
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img.getAttribute('alt') ?? '').toBe('')
  })

  it('URL source with alt is exposed to AT', () => {
    const img = imgOf(Icon('/save.svg').props({ alt: 'Save' }).build())
    expect(img).toHaveAttribute('alt', 'Save')
    expect(img.getAttribute('aria-hidden')).not.toBe('true')
  })

  it('SVG element source is decorative unless already labeled', () => {
    render(Icon(glyph()).size(16).build())
    expect(screen.getByTestId('glyph')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('W12-05 Icon invalid SVG / source', () => {
  it('plain object and number sources do not crash', () => {
    expect(() => render(Icon({ foo: 1 } as never).build())).not.toThrow()
    expect(() => render(Icon(42 as never).build())).not.toThrow()
  })

  it('inline SVG markup is not used as img src', () => {
    const { container } = render(
      Icon('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h8v8H0z"/></svg>').build(),
    )
    const img = container.querySelector('img')
    expect(img).toBeNull()
  })

  it('javascript: source is not painted', () => {
    const { container } = render(Icon('javascript:alert(1)').build())
    const img = container.querySelector('img')
    if (img) {
      expect(img.getAttribute('src') ?? '').not.toMatch(/javascript/i)
    }
  })

  it('keeps data:image SVG URLs', () => {
    const src =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"></svg>'
    const img = imgOf(Icon(src).build())
    expect(img).toHaveAttribute('src', src)
  })
})

describe('W12-05 Icon size 0', () => {
  it('size(0) does not paint a 0×0 URL icon', () => {
    const img = imgOf(Icon('/icon.svg').size(0).build())
    expect(img.getAttribute('width')).not.toBe('0')
    expect(img.getAttribute('height')).not.toBe('0')
    expect(img.getAttribute('width')).toBe('24')
    expect(img.getAttribute('height')).toBe('24')
    expect(img.style.width).not.toBe('0px')
  })

  it('negative and NaN size fall back to 24', () => {
    const neg = imgOf(Icon('/icon.svg').size(-8).build())
    expect(neg.getAttribute('width')).toBe('24')
    cleanup()
    const nan = imgOf(Icon('/icon.svg').size(Number.NaN).build())
    expect(nan.getAttribute('width')).toBe('24')
  })

  it('size(0) does not paint a 0×0 SVG element', () => {
    render(Icon(glyph()).size(0).build())
    const el = screen.getByTestId('glyph')
    expect(el.getAttribute('width')).toBe('24')
    expect(el.getAttribute('height')).toBe('24')
  })

  it('positive size still wins', () => {
    const img = imgOf(Icon('/icon.svg').size(16).build())
    expect(img.getAttribute('width')).toBe('16')
    expect(img.getAttribute('height')).toBe('16')
  })
})
