import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Tags, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function reactKey(node: Element): string | null {
  const fiberKey = Object.keys(node).find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  )
  if (!fiberKey) return null
  const fiber = (node as any)[fiberKey]
  const key = fiber?.key
  return key == null ? null : String(key)
}

describe('W13-07 Tags leftover — interp after listSignal bind', () => {
  it('interp() on a tag added after items(listSignal) stays live', () => {
    const name = signal('Ada')
    const tags = listSignal<{ title: string }>([{ title: 'static' }])
    render(Tags().items(tags).build() as ReactElement)
    expect(screen.getByText('static')).toBeInTheDocument()

    act(() => {
      tags.add({ title: `Hi ${interp(name)}` })
    })
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })

  it('$length on a tag added after items(listSignal) stays live', () => {
    const todos = listSignal<{ title: string }>([])
    const tags = listSignal<{ title: string }>([])
    render(Tags().items(tags).build() as ReactElement)

    act(() => {
      tags.add({ title: `n=${todos.$length}` })
    })
    expect(screen.getByText('n=0')).toBeInTheDocument()

    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('listSignal.update that introduces interp() stays live', () => {
    const name = signal('Ada')
    const tags = listSignal<{ title: string }>([{ title: 'old' }])
    render(Tags().items(tags).build() as ReactElement)
    expect(screen.getByText('old')).toBeInTheDocument()

    act(() => {
      tags.update(tags.value[0]._id, { title: `Hi ${interp(name)}` })
    })
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('W13-07 Tags leftover — listSignal keys', () => {
  it('prefers _id then id then key then index', () => {
    const { container } = render(
      Tags()
        .items([
          { _id: 'uid-1', id: 'id-1', key: 'key-1', title: 'A' },
          { id: 'id-2', key: 'key-2', title: 'B' },
          { key: 'key-3', title: 'C' },
          { title: 'D' },
        ] as { title: string; _id?: string; id?: string; key?: string }[])
        .build() as ReactElement
    )
    const spans = Array.from(container.querySelectorAll('.fibo-tag'))
    expect(spans).toHaveLength(4)
    expect(reactKey(spans[0])).toBe('uid-1')
    expect(reactKey(spans[1])).toBe('id-2')
    expect(reactKey(spans[2])).toBe('key-3')
    expect(reactKey(spans[3])).toBe('3')
  })

  it('uses listSignal _id so a title edit does not remount', () => {
    const tags = listSignal<{ title: string }>([{ title: 'alpha' }])
    const { container } = render(Tags().items(tags).build() as ReactElement)
    const before = reactKey(container.querySelector('.fibo-tag') as Element)
    expect(before).toBe(String(tags.value[0]._id))

    act(() => {
      tags.update(tags.value[0]._id, { title: 'beta' })
    })
    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(reactKey(container.querySelector('.fibo-tag') as Element)).toBe(before)
  })
})

describe('W13-07 Tags leftover — host class / crash', () => {
  it('keeps fibo-tags flex wrap when .props({ className }) is set', () => {
    render(
      Tags()
        .items([{ title: 'alpha' }])
        .props({ className: 'extra-tags', 'data-testid': 'tags-host' })
        .build() as ReactElement
    )
    const el = screen.getByTestId('tags-host')
    expect(el.className).toMatch(/fibo-tags/)
    expect(el.className).toMatch(/\bflex\b/)
    expect(el.className).toMatch(/flex-wrap/)
    expect(el.className).toMatch(/extra-tags/)
    expect(screen.getByText('alpha')).toBeInTheDocument()
  })

  it('does not crash on null / non-object items', () => {
    expect(() =>
      render(
        Tags()
          .items([null, undefined, 'bare', { title: 'ok' }] as never)
          .build() as ReactElement
      )
    ).not.toThrow()
    expect(screen.getByText('ok')).toBeInTheDocument()
    expect(screen.queryByText('bare')).toBeNull()
  })

  it('renderToString of interp titles does not throw', () => {
    const name = signal('Ada')
    expect(() =>
      renderToString(
        Tags().items([{ title: `Hi ${interp(name)}` }]).build() as ReactElement
      )
    ).not.toThrow()
  })
})
