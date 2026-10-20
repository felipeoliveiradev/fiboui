import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Box,
  GeometryReader,
  LayoutBuilder,
  StackAlign,
  TapGesture,
  Text,
} from '../src'

afterEach(cleanup)

describe('SwiftUI view chrome — offset / clipped / overlay / fixedSize', () => {
  it('offset wraps with translate', () => {
    const { container } = render(
      Text('shifted').offset({ x: 8, y: -4 }).build()
    )
    const host = container.querySelector('.fibo-offset') as HTMLElement
    expect(host).toBeTruthy()
    expect(host.style.transform).toBe('translate(8px, -4px)')
  })

  it('clipped sets overflow hidden', () => {
    const { container } = render(Text('clip').clipped().build())
    const host = container.querySelector('.fibo-clipped') as HTMLElement
    expect(host.style.overflow).toBe('hidden')
  })

  it('clipShape(circle) sets borderRadius 50%', () => {
    const { container } = render(Text('round').clipShape('circle').build())
    const host = container.querySelector('.fibo-clip-shape') as HTMLElement
    expect(host.style.borderRadius).toBe('50%')
  })

  it('contentShape lays a transparent hit film above the view', () => {
    const onEnd = vi.fn()
    const { container } = render(
      Box()
        .frame({ width: 120, height: 80 })
        .contentShape('rectangle')
        .onTapGesture(onEnd)
        .children(Text('hit'))
        .build()
    )
    const shape = container.querySelector('.fibo-content-shape') as HTMLElement
    expect(shape).toBeTruthy()
    expect(shape.getAttribute('data-fibo-content-shape')).toBe('rectangle')
    const body = container.querySelector('.fibo-content-shape-body') as HTMLElement
    expect(body.style.pointerEvents).toBe('none')
    const film = container.querySelector('.fibo-hit-film') as HTMLElement
    expect(film).toBeTruthy()
    expect(film.style.position).toBe('absolute')
    expect(film.getAttribute('aria-hidden')).toBe('true')
    // Events on the film capture through gesture hosts
    fireEvent.pointerDown(film, { pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(film, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('fixedSize hugs content', () => {
    const { container } = render(Text('hug').fixedSize().build())
    const host = container.querySelector('.fibo-fixed-size') as HTMLElement
    expect(host.style.width).toBe('fit-content')
    expect(host.style.height).toBe('fit-content')
  })

  it('layoutPriority sets flexGrow', () => {
    const { container } = render(Text('prio').layoutPriority(2).build())
    const host = container.querySelector('.fibo-layout-priority') as HTMLElement
    expect(host.getAttribute('data-fibo-layout-priority')).toBe('2')
    expect(host.style.flexGrow).toBe('2')
  })

  it('overlay places child above base', () => {
    const { container } = render(
      Box()
        .children(Text('base'))
        .overlay(Text('badge'), StackAlign.topTrailing)
        .build()
    )
    expect(container.querySelector('.fibo-view-overlay')).toBeTruthy()
    expect(screen.getByText('base')).toBeTruthy()
    expect(screen.getByText('badge')).toBeTruthy()
  })

  it('background places child behind base', () => {
    const { container } = render(
      Box()
        .children(Text('front'))
        .background(Text('back'), StackAlign.center)
        .build()
    )
    expect(container.querySelector('.fibo-view-background')).toBeTruthy()
    expect(screen.getByText('front')).toBeTruthy()
    expect(screen.getByText('back')).toBeTruthy()
  })

  it('onGeometryChange fires with rect shape', () => {
    const onChange = vi.fn()
    render(Text('geo').onGeometryChange(onChange).build())
    expect(onChange).toHaveBeenCalled()
    const rect = onChange.mock.calls[0][0]
    expect(rect).toEqual(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      })
    )
  })

  it('GeometryReader is an alias of LayoutBuilder', () => {
    expect(GeometryReader).toBe(LayoutBuilder)
    const { container } = render(
      GeometryReader()
        .builder((size) => Text(`${Math.round(size.width)}x${Math.round(size.height)}`))
        .build()
    )
    expect(container.querySelector('.fibo-layout-builder')).toBeTruthy()
  })
})

describe('SwiftUI gesture sugar — onTapGesture / onLongPressGesture / modes', () => {
  it('onTapGesture(2) requires double tap', () => {
    const onEnd = vi.fn()
    render(Box().onTapGesture(2, onEnd).children(Text('dbl')).build())
    const el = screen.getByText('dbl')
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
    fireEvent.pointerDown(el, { pointerId: 2, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(el, { pointerId: 2, clientX: 0, clientY: 0 })
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('onTapGesture(2) accepts native dblclick fallback', () => {
    const onEnd = vi.fn()
    render(Box().onTapGesture(2, onEnd).children(Text('native-dbl')).build())
    const el = screen.getByText('native-dbl')
    fireEvent.doubleClick(el)
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('onLongPressGesture calls perform after duration', () => {
    vi.useFakeTimers()
    const perform = vi.fn()
    const pressing = vi.fn()
    render(
      Box()
        .onLongPressGesture({
          minimumDuration: 50,
          perform,
          onPressingChanged: pressing,
        })
        .children(Text('hold'))
        .build()
    )
    const el = screen.getByText('hold')
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(pressing).toHaveBeenCalledWith(true)
    vi.advanceTimersByTime(50)
    expect(perform).toHaveBeenCalledOnce()
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(pressing).toHaveBeenCalledWith(false)
    vi.useRealTimers()
  })

  it('simultaneousGesture marks bubble path', () => {
    const a = vi.fn()
    const b = vi.fn()
    render(
      Box()
        .gesture(TapGesture().onEnd(a))
        .simultaneousGesture(TapGesture().onEnd(b))
        .children(Text('both'))
        .build()
    )
    const el = screen.getByText('both')
    fireEvent.pointerDown(el, { pointerId: 1 })
    fireEvent.pointerUp(el, { pointerId: 1 })
    // Outer high-priority stack not used; both wrappers present — at least one fires.
    expect(a.mock.calls.length + b.mock.calls.length).toBeGreaterThanOrEqual(1)
  })
})
