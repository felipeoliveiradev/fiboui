import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Spinner } from '../src/content/Spinner'

afterEach(cleanup)

const VARIANTS = ['circle', 'dots', 'pulse', 'blocks'] as const

function statusEl(name = 'Loading'): HTMLElement {
  return screen.getByRole('status', { name })
}

function isVisuallyHidden(el: HTMLElement): boolean {
  const cls = el.className || ''
  if (/\bsr-only\b|\bfibo-sr-only\b|\bfibo-visually-hidden\b/i.test(cls)) return true
  const s = el.style
  const clipped =
    /^rect\(\s*0(px)?\s*,\s*0(px)?\s*,\s*0(px)?\s*,\s*0(px)?\s*\)$/i.test(s.clip) ||
    /inset\(\s*50%\s*\)/i.test(s.clipPath)
  const tiny =
    s.position === 'absolute' &&
    (s.width === '1px' || s.width === '1') &&
    (s.height === '1px' || s.height === '1')
  return (clipped || tiny) && (s.overflow === 'hidden' || s.position === 'absolute')
}

function hiddenLabel(root: HTMLElement, text: string): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>('*')].find(
    (n) => (n.textContent ?? '').trim() === text && n.children.length === 0 && isVisuallyHidden(n),
  )
}

function paintsColor(root: HTMLElement, hex: string): boolean {
  const needle = hex.toLowerCase()
  const rgb = hex.replace('#', '')
  const r = parseInt(rgb.slice(0, 2), 16)
  const g = parseInt(rgb.slice(2, 4), 16)
  const b = parseInt(rgb.slice(4, 6), 16)
  const rgbRe = new RegExp(`rgb\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*\\)`, 'i')
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')]
  return nodes.some((n) => {
    const attrs = [
      n.getAttribute('stroke'),
      n.getAttribute('fill'),
      n.style.stroke,
      n.style.fill,
      n.style.backgroundColor,
      n.style.color,
    ]
    return attrs.some((v) => v && (v.toLowerCase() === needle || rgbRe.test(v)))
  })
}

describe('W20-07 Spinner status has visually-hidden text besides aria-label', () => {
  it.each(VARIANTS)('%s keeps aria-label and ships clipped status text for AT', (variant) => {
    render(Spinner().variant(variant).build())
    const status = statusEl()
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveAttribute('aria-label', 'Loading')
    expect(hiddenLabel(status, 'Loading')).toBeTruthy()
  })

  it('custom aria-label is the visually-hidden text', () => {
    render(Spinner().props({ 'aria-label': 'Saving' }).build())
    const status = statusEl('Saving')
    expect(status).toHaveAttribute('aria-label', 'Saving')
    expect(hiddenLabel(status, 'Saving')).toBeTruthy()
    expect(hiddenLabel(status, 'Loading')).toBeUndefined()
  })

  it('hidden label does not steal the dots flex slots', () => {
    render(Spinner().variant('dots').build())
    const status = statusEl()
    expect(status.querySelectorAll(':scope > div')).toHaveLength(3)
    expect(hiddenLabel(status, 'Loading')).toBeTruthy()
  })
})

describe('W20-07 Spinner unknown size/variant do not crash', () => {
  it('unknown size token falls back without throwing', () => {
    expect(() => render(Spinner().size('xxl' as 'md').build())).not.toThrow()
    const status = statusEl()
    expect(status.style.width).toBe('24px')
    expect(status.style.height).toBe('24px')
  })

  it('unknown variant falls back to a painted circle without throwing', () => {
    expect(() => render(Spinner().variant('wave' as 'circle').build())).not.toThrow()
    const status = statusEl()
    expect(status.querySelector('svg')).toBeTruthy()
  })

  it('NaN / negative size do not crash', () => {
    expect(() => render(Spinner().size(Number.NaN).build())).not.toThrow()
    cleanup()
    expect(() => render(Spinner().size(-8).build())).not.toThrow()
    expect(statusEl()).toBeTruthy()
  })
})

describe('W20-07 Spinner color is applied', () => {
  it.each(VARIANTS)('%s paints .color() onto the graphic', (variant) => {
    render(Spinner().variant(variant).color('#3B82F6').build())
    expect(paintsColor(statusEl(), '#3B82F6')).toBe(true)
  })
})

describe('W20-07 Spinner SVG has no leftover title', () => {
  it('circle svg is decorative and has no <title>', () => {
    render(Spinner().build())
    const svg = statusEl().querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.querySelector('title')).toBeNull()
  })
})

describe('W20-07 Spinner SSR', () => {
  it('renderToString includes visually-hidden Loading text', () => {
    const html = renderToString(Spinner().size('lg').build() as ReactElement)
    expect(html).toContain('role="status"')
    expect(html).toContain('Loading')
    expect(html).toMatch(/clip:\s*rect\(0/i)
  })
})

describe('W20-07 Spinner still finds status when wrapped', () => {
  it('createElement wrapper does not drop the hidden label', () => {
    render(createElement('div', null, Spinner().build()))
    expect(hiddenLabel(statusEl(), 'Loading')).toBeTruthy()
  })
})
