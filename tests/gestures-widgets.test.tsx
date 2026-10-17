import { createElement } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Draggable } from '../src/interactive/Draggable'
import { DragTarget } from '../src/interactive/DragTarget'
import { Hero } from '../src/interactive/Hero'
import { InteractiveViewer } from '../src/interactive/InteractiveViewer'

afterEach(() => {
  cleanup()
})

describe('gesture widgets', () => {
  it('marks the Draggable root as draggable and stamps data-drag-id', () => {
    const { container } = render(
      Draggable().data({ id: 'a' }).child(createElement('span', null, 'card')),
    )
    const root = container.querySelector('.fibo-draggable') as HTMLElement
    expect(root).toBeTruthy()
    expect(root).toHaveAttribute('draggable', 'true')
    expect(root).toHaveAttribute('data-drag-id', 'a')
  })

  it('writes drag data on drag start', () => {
    const onDragStart = vi.fn()
    const setData = vi.fn()
    const { container } = render(
      Draggable().data({ id: 'a' }).onDragStart(onDragStart).child('item'),
    )
    const root = container.querySelector('.fibo-draggable') as HTMLElement
    fireEvent.dragStart(root, { dataTransfer: { setData } })
    expect(setData).toHaveBeenCalledWith('text', JSON.stringify({ id: 'a' }))
    expect(onDragStart).toHaveBeenCalledTimes(1)
  })

  it('calls DragTarget onAccept with parsed drop data', () => {
    const onAccept = vi.fn()
    const payload = { id: 'a', name: 'card' }
    const { container } = render(
      DragTarget().onAccept(onAccept).child(createElement('div', null, 'drop')),
    )
    const root = container.querySelector('[data-drop-target="true"]') as HTMLElement
    expect(root).toBeTruthy()

    const over = fireEvent.dragOver(root)
    expect(over).toBe(false)

    fireEvent.drop(root, {
      dataTransfer: {
        getData: (type: string) =>
          type === 'text' || type === 'text/plain' ? JSON.stringify(payload) : '',
      },
    })
    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onAccept).toHaveBeenCalledWith(payload)
  })

  it('stamps a sanitized hero tag', () => {
    const { container } = render(Hero().tag('photo').child(createElement('img', { alt: '' })))
    const root = container.querySelector('[data-hero]') as HTMLElement
    expect(root).toHaveAttribute('data-hero', 'photo')
    expect(root.style.viewTransitionName).toBe('photo')
  })

  it('zooms the InteractiveViewer stage from 1 to 2', () => {
    const { container, getByRole } = render(
      InteractiveViewer().minScale(1).maxScale(4).child(createElement('div', null, 'map')),
    )
    const stage = container.querySelector('[data-viewer-stage]') as HTMLElement
    expect(stage.style.transform).toBe('scale(1)')
    fireEvent.click(getByRole('button', { name: 'Zoom in' }))
    expect(stage.style.transform).toBe('scale(2)')
    fireEvent.click(getByRole('button', { name: 'Zoom out' }))
    expect(stage.style.transform).toBe('scale(1)')
  })
})
