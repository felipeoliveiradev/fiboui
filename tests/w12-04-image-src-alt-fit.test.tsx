import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Image } from '../src/content/Image'

afterEach(cleanup)

function imgOf(node: Parameters<typeof render>[0]): HTMLImageElement {
  const { container } = render(node)
  const img = container.querySelector('img') as HTMLImageElement | null
  expect(img).toBeTruthy()
  return img as HTMLImageElement
}

describe('W12-04 Image src sanitization', () => {
  it('strips javascript: src (XSS)', () => {
    const img = imgOf(Image('javascript:alert(1)').alt('x').build())
    expect(img.getAttribute('src') ?? '').not.toMatch(/javascript/i)
  })

  it('strips data: / vbscript: / file: src', () => {
    const { unmount } = render(Image('data:text/html,<script>alert(1)</script>').alt('d').build())
    expect(screen.getByAltText('d').getAttribute('src') ?? '').not.toMatch(/data:/i)
    unmount()

    const vb = imgOf(Image('vbscript:msgbox(1)').alt('v').build())
    expect(vb.getAttribute('src') ?? '').not.toMatch(/vbscript/i)

    const file = imgOf(Image('file:///etc/passwd').alt('f').build())
    expect(file.getAttribute('src') ?? '').not.toMatch(/^file:/i)
  })

  it('strips javascript: with odd casing, whitespace, and BOM', () => {
    for (const src of [
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
      '\tjavascript:alert(1)',
      '\uFEFFjavascript:alert(1)',
    ]) {
      const img = imgOf(Image(src).alt('odd').build())
      expect(img.getAttribute('src') ?? '', src).not.toMatch(/javascript/i)
      cleanup()
    }
  })

  it('rest.src cannot override a safe src with javascript:', () => {
    const img = imgOf(
      Image('/ok.png')
        .alt('ok')
        .props({ src: 'javascript:alert(1)' })
        .build(),
    )
    expect(img.getAttribute('src') ?? '').not.toMatch(/javascript/i)
    expect(img).toHaveAttribute('src', '/ok.png')
  })

  it('keeps http(s) and relative src', () => {
    const https = imgOf(Image('https://example.com/a.png').alt('https').build())
    expect(https).toHaveAttribute('src', 'https://example.com/a.png')
    cleanup()
    const rel = imgOf(Image('/logo.png').alt('rel').build())
    expect(rel).toHaveAttribute('src', '/logo.png')
  })
})

describe('W12-04 Image missing alt', () => {
  it('always sets alt even when .alt() is omitted', () => {
    const img = imgOf(Image('/x.png').build())
    expect(img.hasAttribute('alt')).toBe(true)
    expect(img.getAttribute('alt')).toBe('')
  })

  it('rest cannot drop alt', () => {
    const img = imgOf(
      Image('/x.png')
        .alt('logo')
        .props({ alt: undefined })
        .build(),
    )
    expect(img.getAttribute('alt')).toBe('logo')
  })
})

describe('W12-04 Image object-fit', () => {
  it('scaledToFill + frame sets object-fit:cover and box size', () => {
    const img = imgOf(
      Image('/photo.png')
        .alt('photo')
        .scaledToFill()
        .frame({ width: 200, height: 100 })
        .build(),
    )
    expect(img.style.objectFit).toBe('cover')
    expect(img.style.width).toBe('200px')
    expect(img.style.height).toBe('100px')
  })

  it('scaledToFit + frame sets object-fit:contain', () => {
    const img = imgOf(
      Image('/photo.png')
        .alt('photo')
        .scaledToFit()
        .frame({ width: 80, height: 80 })
        .build(),
    )
    expect(img.style.objectFit).toBe('contain')
  })

  it('resizable does not wipe frame height so object-fit can crop', () => {
    const img = imgOf(
      Image('/photo.png')
        .alt('photo')
        .resizable()
        .scaledToFill()
        .frame({ width: 200, height: 100 })
        .build(),
    )
    expect(img.style.objectFit).toBe('cover')
    expect(img.style.width).toBe('200px')
    expect(img.style.height).toBe('100px')
    expect(img.style.maxWidth).toBe('100%')
  })

  it('rest.style cannot drop object-fit', () => {
    const img = imgOf(
      Image('/photo.png')
        .alt('photo')
        .scaledToFit()
        .frame({ width: 40, height: 40 })
        .props({ style: { objectFit: 'none' as const, width: '1px' } })
        .build(),
    )
    expect(img.style.objectFit).toBe('contain')
    expect(img.style.width).toBe('40px')
  })
})
