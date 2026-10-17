import { createElement, type ReactElement } from 'react'
import { cleanup, render } from '@testing-library/react'
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

function stubCapture() {
  const captured = new Set<number>()
  const proto = HTMLElement.prototype
  const prev = {
    set: proto.setPointerCapture,
    has: proto.hasPointerCapture,
    release: proto.releasePointerCapture,
  }
  proto.setPointerCapture = function (id: number) {
    captured.add(id)
  }
  proto.hasPointerCapture = function (id: number) {
    return captured.has(id)
  }
  proto.releasePointerCapture = function (id: number) {
    captured.delete(id)
  }
  return {
    captured,
    restore() {
      proto.setPointerCapture = prev.set
      proto.hasPointerCapture = prev.has
      proto.releasePointerCapture = prev.release
    },
  }
}

describe('TapGesture leftover pointerId / capture / unmount', () => {
  it('setPointerCapture on pointerdown so release off-host can still end the press', () => {
    const cap = stubCapture()
    try {
      const onEnd = vi.fn()
      const node = TapGesture()
        .onEnd(onEnd)
        .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
      const { getByTestId } = render(node)
      const host = getByTestId('pad').parentElement as HTMLElement
      firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
      expect(cap.captured.has(1)).toBe(true)
      firePointer(window, 'pointerup', { pointerId: 1, clientX: 80, clientY: 40 })
      expect(onEnd).toHaveBeenCalledTimes(1)
    } finally {
      cap.restore()
    }
  })

  it('ignores pointerup from a different pointer so pressed UI stays down', () => {
    const onEnd = vi.fn()
    const node = TapGesture()
      .onStart(() => undefined)
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(host, 'pointerup', { pointerId: 2, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
    firePointer(window, 'pointerup', { pointerId: 2, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
    firePointer(host, 'pointerup', { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('fires onEnd on unmount while pressed so UI can reset', () => {
    const onEnd = vi.fn()
    const node = TapGesture()
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId, unmount } = render(node)
    firePointer(getByTestId('pad').parentElement as HTMLElement, 'pointerdown', {
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    })
    unmount()
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('drops window listeners on unmount so a tap session cannot leak', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const node = TapGesture()
      .onEnd(() => undefined)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId, unmount } = render(node)
    firePointer(getByTestId('pad').parentElement as HTMLElement, 'pointerdown', {
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    })
    const added = add.mock.calls.filter(([type]) => type === 'pointerup' || type === 'pointercancel')
    expect(added.length).toBeGreaterThan(0)
    unmount()
    const removed = remove.mock.calls.filter(([type]) => type === 'pointerup' || type === 'pointercancel')
    expect(removed.length).toBe(added.length)
  })

  it('does not throw on pointerdown when setPointerCapture throws', () => {
    const proto = HTMLElement.prototype
    const prev = proto.setPointerCapture
    proto.setPointerCapture = () => {
      throw new DOMException('InvalidStateError')
    }
    try {
      const node = TapGesture()
        .onStart(() => undefined)
        .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
      const { getByTestId } = render(node)
      const host = getByTestId('pad').parentElement as HTMLElement
      expect(() => firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })).not.toThrow()
    } finally {
      proto.setPointerCapture = prev
    }
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
