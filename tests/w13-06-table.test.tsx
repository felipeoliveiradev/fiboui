import { type ReactElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Table, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('W13-06 Table leftover — cell interp after data(listSignal)', () => {
  it('interp() on a cell added after data(listSignal) stays live', () => {
    const name = signal('Ada')
    const rows = listSignal<{ name: string }>([{ name: 'static' }])
    render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data(rows)
        .build() as ReactElement
    )
    expect(screen.getByText('static')).toBeInTheDocument()

    act(() => {
      rows.add({ name: `Hi ${interp(name)}` })
    })
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })

  it('$length on a cell added after data(listSignal) stays live', () => {
    const todos = listSignal<{ title: string }>([])
    const rows = listSignal<{ label: string }>([])
    render(
      Table()
        .columns([{ header: 'Label', accessor: 'label' }])
        .data(rows)
        .build() as ReactElement
    )

    act(() => {
      rows.add({ label: `n=${todos.$length}` })
    })
    expect(screen.getByText('n=0')).toBeInTheDocument()

    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('listSignal.update that introduces interp() stays live', () => {
    const name = signal('Ada')
    const rows = listSignal<{ name: string }>([{ name: 'old' }])
    render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data(rows)
        .build() as ReactElement
    )
    expect(screen.getByText('old')).toBeInTheDocument()

    act(() => {
      rows.update(rows.value[0]._id, { name: `Hi ${interp(name)}` })
    })
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('W13-06 Table leftover — render cell', () => {
  it('render returning an interp string stays live', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Table()
        .columns([{ header: 'Count', render: () => `n=${todos.$length}` }])
        .data([{ id: 1 }])
        .build() as ReactElement
    )
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('render returning Text() builder paints the cell (docs API)', () => {
    render(
      Table()
        .columns([
          { header: 'Product', accessor: 'name' },
          {
            header: 'Price',
            render: (item) => Text(`$${item.price}`).fontWeight('600'),
          },
        ])
        .data([{ name: 'Widget', price: 12 }])
        .build() as ReactElement
    )
    expect(screen.getByText('$12')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })
})
