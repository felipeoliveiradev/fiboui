import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { List, listSignal } from '../src'

afterEach(cleanup)

describe('List().empty() live interp', () => {
  it('empty(`None ${todos.$length}`) updates when the list changes and is empty', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      List()
        .items(todos)
        .empty(`None ${todos.$length}`)
        .renderItem((todo) => todo.title)
        .build() as any
    )
    expect(screen.getByText('None 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.queryByText('None 1')).toBeNull()
    expect(screen.getByText('A')).toBeInTheDocument()
    act(() => {
      todos.remove(todos.value[0]._id)
    })
    expect(screen.getByText('None 0')).toBeInTheDocument()
  })

  it('empty string with $length stays live while the list is empty', () => {
    const other = listSignal<{ title: string }>([])
    render(List().items([]).empty(`N ${other.$length}`).build() as any)
    expect(screen.getByText('N 0')).toBeInTheDocument()
    act(() => {
      other.add({ title: 'A' })
    })
    expect(screen.getByText('N 1')).toBeInTheDocument()
  })
})
