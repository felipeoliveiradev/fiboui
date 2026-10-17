import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Spinner } from '../src/content/Spinner'

afterEach(cleanup)

function spinnerCss(): string {
  return [...document.querySelectorAll('style')]
    .map((n) => n.textContent ?? '')
    .join('\n')
}

function hasSpinnerReducedMotion(css: string): boolean {
  return /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.fibo-spinner[\s\S]*?animation:\s*none/i.test(
    css
  )
}

const VARIANTS = ['circle', 'dots', 'pulse', 'blocks'] as const

describe('W12-07 Spinner a11y', () => {
  it.each(VARIANTS)('%s exposes role=status with a polite live name', (variant) => {
    render(Spinner().variant(variant).build())
    const status = screen.getByRole('status', { name: 'Loading' })
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-label', 'Loading')
    expect(status.className).toMatch(/fibo-spinner/)
  })

  it('keeps role=status when extra props try to clobber it', () => {
    render(
      Spinner()
        .props({
          role: 'img',
          'aria-live': 'off',
          'data-testid': 'spin',
        })
        .build()
    )
    const el = screen.getByTestId('spin')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status', { name: 'Loading' })).toBe(el)
  })

  it('honors a custom aria-label', () => {
    render(Spinner().props({ 'aria-label': 'Saving' }).build())
    expect(screen.getByRole('status', { name: 'Saving' })).toBeTruthy()
  })
})

describe('W12-07 Spinner reduced-motion', () => {
  it('injects CSS that stops .fibo-spinner animation under prefers-reduced-motion', () => {
    render(Spinner().build())
    expect(hasSpinnerReducedMotion(spinnerCss())).toBe(true)
  })

  it('does not leak keyframes/CSS into the status accessible name', () => {
    render(Spinner().variant('dots').build())
    const status = screen.getByRole('status', { name: 'Loading' })
    expect(status.textContent ?? '').not.toMatch(/@media|keyframes|animation/i)
  })

  it.each(VARIANTS)('%s still ships the reduced-motion rule', (variant) => {
    const { unmount } = render(Spinner().variant(variant).build())
    expect(hasSpinnerReducedMotion(spinnerCss())).toBe(true)
    unmount()
  })
})

describe('W12-07 Spinner SSR', () => {
  it('renderToString emits status + reduced-motion CSS', () => {
    const html = renderToString(Spinner().size('lg').build() as ReactElement)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('fibo-spinner')
    expect(hasSpinnerReducedMotion(html)).toBe(true)
  })
})

describe('W12-07 Spinner still animates when motion is allowed', () => {
  it('circle keeps animate-spin for users without reduced-motion', () => {
    render(createElement('div', null, Spinner().build()))
    const status = screen.getByRole('status')
    expect(status.className).toMatch(/animate-spin/)
  })
})
