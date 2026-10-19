import { afterEach, describe, it, expect, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { List, ListTile, Text, listSignal } from '../src/index'

afterEach(() => {
  cleanup()
})

describe('List children/items without renderItem', () => {
  it('renders ListTile from items()', () => {
    render(
      List()
        .items([
          ListTile().title('One').chevron(true),
          ListTile().title('Two'),
        ])
        .build() as any
    )
    expect(screen.getByText('One')).toBeTruthy()
    expect(screen.getByText('Two')).toBeTruthy()
  })

  it('renders mixed children()', () => {
    render(
      List()
        .variant('card')
        .children([
          ListTile().title('A'),
          Text('B'),
        ])
        .build() as any
    )
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
  })

  it('items() and children() are interchangeable for UI', () => {
    const { rerender } = render(
      List()
        .items([ListTile().title('ViaItems')])
        .build() as any
    )
    expect(screen.getByText('ViaItems')).toBeTruthy()

    rerender(
      List()
        .children([ListTile().title('ViaChildren')])
        .build() as any
    )
    expect(screen.getByText('ViaChildren')).toBeTruthy()
  })

  it('itemStyle applies to every row wrapper', () => {
    const { container } = render(
      List()
        .reset()
        .itemStyle((s) => s.padding(20).bg('rgb(255, 0, 0)').rounded(8))
        .children([ListTile().title('Styled')])
        .build() as any
    )
    expect(screen.getByText('Styled')).toBeTruthy()
    const row = container.querySelector('.fibo-list-tile')?.parentElement
    expect(row?.style.padding).toBe('20px')
    expect(row?.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('itemStyle accepts any CSS3 property via Proxy (boxShadow, transform, …)', () => {
    const { container } = render(
      List()
        .reset()
        .itemStyle((s) =>
          s
            .boxShadow(0)
            .border(0)
            .transform('translateY(2px)')
            .css('clip-path', 'inset(0)')
        )
        .children([ListTile().title('FullCSS')])
        .build() as any
    )
    const row = container.querySelector('.fibo-list-tile')?.parentElement as HTMLElement
    expect(row.style.boxShadow).toBe('none')
    expect(row.style.border).toMatch(/0/)
    expect(row.style.transform).toBe('translateY(2px)')
    expect(row.style.clipPath).toBe('inset(0)')
  })

  it('items(listSignal) rebuilds when the collection changes', () => {
    const todos = listSignal<{ title: string }>([{ title: 'One' }])
    render(
      List()
        .items(todos)
        .renderItem((todo) => ListTile().title(todo.title))
        .build() as any
    )
    expect(screen.getAllByText('One').length).toBeGreaterThan(0)
    act(() => {
      todos.add({ title: 'Two' })
    })
    expect(screen.getAllByText('Two').length).toBeGreaterThan(0)
  })

  it('itemStyle({object}) runs values through normalizeCssValue', () => {
    const { container } = render(
      List()
        .reset()
        .itemStyle({ boxShadow: 0, padding: 14 } as any)
        .children([ListTile().title('ObjStyle')])
        .build() as any
    )
    const row = container.querySelector('.fibo-list-item') as HTMLElement
    expect(row).toBeTruthy()
    expect(row.style.boxShadow).toBe('none')
    expect(row.style.padding).toBe('14px')
  })

  it('items(fn) re-runs when bindSignal rebuilds the list', () => {
    const todos = listSignal<{ title: string }>([{ title: 'One' }])
    render(
      List()
        .items(() => todos.value.map((t) => ListTile().title(t.title)))
        .bindSignal(todos)
        .build() as any
    )
    expect(screen.getAllByText('One').length).toBeGreaterThan(0)
    act(() => {
      todos.add({ title: 'Two' })
    })
    expect(screen.getAllByText('Two').length).toBeGreaterThan(0)
  })

  it('virtualized rows stamp fibo-list-item and survive _id remove', () => {
    const rows = listSignal(
      Array.from({ length: 110 }, (_, i) => ({ title: `Row-${i}` }))
    )
    const { container } = render(
      List()
        .items(rows)
        .containerHeight(400)
        .renderItem((row: { title: string }) => Text(row.title))
        .build() as any
    )
    expect(container.querySelector('.fibo-list-virtualized')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()
    const firstId = rows.value[0]._id
    act(() => {
      rows.remove(firstId)
    })
    expect(screen.queryByText('Row-0')).toBeNull()
    expect(screen.getByText('Row-1')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()
  })
})

describe('List().empty()', () => {
  it('shows a string when items is an empty array', () => {
    const { container } = render(
      List()
        .items([])
        .empty('Nothing here')
        .build() as any
    )
    expect(screen.getByText('Nothing here')).toBeTruthy()
    expect(container.querySelector('.fibo-list-empty')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeNull()
  })

  it('shows a builder and a node, not a list row', () => {
    const { container, rerender } = render(
      List()
        .items([])
        .empty(Text('Builder empty'))
        .build() as any
    )
    expect(screen.getByText('Builder empty')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeNull()

    rerender(
      List()
        .items([])
        .empty(Text('Node empty').build())
        .build() as any
    )
    expect(screen.getByText('Node empty')).toBeTruthy()
  })

  it('re-runs a factory builder on each rebuild', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      List()
        .items(todos)
        .empty(() => Text(`Count ${todos.length}`))
        .renderItem((todo) => Text(todo.title))
        .build() as any
    )
    expect(screen.getByText('Count 0')).toBeTruthy()
  })

  it('hides empty when items exist', () => {
    const { container } = render(
      List()
        .items([ListTile().title('One')])
        .empty('Nothing here')
        .build() as any
    )
    expect(screen.queryByText('Nothing here')).toBeNull()
    expect(container.querySelector('.fibo-list-empty')).toBeNull()
    expect(screen.getByText('One')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()
  })

  it('shows empty for an empty listSignal and toggles on add/clear', () => {
    const todos = listSignal<{ title: string }>([])
    const { container } = render(
      List()
        .items(todos)
        .empty('No todos')
        .renderItem((todo) => ListTile().title(todo.title))
        .build() as any
    )
    expect(screen.getByText('No todos')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeNull()

    act(() => {
      todos.add({ title: 'Ship' })
    })
    expect(screen.queryByText('No todos')).toBeNull()
    expect(screen.getByText('Ship')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()

    act(() => {
      todos.clear()
    })
    expect(screen.getByText('No todos')).toBeTruthy()
    expect(screen.queryByText('Ship')).toBeNull()
    expect(container.querySelector('.fibo-list-item')).toBeNull()
  })

  it('shows empty when items(fn) returns []', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      List()
        .items(() => todos.value.map((t) => ListTile().title(t.title)))
        .bindSignal(todos)
        .empty('No fn rows')
        .build() as any
    )
    expect(screen.getByText('No fn rows')).toBeTruthy()
    act(() => {
      todos.add({ title: 'Live' })
    })
    expect(screen.queryByText('No fn rows')).toBeNull()
    expect(screen.getByText('Live')).toBeTruthy()
  })

  it('drops virtualization and shows empty when a large listSignal is cleared', () => {
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
    expect(container.querySelector('.fibo-list-virtualized')).toBeTruthy()
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()

    act(() => {
      rows.set([])
    })
    expect(screen.getByText('No virtual rows')).toBeTruthy()
    expect(container.querySelector('.fibo-list-virtualized')).toBeNull()
    expect(container.querySelector('.fibo-list-item')).toBeNull()
    expect(container.querySelector('.fibo-list-empty')).toBeTruthy()
  })

  it('onPress receives the row item', () => {
    const onPress = vi.fn()
    render(
      List()
        .items([{ id: 'a', title: 'Alpha' }])
        .onPress(onPress)
        .renderItem((row: { title: string }) => Text(row.title))
        .build() as any
    )
    fireEvent.click(screen.getByText('Alpha'))
    expect(onPress).toHaveBeenCalledOnce()
    expect(onPress.mock.calls[0][0]).toMatchObject({ id: 'a', title: 'Alpha' })
    expect(onPress.mock.calls[0][1]).toBe(0)
  })
})
