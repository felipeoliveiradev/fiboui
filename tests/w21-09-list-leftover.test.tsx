import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { List, ListTile, Text, listSignal } from '../src/index'

afterEach(() => {
  cleanup()
})

function reactKey(node: Element | null): string | null {
  if (!node) return null
  const fiberKey = Object.keys(node).find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  )
  if (!fiberKey) return null
  let fiber = (node as any)[fiberKey]
  while (fiber) {
    if (fiber.key != null && fiber.key !== '') return String(fiber.key)
    fiber = fiber.return
  }
  return null
}

function rowKeys(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.fibo-list-item')).map(
    (el) => reactKey(el) ?? ''
  )
}

describe('W21-09 List key stability', () => {
  it('prefers _id then id then key then index', () => {
    const { container } = render(
      List()
        .reset()
        .items([
          { _id: 'uid-1', id: 'id-1', key: 'key-1', title: 'A' },
          { id: 'id-2', key: 'key-2', title: 'B' },
          { key: 'key-3', title: 'C' },
          { title: 'D' },
        ] as { title: string; _id?: string; id?: string; key?: string }[])
        .renderItem((row: { title: string }) => Text(row.title))
        .build() as any
    )
    expect(screen.getByText('A')).toBeTruthy()
    expect(rowKeys(container)).toEqual(['uid-1', 'id-2', 'key-3', 'item-3'])
  })

  it('keeps row identity when items with id are reordered', () => {
    const renderList = (items: { id: string; title: string }[]) =>
      List()
        .reset()
        .items(items)
        .renderItem((row: { title: string }) => Text(row.title))
        .build() as any

    const { container, rerender } = render(
      renderList([
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
      ])
    )
    expect(rowKeys(container)).toEqual(['a', 'b'])

    rerender(
      renderList([
        { id: 'b', title: 'B' },
        { id: 'a', title: 'A' },
      ])
    )
    const rows = Array.from(container.querySelectorAll('.fibo-list-item'))
    expect(reactKey(rows[0])).toBe('b')
    expect(reactKey(rows[1])).toBe('a')
    expect(rows[0].textContent).toContain('B')
    expect(rows[1].textContent).toContain('A')
  })

  it('uses ListTile().key() as the row key in UI mode', () => {
    const { container } = render(
      List()
        .reset()
        .items([
          ListTile().title('One').key('tile-a'),
          ListTile().title('Two').key('tile-b'),
        ])
        .build() as any
    )
    expect(rowKeys(container)).toEqual(['tile-a', 'tile-b'])
  })
})

describe('W21-09 List items(fn)', () => {
  it('re-invokes items(fn) on every bindSignal rebuild, not once', () => {
    const todos = listSignal<{ title: string }>([{ title: 'One' }])
    let calls = 0
    render(
      List()
        .items(() => {
          calls += 1
          return todos.value.map((t) => t.title)
        })
        .bindSignal(todos)
        .renderItem((title: string) => Text(title))
        .build() as any
    )
    expect(calls).toBeGreaterThanOrEqual(1)
    const afterMount = calls
    expect(screen.getByText('One')).toBeTruthy()

    act(() => {
      todos.add({ title: 'Two' })
    })
    expect(calls).toBeGreaterThan(afterMount)
    expect(screen.getByText('Two')).toBeTruthy()
  })
})

describe('W21-09 List empty leftover', () => {
  it('does not keep virtual scroll offset after empty then refill', () => {
    const rows = listSignal(
      Array.from({ length: 110 }, (_, i) => ({ title: `Row-${i}` }))
    )
    const { container } = render(
      List()
        .items(rows)
        .containerHeight(400)
        .empty('No virtual rows')
        .renderItem((row: { title: string }) => Text(row.title))
        .build() as any
    )
    const scroller = container.querySelector('.fibo-list-virtualized') as HTMLElement
    expect(scroller).toBeTruthy()

    act(() => {
      scroller.scrollTop = 2400
      fireEvent.scroll(scroller)
    })
    expect(screen.queryByText('Row-0')).toBeNull()

    act(() => {
      rows.set([])
    })
    expect(screen.getByText('No virtual rows')).toBeTruthy()
    expect(container.querySelector('.fibo-list-virtualized')).toBeNull()

    act(() => {
      rows.set(Array.from({ length: 110 }, (_, i) => ({ title: `New-${i}` })))
    })
    expect(container.querySelector('.fibo-list-virtualized')).toBeTruthy()
    expect(screen.getByText('New-0')).toBeTruthy()
    expect(screen.queryByText('No virtual rows')).toBeNull()
  })
})

describe('W21-09 List virtualization sentinel', () => {
  it('does not crash onEndReached when IntersectionObserver is missing', () => {
    const prev = (globalThis as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver
    delete (globalThis as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver
    try {
      expect(() => {
        render(
          List()
            .items(['A', 'B'])
            .onEndReached(() => {})
            .renderItem((row: string) => Text(row))
            .build() as any
        )
      }).not.toThrow()
      expect(screen.getByText('A')).toBeTruthy()
    } finally {
      if (prev) {
        ;(globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver =
          prev
      }
    }
  })

  it('pins onEndReached at the end of the virtual canvas, not after the window', () => {
    class FakeIO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    const prev = (globalThis as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver
    ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      FakeIO
    try {
      const onEnd = vi.fn()
      const items = Array.from({ length: 110 }, (_, i) => ({
        id: `row-${i}`,
        title: `Row-${i}`,
      }))
      const { container } = render(
        List()
          .items(items)
          .containerHeight(400)
          .onEndReached(onEnd)
          .renderItem((row: { title: string }) => Text(row.title))
          .build() as any
      )
      const virt = container.querySelector('.fibo-list-virtualized') as HTMLElement
      expect(virt).toBeTruthy()
      const spacer = virt.firstElementChild as HTMLElement
      const sentinel = virt.querySelector('.py-4') as HTMLElement
      expect(spacer).toBeTruthy()
      expect(sentinel).toBeTruthy()
      expect(spacer.style.height).toMatch(/px$/)
      expect(sentinel.style.position).toBe('absolute')
      expect(sentinel.style.top).toBe(spacer.style.height)
      expect(onEnd).not.toHaveBeenCalled()
    } finally {
      if (prev) {
        ;(globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver =
          prev
      } else {
        delete (globalThis as unknown as { IntersectionObserver?: unknown })
          .IntersectionObserver
      }
    }
  })
})

describe('W21-09 List itemHover descendant CSS lock', () => {
  it('keeps inheritable hover/active/focus on descendants (scope selector *)', () => {
    render(
      List()
        .items([{ text: 'Buy' }])
        .itemHover((h) => h.color('#111').bg('#eee'))
        .itemActive((a) => a.color('#222'))
        .itemFocus((f) => f.color('#333'))
        .renderItem((item: { text: string }) => Text(item.text))
        .build() as any
    )
    const text =
      document.querySelector('style[id^="fibo-list-custom-styles-"]')?.textContent ??
      ''
    expect(text).toContain(':hover *')
    expect(text).toContain(':active *')
    expect(text).toContain(':focus-within *')
    expect(text).toContain('color: #111 !important')
    expect(text).toContain('color: #222 !important')
    expect(text).toContain('color: #333 !important')
  })
})
