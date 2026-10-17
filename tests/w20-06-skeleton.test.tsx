import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Skeleton } from '../src/content/Skeleton'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function skeletonCss(): string {
  return [...document.querySelectorAll('style')]
    .map((n) => n.textContent ?? '')
    .join('\n')
}

function hasSkeletonReducedMotion(css: string): boolean {
  return /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.loading-skeleton[\s\S]*?animation:\s*none/i.test(
    css
  )
}

function hasSkeletonPulse(css: string): boolean {
  return /@keyframes\s+[\w-]*skeleton[\w-]*|@keyframes\s+pulse/i.test(css)
    && /\.loading-skeleton[\s\S]*?animation\s*:/i.test(css)
}

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

describe('W20-06 Skeleton a11y', () => {
  it('exposes role=status, aria-busy, and a polite live name', () => {
    render(Skeleton().width(80).height(12).build())
    const el = screen.getByRole('status', { name: 'Loading' })
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(el.getAttribute('aria-hidden')).not.toBe('true')
  })

  it('keeps role and aria-busy when extra props try to clobber them', () => {
    render(
      Skeleton()
        .props({
          role: 'img',
          'aria-busy': false,
          'aria-hidden': true,
          'data-testid': 'sk-a11y',
        })
        .build()
    )
    const el = screen.getByTestId('sk-a11y')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-busy', 'true')
    expect(el.getAttribute('aria-hidden')).not.toBe('true')
    expect(screen.getByRole('status', { name: 'Loading' })).toBe(el)
  })
})

describe('W20-06 Skeleton reduced-motion CSS', () => {
  it('injects CSS that stops .loading-skeleton under prefers-reduced-motion', () => {
    render(Skeleton().build())
    expect(hasSkeletonReducedMotion(skeletonCss())).toBe(true)
  })

  it('SSR HTML includes the reduced-motion rule (no-JS / before hydrate)', () => {
    const html = renderToString(Skeleton().width(80).height(12).build() as ReactElement)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy')
    expect(hasSkeletonReducedMotion(html)).toBe(true)
  })
})

describe('W20-06 Skeleton animation CSS', () => {
  it('ships pulse keyframes for .loading-skeleton (does not rely on Tailwind alone)', () => {
    render(Skeleton().width(64).height(16).build())
    const el = screen.getByRole('status')
    expect(el.className).toMatch(/loading-skeleton/)
    expect(hasSkeletonPulse(skeletonCss())).toBe(true)
  })

  it('keeps the pulse class when reduced-motion is off', () => {
    stubReducedMotion(false)
    render(Skeleton().width(64).height(16).build())
    const el = screen.getByRole('status') as HTMLElement
    expect(el.className).toMatch(/animate-pulse|loading-skeleton/)
    expect(el.style.animation).not.toBe('none')
  })
})

describe('W20-06 Skeleton width/height units', () => {
  it('numeric width/height serialize as px', () => {
    render(Skeleton().width(64).height(16).props({ 'data-testid': 'sk-px' }).build())
    const el = screen.getByTestId('sk-px') as HTMLElement
    expect(el.style.width).toBe('64px')
    expect(el.style.height).toBe('16px')
  })

  it('keeps explicit percent and length units', () => {
    render(
      Skeleton()
        .width('80%')
        .height('20px')
        .props({ 'data-testid': 'sk-pct' })
        .build()
    )
    const el = screen.getByTestId('sk-pct') as HTMLElement
    expect(el.style.width).toBe('80%')
    expect(el.style.height).toBe('20px')
  })

  it('SSR HTML keeps px on numeric sizes (units not dropped)', () => {
    const html = renderToString(Skeleton().width(64).height(16).build() as ReactElement)
    expect(html).toMatch(/width:\s*64px/)
    expect(html).toMatch(/height:\s*16px/)
  })
})

describe('W20-06 Skeleton invalid variant/shape', () => {
  it('unknown shape does not crash', () => {
    expect(() =>
      render(Skeleton().shape('hexagon' as 'circle').width(40).height(40).build())
    ).not.toThrow()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('unknown variant() via fluent proxy does not crash', () => {
    expect(() =>
      render((Skeleton() as unknown as { variant: (v: string) => ReturnType<typeof Skeleton> }).variant('text').build())
    ).not.toThrow()
    expect(() =>
      render((Skeleton() as unknown as { variant: (v: string) => ReturnType<typeof Skeleton> }).variant('nope').build())
    ).not.toThrow()
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })
})
