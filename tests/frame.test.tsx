import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  Box,
  Image,
  Size,
  StackAlign,
  Text,
  resolveFrameSize,
  isFixedNumericFrame,
} from '../src'

afterEach(cleanup)

describe('frame — SwiftUI View.frame', () => {
  it('resolveFrameSize maps Size.infinity by role', () => {
    expect(resolveFrameSize(Size.infinity, 'max')).toBe('100%')
    expect(resolveFrameSize(Size.infinity, 'ideal')).toBe('100%')
    expect(resolveFrameSize(Size.infinity, 'min')).toBe('0px')
    expect(resolveFrameSize(300, 'fixed')).toBe('300px')
  })

  it('isFixedNumericFrame is true only for plain width+height numbers', () => {
    expect(isFixedNumericFrame({ width: 300, height: 400 })).toBe(true)
    expect(
      isFixedNumericFrame({
        width: 300,
        height: 400,
        maxWidth: Size.infinity,
      })
    ).toBe(false)
    expect(
      isFixedNumericFrame({
        maxWidth: Size.infinity,
        maxHeight: Size.infinity,
        alignment: StackAlign.topTrailing,
      })
    ).toBe(false)
  })

  it('Image fixed frame still paints on the img (no fibo-frame wrapper)', () => {
    const { container } = render(
      Image('https://example.com/p.jpg').frame({ width: 300, height: 400 }).build()
    )
    expect(container.querySelector('.fibo-frame')).toBeNull()
    const img = container.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.style.width).toBe('300px')
    expect(img.style.height).toBe('400px')
  })

  it('flexible frame wraps any builder with StackAlign', () => {
    const { container } = render(
      Text('★★★★')
        .frame({
          maxWidth: Size.infinity,
          maxHeight: Size.infinity,
          alignment: StackAlign.topTrailing,
        })
        .build()
    )
    const frame = container.querySelector('.fibo-frame') as HTMLElement
    expect(frame).toBeTruthy()
    expect(frame.getAttribute('data-fibo-frame')).toBe('topRight')
    expect(frame.style.width).toBe('100%')
    expect(frame.style.height).toBe('100%')
    expect(frame.style.alignItems).toBe('flex-start')
    expect(frame.style.justifyContent).toBe('flex-end')
  })

  it('accepts SwiftUI alias keys on StackAlign', () => {
    const { container } = render(
      Box()
        .frame({
          maxWidth: Size.infinity,
          alignment: 'topTrailing',
        })
        .build()
    )
    const frame = container.querySelector('.fibo-frame') as HTMLElement
    expect(frame.getAttribute('data-fibo-frame')).toBe('topRight')
  })

  it('chains frames outer → inner (last call is outermost)', () => {
    const { container } = render(
      Text('x')
        .frame({ width: 10, height: 10 })
        .frame({ maxWidth: Size.infinity, alignment: StackAlign.center })
        .build()
    )
    const frames = container.querySelectorAll('.fibo-frame')
    expect(frames.length).toBe(2)
    expect((frames[0] as HTMLElement).style.width).toBe('100%')
    expect((frames[1] as HTMLElement).style.width).toBe('10px')
  })
})
