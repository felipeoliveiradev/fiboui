import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Image } from '../src/content/Image'
import { interp, signal } from '../src'

afterEach(cleanup)

function imgOf(node: Parameters<typeof render>[0]): HTMLImageElement {
  const { container } = render(node)
  const img = container.querySelector('img') as HTMLImageElement | null
  expect(img).toBeTruthy()
  return img as HTMLImageElement
}

describe('W20-04 Image src/alt interp is live', () => {
  it('constructor src with interp() updates after the signal changes', () => {
    const file = signal('ada.png')
    const img = imgOf(Image(`/cdn/${interp(file)}`).alt('p').build())
    expect(img).toHaveAttribute('src', '/cdn/ada.png')
    act(() => {
      file.value = 'bob.png'
    })
    expect(img).toHaveAttribute('src', '/cdn/bob.png')
  })

  it('.src(interp()) updates without a template wrapper', () => {
    const url = signal('/a.png')
    const img = imgOf(Image().src(interp(url)).alt('p').build())
    expect(img).toHaveAttribute('src', '/a.png')
    act(() => {
      url.value = '/b.png'
    })
    expect(img).toHaveAttribute('src', '/b.png')
  })

  it('.alt(interp()) updates', () => {
    const name = signal('Ada')
    const img = imgOf(Image('/p.png').alt(`Photo of ${interp(name)}`).build())
    expect(img).toHaveAttribute('alt', 'Photo of Ada')
    act(() => {
      name.value = 'Bob'
    })
    expect(img).toHaveAttribute('alt', 'Photo of Bob')
  })
})

describe('W20-04 Image sanitizes resolved interp src', () => {
  it('strips javascript: after interp resolves', () => {
    const src = signal('javascript:alert(1)')
    const img = imgOf(Image(interp(src)).alt('x').build())
    expect(img.getAttribute('src') ?? '').not.toMatch(/javascript/i)
    act(() => {
      src.value = 'https://example.com/ok.png'
    })
    expect(img).toHaveAttribute('src', 'https://example.com/ok.png')
    act(() => {
      src.value = 'data:text/html,<script>alert(1)</script>'
    })
    expect(img.getAttribute('src') ?? '').not.toMatch(/data:/i)
  })
})

describe('W20-04 Image clipShape is applied', () => {
  it('circle clips with overflow hidden and 50% radius', () => {
    const img = imgOf(
      Image('/photo.png')
        .alt('photo')
        .clipShape('circle')
        .frame({ width: 80, height: 80 })
        .scaledToFill()
        .build(),
    )
    expect(img.className).toMatch(/rounded-full/)
    expect(img.style.overflow).toBe('hidden')
    expect(img.style.borderRadius).toBe('50%')
    expect(img.style.objectFit).toBe('cover')
    expect(img.getAttribute('clipshape')).toBeNull()
  })

  it('rounded and square clip; rest.style cannot drop overflow', () => {
    const rounded = imgOf(
      Image('/photo.png').alt('r').clipShape('rounded').build(),
    )
    expect(rounded.className).toMatch(/rounded-lg/)
    expect(rounded.style.overflow).toBe('hidden')
    expect(rounded.style.borderRadius).toBeTruthy()
    expect(rounded.style.borderRadius).not.toBe('0px')
    cleanup()

    const square = imgOf(
      Image('/photo.png')
        .alt('s')
        .clipShape('square')
        .style({ overflow: 'visible', borderRadius: '12px' })
        .build(),
    )
    expect(square.style.overflow).toBe('hidden')
    expect(square.style.borderRadius).toBe('0px')
  })
})
