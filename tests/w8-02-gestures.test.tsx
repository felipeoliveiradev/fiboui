import { createElement, type ReactElement } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Gesture } from '../src/core/gestures/Gesture'
import { DragGesture, TapGesture } from '../src/core/gestures/GestureBuilders'
import { PanRecognizer } from '../src/core/gestures/Pan'
import { GestureState } from '../src/core/gestures/Recognizer'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function stubPointer(partial: { pointerId?: number; clientX: number; clientY: number }): PointerEvent {
  return partial as PointerEvent
}

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

describe('PanRecognizer pointer identity', () => {
  it('does not reset pan origin when a second pointer goes down', () => {
    const onUpdate = vi.fn()
    const pan = new PanRecognizer({ onUpdate })
    pan.onPointerDown(stubPointer({ pointerId: 1, clientX: 0, clientY: 0 }))
    pan.onPointerMove(stubPointer({ pointerId: 1, clientX: 10, clientY: 0 }))
    pan.onPointerDown(stubPointer({ pointerId: 2, clientX: 100, clientY: 0 }))
    pan.onPointerMove(stubPointer({ pointerId: 1, clientX: 20, clientY: 0 }))

    const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0] as { translation: { x: number }; delta: { x: number } }
    expect(last.translation.x).toBe(20)
    expect(last.delta.x).toBe(10)
  })

  it('ignores pointerup from a different pointer so the pan stays live', () => {
    const onEnd = vi.fn()
    const onUpdate = vi.fn()
    const pan = new PanRecognizer({ onEnd, onUpdate })
    pan.onPointerDown(stubPointer({ pointerId: 1, clientX: 0, clientY: 0 }))
    pan.onPointerUp(stubPointer({ pointerId: 2, clientX: 0, clientY: 0 }))
    expect(onEnd).not.toHaveBeenCalled()
    expect(pan.state).toBe(GestureState.Began)

    pan.onPointerMove(stubPointer({ pointerId: 1, clientX: 8, clientY: 0 }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate.mock.calls[0][0].translation.x).toBe(8)
  })
})

describe('Gesture pan session', () => {
  it('does not throw on pointerdown when setPointerCapture is missing', () => {
    const { getByTestId } = render(
      createElement(Gesture, {
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    expect(() => firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })).not.toThrow()
  })

  it('preventDefault on pan pointerdown so native image-drag / scroll do not steal the gesture', () => {
    const { getByTestId } = render(
      createElement(Gesture, {
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    const prevented = firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    expect(prevented).toBe(false)
  })

  it('fires onPanEnd on unmount while a pan is in progress', () => {
    const onPanEnd = vi.fn()
    const { getByTestId, unmount } = render(
      createElement(Gesture, {
        onPanEnd,
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 4, clientY: 6 })
    unmount()
    expect(onPanEnd).toHaveBeenCalledTimes(1)
    const event = onPanEnd.mock.calls[0][0] as { location: { x: number; y: number }; translation: { x: number; y: number } }
    expect(event.location).toEqual({ x: 4, y: 6 })
    expect(event.translation).toEqual({ x: 0, y: 0 })
  })

  it('tracks move/up on window when pointer capture is unavailable', () => {
    const onUpdate = vi.fn()
    const onEnd = vi.fn()
    const { getByTestId } = render(
      createElement(Gesture, {
        onPanUpdate: onUpdate,
        onPanEnd: onEnd,
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    firePointer(window, 'pointermove', { pointerId: 1, clientX: 15, clientY: 0 })
    expect(onUpdate).toHaveBeenCalled()
    const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0]
    expect(last.translation.x).toBe(15)
    expect(last.delta.x).toBe(15)
    firePointer(window, 'pointerup', { pointerId: 1, clientX: 15, clientY: 0 })
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('drops window listeners on unmount so a pan session cannot leak', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { getByTestId, unmount } = render(
      createElement(Gesture, {
        children: createElement('span', { 'data-testid': 'pad' }, 'pad'),
      }) as ReactElement
    )
    const host = getByTestId('pad').parentElement as HTMLElement
    firePointer(host, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    const added = add.mock.calls.filter(([type]) => type === 'pointermove' || type === 'pointerup' || type === 'pointercancel')
    expect(added.length).toBeGreaterThan(0)
    unmount()
    const removed = remove.mock.calls.filter(([type]) => type === 'pointermove' || type === 'pointerup' || type === 'pointercancel')
    expect(removed.length).toBe(added.length)
  })
})

describe('DragGesture / TapGesture', () => {
  it('DragGesture fires onEnd on unmount during a drag', () => {
    const onEnd = vi.fn()
    // minimumDistance 0 so pointerdown enters Began (SwiftUI: no onEnded until recognized).
    const node = DragGesture()
      .minimumDistance(0)
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

  it('TapGesture onEnd fires on pointerup (fast), click does not double-fire', () => {
    const onEnd = vi.fn()
    const onStart = vi.fn()
    const node = TapGesture()
      .onStart(onStart)
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    fireEvent.pointerDown(host, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onStart).toHaveBeenCalledTimes(1)
    fireEvent.pointerUp(host, { pointerId: 1, clientX: 2, clientY: 1 })
    expect(onEnd).toHaveBeenCalledTimes(1)
    fireEvent.click(host)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('TapGesture ignores scroll (moved past slop) and pointercancel', () => {
    const onEnd = vi.fn()
    const node = TapGesture()
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    const host = getByTestId('pad').parentElement as HTMLElement
    // jsdom/RTL often drops clientX on PointerEvent — stamp coords onto Event.
    const fire = (type: string, init: { pointerId: number; clientX: number; clientY: number }) => {
      const ev = new Event(type, { bubbles: true, cancelable: true })
      Object.assign(ev, init)
      host.dispatchEvent(ev)
    }
    fire('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    fire('pointermove', { pointerId: 1, clientX: 40, clientY: 0 })
    fire('pointerup', { pointerId: 1, clientX: 40, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()

    fire('pointerdown', { pointerId: 2, clientX: 0, clientY: 0 })
    fire('pointercancel', { pointerId: 2, clientX: 0, clientY: 0 })
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('TapGesture click fallback when pointerup never arrived', () => {
    const onEnd = vi.fn()
    const node = TapGesture()
      .onEnd(onEnd)
      .wrap(createElement('span', { 'data-testid': 'pad' }, 'pad')) as ReactElement
    const { getByTestId } = render(node)
    fireEvent.click(getByTestId('pad').parentElement as HTMLElement)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })
})
