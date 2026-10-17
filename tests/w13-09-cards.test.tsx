import { type ReactElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContentCard } from '../src/structure/cards/ContentCard'
import { ProfileCard } from '../src/structure/cards/ProfileCard'
import { ActionCard, InfoCard, InputCard, MetricCard } from '../src/structure/cards/variants'

afterEach(cleanup)

function styleDump(root: HTMLElement): string {
  const nodes = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[]
  return nodes
    .map((el) => `${el.style.backgroundImage} ${el.getAttribute('style') ?? ''}`)
    .join('\n')
}

describe('W13-09 ProfileCard banner URL sanitization', () => {
  it('does not paint javascript: as a CSS background', () => {
    const { container } = render(
      ProfileCard().banner('javascript:alert(1)').name('Ada').handle('@ada').build(),
    )
    expect(styleDump(container)).not.toMatch(/javascript/i)
  })

  it('strips data: / vbscript: / file: banner URLs', () => {
    const data = render(
      ProfileCard()
        .banner('data:text/html,<script>alert(1)</script>')
        .name('D')
        .handle('@d')
        .build(),
    )
    expect(styleDump(data.container)).not.toMatch(/data:/i)
    data.unmount()

    const vb = render(ProfileCard().banner('vbscript:msgbox(1)').name('V').handle('@v').build())
    expect(styleDump(vb.container)).not.toMatch(/vbscript/i)
    vb.unmount()

    const file = render(ProfileCard().banner('file:///etc/passwd').name('F').handle('@f').build())
    expect(styleDump(file.container)).not.toMatch(/file:/i)
  })

  it('strips javascript: with odd casing, whitespace, and BOM', () => {
    for (const src of [
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
      '\tjavascript:alert(1)',
      '\uFEFFjavascript:alert(1)',
    ]) {
      const { container } = render(
        ProfileCard().banner(src).name('Odd').handle('@odd').build(),
      )
      expect(styleDump(container), src).not.toMatch(/javascript/i)
      cleanup()
    }
  })

  it('rest.banner cannot override a safe banner with javascript:', () => {
    const { container } = render(
      ProfileCard()
        .banner('/ok.png')
        .name('Ok')
        .handle('@ok')
        .props({ banner: 'javascript:alert(1)' })
        .build(),
    )
    const dump = styleDump(container)
    expect(dump).not.toMatch(/javascript/i)
    expect(dump).toMatch(/ok\.png/)
  })

  it('keeps http(s) and relative banner URLs', () => {
    const https = render(
      ProfileCard().banner('https://example.com/a.png').name('Https').handle('@h').build(),
    )
    expect(styleDump(https.container)).toMatch(/example\.com\/a\.png/)
    https.unmount()
    const rel = render(ProfileCard().banner('/face.png').name('Rel').handle('@r').build())
    expect(styleDump(rel.container)).toMatch(/face\.png/)
  })
})

describe('W13-09 ContentCard rest on host', () => {
  it('forwards onClick and data-testid onto the host', () => {
    const onClick = vi.fn()
    render(
      ContentCard()
        .title('Story')
        .onClick(onClick)
        .props({ 'data-testid': 'content-card' })
        .build() as ReactElement,
    )
    const host = screen.getByTestId('content-card')
    fireEvent.click(host)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('W13-09 variant cards rest on host', () => {
  it('InfoCard forwards data-testid', () => {
    render(InfoCard().title('Info').props({ 'data-testid': 'info-card' }).build())
    expect(screen.getByTestId('info-card')).toBeTruthy()
  })

  it('ActionCard forwards data-testid', () => {
    render(ActionCard().title('Act').props({ 'data-testid': 'action-card' }).build())
    expect(screen.getByTestId('action-card')).toBeTruthy()
  })

  it('InputCard forwards data-testid', () => {
    render(InputCard().title('Name').props({ 'data-testid': 'input-card' }).build())
    expect(screen.getByTestId('input-card')).toBeTruthy()
  })

  it('MetricCard forwards data-testid', () => {
    render(MetricCard().title('Users').value('12').props({ 'data-testid': 'metric-card' }).build())
    expect(screen.getByTestId('metric-card')).toBeTruthy()
  })
})
