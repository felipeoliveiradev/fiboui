import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { List, ListTile, Text, listSignal } from '../src/index'

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
})
