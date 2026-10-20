import { createElement, type ReactElement } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Gesture } from '../src/core/gestures/Gesture'
import { LongPressGesture, TapGesture } from '../src/core/gestures/GestureBuilders'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

/** jsdom in this suite has no PointerEvent; stamp coords onto a cancelable Event. */
function firePointer(
  target: EventTarget,
  type: string,
  init: { pointerId?: number; clientX?: number; clientY?: number }
) {
  const ev = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(ev, { pointerId: 1, clientX: 0, clientY: 0, ...init })
  return target.dispatchEvent(ev)
}

describe('TapGesture leftover pointerId / capture / unmount', () => {
  it('activates onEnd on pointerup (fast), onStart on pointerdown', () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()
    const node = TapGesture()
      .onStart(onStart)
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onEnd).not.toHaveBeenCalled()
    firePointer(host, 'pointerup', { pointerId: 1, clientX: 1, clientY: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('keyboard Enter / Space also fires onEnd', () => {
    const onEnd = vi.fn()
    const node = TapGesture()
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    fireEvent.keyDown(host, { key: 'Enter' })
    expect(onEnd).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(host, { key: ' ' })
    expect(onEnd).toHaveBeenCalledTimes(2)
  })

  it('exposes fibo-gesture-tap host for hit-testing', () => {
    const node = TapGesture()
      .onEnd(() => undefined)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    // pad → content film → tap host (handlers live on the outer host)
    const host = getByTestId('pad').closest('.fibo-gesture-tap') as HTMLElement
    expect(host).toBeTruthy()
    expect(host.getAttribute('role')).toBe('button')
  })

  it('does not throw on pointerdown (no pointer capture required)', () => {
    const node = TapGesture()
      .onStart(() => undefined)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    expect(() => firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })).not.toThrow()
  })
})

describe('LongPress leftover pointerId / capture throw', () => {
  it('does not cancel the press when a different pointer lifts', () => {
    vi.useFakeTimers()
    const onEnd = vi.fn()
    const node = LongPressGesture({ duration: 400 })
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'hold')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(host, 'pointerup', { pointerId: 2, clientX: 0, clientY: 0 })
    vi.advanceTimersByTime(400)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('does not throw on pointerdown when setPointerCapture throws', () => {
    const proto = HTMLElement.prototype
    const prev = proto.setPointerCapture
    proto.setPointerCapture = () => {
      throw new DOMException('InvalidStateError')
    }
    try {
      const node = LongPressGesture({ duration: 400 })
        .onStart(() => undefined)
        .wrap(createElement('span', { 'data-testid': 'pad' }, 'hold')) as ReactElement
      const { getByTestId } = render(node)
      const host = getByTestId('pad').parentElement as HTMLElement
      expect(() => firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })).not.toThrow()
    } finally {
      proto.setPointerCapture = prev
    }
  })
})

describe('pan leftover still holds (W8-02 / W16-07)', () => {
  it('Gesture still ignores foreign window pointerup', () => {
    const onEnd = vi.fn()
    const onUpdate = vi.fn()
    const { getByTestId } = render(
      createElement(Gesture, {
        onPanUpdate: onUpdate,
        onPanEnd: onEnd,
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(window, 'pointerup', { pointerId: 9, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
    firePointer(window, 'pointermove', { pointerId: 1, clientX: 11, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(11)
  })
})
