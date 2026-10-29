import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AspectRatio, Image, Size, StackAlign } from '../src'

afterEach(cleanup)

describe('AspectRatio fill slot', () => {
  it('hosts an absolute slot so children cannot inflate the ratio box', () => {
    const { container } = render(
      AspectRatio(16 / 9)
        .width(Size.full)
        .children(
          Image('https://example.com/tall.jpg').scaledToFill(StackAlign.top).build(),
        )
        .build(),
    )
    const host = container.querySelector('.fibo-aspect-ratio') as HTMLElement
    const slot = container.querySelector('.fibo-aspect-ratio-slot') as HTMLElement
    expect(host.style.aspectRatio).toBe(String(16 / 9))
    expect(host.style.overflow).toBe('hidden')
    expect(slot).toBeTruthy()
    expect(slot.style.position).toBe('absolute')
    expect(['0', '0px']).toContain(slot.style.inset)
  })
})
