import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar, Progress } from '../src'

afterEach(cleanup)

function styleDump(root: HTMLElement): string {
  const nodes = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[]
  return nodes
    .map((el) => `${el.style.backgroundImage} ${el.getAttribute('style') ?? ''}`)
    .join('\n')
}

describe('W12-09 Avatar image URL sanitization', () => {
  it('does not paint javascript: as a CSS background', () => {
    render(Avatar().image('javascript:alert(1)').alt('x').initials('AB').build())
    const host = screen.getByRole('img', { name: 'x' })
    expect(styleDump(host)).not.toMatch(/javascript/i)
    expect(host.textContent).toMatch(/AB/i)
  })

  it('strips data: / vbscript: / file: image URLs', () => {
    const { unmount } = render(
      Avatar().src('data:text/html,<script>alert(1)</script>').alt('d').initials('D').build(),
    )
    expect(styleDump(screen.getByRole('img', { name: 'd' }))).not.toMatch(/data:/i)
    unmount()

    render(Avatar().image('vbscript:msgbox(1)').alt('v').build())
    expect(styleDump(screen.getByRole('img', { name: 'v' }))).not.toMatch(/vbscript/i)
    cleanup()

    render(Avatar().image('file:///etc/passwd').alt('f').build())
    expect(styleDump(screen.getByRole('img', { name: 'f' }))).not.toMatch(/file:/i)
  })

  it('strips javascript: with odd casing, whitespace, and BOM', () => {
    for (const src of [
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
      '\tjavascript:alert(1)',
      '\uFEFFjavascript:alert(1)',
    ]) {
      render(Avatar().image(src).alt('odd').build())
      expect(styleDump(screen.getByRole('img', { name: 'odd' })), src).not.toMatch(/javascript/i)
      cleanup()
    }
  })

  it('rest.image cannot override a safe src with javascript:', () => {
    render(
      Avatar()
        .src('/ok.png')
        .alt('ok')
        .props({ image: 'javascript:alert(1)' })
        .build(),
    )
    const dump = styleDump(screen.getByRole('img', { name: 'ok' }))
    expect(dump).not.toMatch(/javascript/i)
    expect(dump).toMatch(/ok\.png/)
  })

  it('keeps http(s) and relative image URLs', () => {
    render(Avatar().image('https://example.com/a.png').alt('https').build())
    expect(styleDump(screen.getByRole('img', { name: 'https' }))).toMatch(/example\.com\/a\.png/)
    cleanup()
    render(Avatar().src('/face.png').alt('rel').build())
    expect(styleDump(screen.getByRole('img', { name: 'rel' }))).toMatch(/face\.png/)
  })
})

describe('W12-09 Progress default host className', () => {
  it('puts .className() on the progressbar host, not only the inner track', () => {
    render(
      Progress()
        .value(40)
        .max(100)
        .className('fibo-progress')
        .props({ 'data-testid': 'prog-host' })
        .build() as ReactElement,
    )
    const bar = screen.getByTestId('prog-host')
    expect(bar).toHaveAttribute('role', 'progressbar')
    expect(bar.className).toMatch(/fibo-progress/)
  })
})
