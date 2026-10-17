import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Alert } from '../src/content/Alert'
import { Icons } from '../src/core/icons'

afterEach(cleanup)

function iconSvg(intent: 'info' | 'success' | 'warning' | 'error'): SVGSVGElement {
  const { container } = render(
    Alert().title('Heads up').intent(intent).build(),
  )
  const wrap = container.querySelector('.fibo-alert [class*="shrink-0"]')
  const svg = wrap?.querySelector('svg')
  expect(svg).toBeTruthy()
  return svg as SVGSVGElement
}

function searchFingerprint(root: ParentNode): boolean {
  return Boolean(root.querySelector('circle[cx="11"][cy="11"][r="8"]'))
}

describe('W17-07 Alert warning icon is not Search', () => {
  it('Icons.Search is the magnifying-glass fingerprint used as the wrong stand-in', () => {
    const { container } = render(Icons.Search as ReactElement)
    expect(searchFingerprint(container)).toBe(true)
  })

  it('warning intent does not paint the Search magnifying glass', () => {
    const svg = iconSvg('warning')
    expect(searchFingerprint(svg)).toBe(false)
    expect(svg.querySelector('line[x1="21"][y1="21"][x2="16.65"][y2="16.65"]')).toBeNull()
  })

  it('warning intent paints a triangle-with-bang glyph, still decorative', () => {
    const svg = iconSvg('warning')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    const triangle = svg.querySelector('path')
    expect(triangle).toBeTruthy()
    expect(triangle?.getAttribute('d') ?? '').toMatch(/10\.29 3\.86/i)
    expect(svg.querySelector('line[x1="12"][y1="9"][x2="12"][y2="13"]')).toBeTruthy()
  })

  it('other intents keep their existing glyphs', () => {
    const info = iconSvg('info')
    expect(info.querySelector('circle[cx="12"][cy="12"][r="10"]')).toBeTruthy()

    const ok = iconSvg('success')
    expect(ok.querySelector('polyline')).toBeTruthy()

    const err = iconSvg('error')
    expect(err.querySelector('line[x1="18"][y1="6"][x2="6"][y2="18"]')).toBeTruthy()
    expect(searchFingerprint(err)).toBe(false)
  })

  it('SSR warning markup is not the Search path', () => {
    const html = renderToString(
      Alert().title('Careful').intent('warning').build() as ReactElement,
    )
    expect(html).toContain('role="alert"')
    expect(html).not.toMatch(/cx="11"[^>]*cy="11"[^>]*r="8"/)
    expect(html).toMatch(/10\.29 3\.86/)
  })
})
