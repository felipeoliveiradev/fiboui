import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  Badge,
  Collapse,
  Table,
  Tags,
  interp,
  listSignal,
  signal,
} from '../src'

afterEach(cleanup)

function bumpList() {
  const todos = listSignal<{ title: string }>([])
  return {
    todos,
    add: () => {
      todos.add({ title: 'A' })
    },
  }
}

describe('Table header live interp', () => {
  it('header with $length auto-updates', () => {
    const { todos, add } = bumpList()
    render(
      Table()
        .columns([{ header: `Rows ${todos.$length}`, accessor: 'title' }])
        .data([{ title: 'Ada' }])
        .build() as any
    )
    expect(screen.getByRole('columnheader')).toHaveTextContent('Rows 0')
    act(add)
    expect(screen.getByRole('columnheader')).toHaveTextContent('Rows 1')
  })

  it('header with interp() auto-updates', () => {
    const name = signal('Ada')
    render(
      Table()
        .columns([{ header: `Hi ${interp(name)}`, accessor: 'title' }])
        .data([{ title: 'x' }])
        .build() as any
    )
    expect(screen.getByRole('columnheader')).toHaveTextContent('Hi Ada')
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByRole('columnheader')).toHaveTextContent('Hi Bob')
  })

  it('todos.length still freezes (use $length)', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Table()
        .columns([{ header: `Frozen ${todos.length}`, accessor: 'title' }])
        .data([{ title: 'Ada' }])
        .build() as any
    )
    expect(screen.getByRole('columnheader')).toHaveTextContent('Frozen 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('columnheader')).toHaveTextContent('Frozen 0')
  })
})

describe('Tags label live interp', () => {
  it('item title with $length auto-updates', () => {
    const { todos, add } = bumpList()
    render(Tags().items([{ title: `n=${todos.$length}` }]).build() as any)
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(add)
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('constructor items with interp() auto-update', () => {
    const name = signal('Ada')
    render(Tags([{ title: `Hi ${interp(name)}` }]).build() as any)
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('Badge live interp (Text FineGrain — lock)', () => {
  it('Badge().text(`…${todos.$length}`) auto-updates', () => {
    const { todos, add } = bumpList()
    render(Badge().text(`Items ${todos.$length}`).build() as any)
    expect(screen.getByText('Items 0')).toBeInTheDocument()
    act(add)
    expect(screen.getByText('Items 1')).toBeInTheDocument()
  })

  it('intent alert accessible name follows FineGrain text', () => {
    const { todos, add } = bumpList()
    render(Badge().text(`Err ${todos.$length}`).intent('error').build() as any)
    expect(screen.getByRole('alert')).toHaveTextContent('Err 0')
    act(add)
    expect(screen.getByRole('alert')).toHaveTextContent('Err 1')
  })
})

describe('Collapse title live interp (Text FineGrain — lock)', () => {
  it('string title with $length auto-updates', () => {
    const { todos, add } = bumpList()
    render(
      Collapse()
        .title(`Open ${todos.$length}`)
        .content('body')
        .build() as any
    )
    expect(screen.getByRole('button', { name: 'Open 0' })).toBeInTheDocument()
    act(add)
    expect(screen.getByRole('button', { name: 'Open 1' })).toBeInTheDocument()
  })
})
