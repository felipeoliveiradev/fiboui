import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, LongPressGesture, TapGesture, Text, ZStack } from '../src'

afterEach(cleanup)

describe('universal .gesture / .onPress on FiboBuilder', () => {
  it('ZStack.onPress is sugar for TapGesture.onEnd', () => {
    const onPress = vi.fn()
    render(ZStack().onPress(onPress).children(Text('poster')).build())
    fireEvent.pointerDown(screen.getByText('poster'), { pointerId: 1 })
    fireEvent.pointerUp(screen.getByText('poster'), { pointerId: 1 })
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('ZStack.onTap aliases onPress', () => {
    const onTap = vi.fn()
    render(Box().onTap(onTap).children(Text('hit')).build())
    fireEvent.pointerDown(screen.getByText('hit'), { pointerId: 1 })
    fireEvent.pointerUp(screen.getByText('hit'), { pointerId: 1 })
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('chains multiple gestures (last outermost)', () => {
    const onTap = vi.fn()
    const onLong = vi.fn()
    render(
      Box()
        .gesture(LongPressGesture({ duration: 10 }).onEnd(onLong))
        .gesture(TapGesture().onEnd(onTap))
        .children(Text('pad'))
        .build()
    )
    fireEvent.pointerDown(screen.getByText('pad'), { pointerId: 1 })
    fireEvent.pointerUp(screen.getByText('pad'), { pointerId: 1 })
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('explicit TapGesture still works via .gesture', () => {
    const onEnd = vi.fn()
    render(
      ZStack()
        .gesture(TapGesture().onEnd(onEnd))
        .children(Text('layer'))
        .build()
    )
    fireEvent.pointerDown(screen.getByText('layer'), { pointerId: 1 })
    fireEvent.pointerUp(screen.getByText('layer'), { pointerId: 1 })
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('TapGesture hit box hugs content (not width:100% collapse)', () => {
    const onEnd = vi.fn()
    const { container } = render(
      ZStack()
        .gesture(TapGesture().onEnd(onEnd))
        .children(Text('card'))
        .build()
    )
    const wrap = container.firstElementChild as HTMLElement
    expect(wrap.className).toContain('fibo-gesture-tap')
    expect(wrap.style.display).toBe('inline-flex')
    expect(wrap.style.width).toBe('fit-content')
    fireEvent.pointerDown(screen.getByText('card'), { pointerId: 1 })
    fireEvent.pointerUp(screen.getByText('card'), { pointerId: 1 })
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('tap + longPress compose: short press fires tap, not longPress', () => {
    vi.useFakeTimers()
    const onTap = vi.fn()
    const onLong = vi.fn()
    render(
      Box()
        .onTapGesture(onTap)
        .onLongPressGesture({ minimumDuration: 400, perform: onLong })
        .children(Text('both'))
        .build()
    )
    const el = screen.getByText('both')
    fireEvent.pointerDown(el, { pointerId: 7, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(el, { pointerId: 7, clientX: 0, clientY: 0 })
    expect(onLong).not.toHaveBeenCalled()
    expect(onTap).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('tap + longPress compose: hold fires longPress and suppresses tap', () => {
    vi.useFakeTimers()
    const onTap = vi.fn()
    const onLong = vi.fn()
    render(
      Box()
        .onTapGesture(onTap)
        .onLongPressGesture({ minimumDuration: 50, perform: onLong })
        .children(Text('hold-both'))
        .build()
    )
    const el = screen.getByText('hold-both')
    fireEvent.pointerDown(el, { pointerId: 8, clientX: 0, clientY: 0 })
    vi.advanceTimersByTime(50)
    expect(onLong).toHaveBeenCalledOnce()
    fireEvent.pointerUp(el, { pointerId: 8, clientX: 0, clientY: 0 })
    expect(onTap).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
