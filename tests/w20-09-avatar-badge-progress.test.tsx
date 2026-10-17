import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar, Badge, Progress } from '../src'

afterEach(cleanup)

function styleDump(root: HTMLElement): string {
  const nodes = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[]
  return nodes
    .map((el) => `${el.style.backgroundImage} ${el.getAttribute('style') ?? ''}`)
    .join('\n')
}

function descendants(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll('*')) as HTMLElement[]
}

function clipsOverflow(el: HTMLElement): boolean {
  return el.style.overflow === 'hidden'
    || el.style.overflowX === 'hidden'
    || el.style.overflowY === 'hidden'
}

describe('W20-09 Avatar image URL in backgroundImage', () => {
  it('does not paint javascript: as a CSS background', () => {
    render(Avatar().image('javascript:alert(1)').alt('xss').initials('AB').build())
    const host = screen.getByRole('img', { name: 'xss' })
    expect(styleDump(host)).not.toMatch(/javascript/i)
    expect(host.textContent).toMatch(/AB/i)
  })

  it('quotes url() so a closing paren in the path cannot break out of background-image', () => {
    const html = renderToString(
      Avatar().image('https://cdn.example/a).png').alt('paren').build() as ReactElement,
    )
    expect(html).toMatch(/cdn\.example\/a(?:\)|%29)\.png/)
    expect(html).toMatch(/url\s*\(\s*(?:["']|&quot;)/)
    expect(html).not.toMatch(/url\s*\(\s*https:\/\/cdn\.example\/a\)/)
  })
})

describe('W20-09 Avatar overflow (do not revert outer visible + inner clip)', () => {
  it('host overflow is visible; face clips', () => {
    render(Avatar().status('online').initials('AB').build())
    const host = screen.getByRole('img')
    expect(host.style.overflow).not.toBe('hidden')
    expect(descendants(host).some(clipsOverflow)).toBe(true)
  })
})

describe('W20-09 Avatar initials slice vs empty', () => {
  it('trims before slice so leading spaces are not an empty face', () => {
    render(Avatar().initials('  ab').build())
    const host = screen.getByRole('img')
    expect(host.textContent?.replace(/\s+/g, '')).toBe('AB')
    expect(host).toHaveAttribute('aria-label', 'AB')
  })

  it('whitespace-only initials fall back like empty (no blank two-char face)', () => {
    render(Avatar().initials('  ').icon('user').build())
    const host = screen.getByRole('img')
    expect(host.textContent?.trim()).toBe('')
    expect(host.querySelector('svg.fibo-avatar-user')).toBeTruthy()
    expect(host.getAttribute('aria-label')?.trim()).not.toBe('')
    expect(host.getAttribute('aria-label')).not.toBe('  ')
  })

  it('empty initials do not slice into a two-space label', () => {
    render(Avatar().initials('').build())
    const host = screen.getByRole('img')
    expect(host.getAttribute('aria-label')).toBe('Avatar')
    expect(host.textContent?.trim()).toBe('')
  })
})

describe('W20-09 Badge numeric text is honest (no silent 99+ lie)', () => {
  it('renders the given count text, including values over 99', () => {
    render(Badge().text('150').build() as ReactElement)
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.queryByText('99+')).not.toBeInTheDocument()
  })

  it('renders 99 as 99, not 99+', () => {
    render(Badge().text('99').build() as ReactElement)
    expect(screen.getByText('99')).toBeInTheDocument()
    expect(screen.queryByText('99+')).not.toBeInTheDocument()
  })
})

describe('W20-09 Progress percentage clamp + NaN', () => {
  it('value above max paints 100% and keeps aria-valuenow within min/max', () => {
    render(
      Progress()
        .value(150)
        .max(100)
        .label('Over')
        .props({ 'data-testid': 'prog-over' })
        .build() as ReactElement,
    )
    const bar = screen.getByTestId('prog-over')
    expect(bar).toHaveAttribute('role', 'progressbar')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    const now = Number(bar.getAttribute('aria-valuenow'))
    expect(now).toBeGreaterThanOrEqual(0)
    expect(now).toBeLessThanOrEqual(100)
    const fill = Array.from(bar.querySelectorAll('[style]')).find(
      (el) => (el as HTMLElement).style.backgroundColor && (el as HTMLElement).style.width,
    ) as HTMLElement | undefined
    expect(fill?.style.width).toBe('100%')
  })

  it('negative value paints 0% and aria-valuenow is not below min', () => {
    render(
      Progress()
        .value(-20)
        .max(100)
        .label('Under')
        .props({ 'data-testid': 'prog-under' })
        .build() as ReactElement,
    )
    const bar = screen.getByTestId('prog-under')
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0)
    const fill = Array.from(bar.querySelectorAll('[style]')).find(
      (el) => (el as HTMLElement).style.backgroundColor && (el as HTMLElement).style.width,
    ) as HTMLElement | undefined
    expect(fill?.style.width).toBe('0%')
  })

  it('NaN / Infinity value does not paint NaN% width', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const { unmount } = render(
        Progress()
          .value(bad)
          .max(100)
          .label('Bad')
          .props({ 'data-testid': 'prog-nan' })
          .build() as ReactElement,
      )
      const bar = screen.getByTestId('prog-nan')
      expect(bar).toHaveAttribute('role', 'progressbar')
      expect(bar.getAttribute('aria-valuenow')).not.toMatch(/NaN/i)
      expect(Number(bar.getAttribute('aria-valuenow'))).toBe(0)
      const dump = `${bar.getAttribute('style') ?? ''} ${bar.innerHTML}`
      expect(dump).not.toMatch(/NaN/i)
      unmount()
    }
  })
})

describe('W20-09 Progress variants keep role=progressbar', () => {
  it('segments / ring / circular / steps / floating / chevron / pagination / timeline / knob / labeled / striped', () => {
    const variants = [
      'segments',
      'ring',
      'circular',
      'steps',
      'floating',
      'chevron',
      'pagination',
      'timeline',
      'knob',
      'labeled',
      'striped',
      'default',
    ] as const

    for (const variant of variants) {
      const { unmount } = render(
        Progress()
          .value(40)
          .max(100)
          .variant(variant)
          .label('Load')
          .props({ 'data-testid': `prog-${variant}` })
          .build() as ReactElement,
      )
      const bar = screen.getByTestId(`prog-${variant}`)
      expect(bar, variant).toHaveAttribute('role', 'progressbar')
      expect(bar, variant).toHaveAttribute('aria-valuenow', '40')
      expect(bar, variant).toHaveAttribute('aria-valuemin', '0')
      expect(bar, variant).toHaveAttribute('aria-valuemax', '100')
      unmount()
    }
  })
})
