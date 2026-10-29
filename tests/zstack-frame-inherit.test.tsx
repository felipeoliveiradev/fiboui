import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Image, Size, StackAlign, Text, ZStack } from '../src'

afterEach(cleanup)

describe('ZStack — SwiftUI child-driven frame + hit testing', () => {
  it('inherits fixed frame from base Image onto the ZStack host', () => {
    const { container } = render(
      ZStack()
        .children([
          Image('https://example.com/p.jpg').frame({ width: 300, height: 400 }),
          Text('caption'),
        ])
        .build()
    )
    const stack = container.querySelector('.fibo-zstack') as HTMLElement
    expect(stack.style.width).toBe('300px')
    expect(stack.style.height).toBe('400px')
  })

  it('does not promote base frame width when host already has .width(Size.full)', () => {
    const { container } = render(
      ZStack()
        .width(Size.full)
        .children([
          Image('https://example.com/p.jpg').frame({ width: 1600, height: 320 }),
          Text('caption'),
        ])
        .build()
    )
    const stack = container.querySelector('.fibo-zstack') as HTMLElement
    expect(stack.style.width).not.toBe('1600px')
    expect(stack.className).toMatch(/\bw-full\b/)
    expect(stack.style.height).toBe('320px')
  })

  it('does not promote base frame height when host already has .height()', () => {
    const { container } = render(
      ZStack()
        .width(Size.full)
        .height(320)
        .children([
          Image('https://example.com/p.jpg').frame({ width: 1600, height: 500 }),
        ])
        .build()
    )
    const stack = container.querySelector('.fibo-zstack') as HTMLElement
    expect(stack.style.width).not.toBe('1600px')
    expect(stack.style.height).toBe('320px')
  })

  it('gesture without explicit contentShape still gets a rectangle hit host', () => {
    const onTap = vi.fn()
    const { container } = render(
      ZStack()
        .alignment(StackAlign.bottom)
        .children([
          Image('https://example.com/p.jpg').frame({ width: 200, height: 100 }),
          Text('title'),
        ])
        .clipShape('8px')
        .onTapGesture(onTap)
        .build()
    )
    expect(container.querySelector('.fibo-content-shape')).toBeTruthy()
    const host = container.querySelector('.fibo-gesture-tap') as HTMLElement
    fireEvent.pointerDown(host, { pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(host, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('explicit ZStack.frame still wraps (outer frame wins as wrapper)', () => {
    const { container } = render(
      ZStack()
        .children([
          Image('https://example.com/p.jpg').frame({ width: 300, height: 400 }),
        ])
        .frame({ width: 150, height: 200 })
        .build()
    )
    const outer = container.querySelector('.fibo-frame') as HTMLElement
    expect(outer).toBeTruthy()
    expect(outer.style.width).toBe('150px')
    expect(outer.style.height).toBe('200px')
  })
})
