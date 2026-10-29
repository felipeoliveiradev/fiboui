import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Image, StackAlign, stackAlignObjectPosition } from '../src'

afterEach(cleanup)

describe('Image.objectPosition / scaledToFill(alignment)', () => {
  it('maps StackAlign to object-position CSS', () => {
    expect(stackAlignObjectPosition(StackAlign.top)).toBe('50% 0%')
    expect(stackAlignObjectPosition(StackAlign.topLeft)).toBe('0% 0%')
    expect(stackAlignObjectPosition('20% 30%')).toBe('20% 30%')
  })

  it('scaledToFill(StackAlign.top) sets object-fit cover + object-position', () => {
    const { container } = render(
      Image('https://example.com/p.jpg').scaledToFill(StackAlign.top).build(),
    )
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.style.objectFit).toBe('cover')
    expect(img.style.objectPosition).toBe('50% 0%')
  })

  it('objectPosition() accepts raw CSS', () => {
    const { container } = render(
      Image('https://example.com/p.jpg')
        .scaledToFill()
        .objectPosition('center 20%')
        .build(),
    )
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.style.objectPosition).toBe('center 20%')
  })
})
