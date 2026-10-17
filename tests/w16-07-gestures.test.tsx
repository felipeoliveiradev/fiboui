import { createElement, type ReactElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Gesture } from '../src/core/gestures/Gesture'
import { DragGesture } from '../src/core/gestures/GestureBuilders'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
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

function renderPad(props: {
  onPanUpdate?: (e: { translation: { x: number } }) => void
  onPanEnd?: (e: unknown) => void
}) {
  const { getByTestId } = render(
    createElement(Gesture, {
      onPanUpdate: props.onPanUpdate,
      onPanEnd: props.onPanEnd,
      children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
    }) as ReactElement
  )
  return getByTestId('pad').parentElement as HTMLElement
}

describe('usePanSession pointer identity (coverage gap vs W8-02 recognizer-only)', () => {
  it('does not detach window pan tracking when a different pointer lifts', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const host = renderPad({ onPanUpdate: onUpdate, onPanEnd: onEnd })

    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(window, 'pointermove', { pointerId: 1, clientX: 10, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(10)

    firePointer(window, 'pointerup', { pointerId: 2, clientX: 10, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()

    firePointer(window, 'pointermove', { pointerId: 1, clientX: 25, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(25)

    firePointer(window, 'pointerup', { pointerId: 1, clientX: 25, clientY: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('does not steal the pan session when a second pointer goes down on the host', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const host = renderPad({ onPanUpdate: onUpdate, onPanEnd: onEnd })

    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(host, 'pointerdown', { pointerId: 2, clientX: 80, clientY: 0 })
    firePointer(window, 'pointerup', { pointerId: 2, clientX: 80, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()

    firePointer(window, 'pointermove', { pointerId: 1, clientX: 12, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(12)
  })

  it('ignores pointerup on the host from a different pointer so window tracking stays live', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const host = renderPad({ onPanUpdate: onUpdate, onPanEnd: onEnd })

    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(host, 'pointerup', { pointerId: 2, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()

    firePointer(window, 'pointermove', { pointerId: 1, clientX: 9, clientY: 0 })
    expect(onUpdate).toHaveBeenCalled()
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(9)
  })

  it('starts a new pan after the previous session ends', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const host = renderPad({ onPanUpdate: onUpdate, onPanEnd: onEnd })

    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(window, 'pointerup', { pointerId: 1, clientX: 4, clientY: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)

    firePointer(host, 'pointerdown', { pointerId: 3, clientX: 10, clientY: 0 })
    firePointer(window, 'pointermove', { pointerId: 3, clientX: 18, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(8)
  })

  it('DragGesture keeps onUpdate after a foreign window pointerup', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const node = DragGesture()
      .onUpdate(onUpdate)
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement

    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(window, 'pointerup', { pointerId: 9, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
    firePointer(window, 'pointermove', { pointerId: 1, clientX: 7, clientY: 0 })
    expect(onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].translation.x).toBe(7)
  })
})
