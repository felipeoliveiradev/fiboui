import { describe, expect, it } from 'vitest'
import { listSignal } from '../src/core/listSignal'

type Todo = { title: string; done?: boolean }

describe('listSignal', () => {
  it('stamps _id on add and matches by _id', () => {
    const todos = listSignal<Todo>([])

    todos.add({ title: 'Ship' }, { title: 'Docs' })
    expect(todos.length).toBe(2)
    expect(todos.value[0]._id).toBeTruthy()
    expect(todos.value[1]._id).toBeTruthy()
    expect(todos.value[0]._id).not.toBe(todos.value[1]._id)

    const id = todos.value[0]._id
    todos.update(id, { done: true })
    expect(todos.find(id)).toEqual({ title: 'Ship', done: true, _id: id })

    todos.update((t) => t.title === 'Docs', (t) => ({ ...t, title: 'README' }))
    expect(todos.search('read', ['title']).map((t) => t.title)).toEqual(['README'])

    todos.remove(id)
    expect(todos.map((t) => t.title)).toEqual(['README'])

    todos.set([{ title: 'Reset' }])
    expect(todos.value[0]._id).toBeTruthy()
    expect(todos.value[0].title).toBe('Reset')

    todos.delete(todos.value[0]._id)
    expect(todos.length).toBe(0)
  })

  it('keeps existing _id and never drops it on update', () => {
    const todos = listSignal<Todo>([{ title: 'A', _id: 'fixed' }])
    expect(todos.value[0]._id).toBe('fixed')
    todos.update('fixed', { title: 'B' })
    expect(todos.value[0]).toEqual({ title: 'B', _id: 'fixed' })
  })

  it('keeps the full list while a view is active', () => {
    const todos = listSignal<Todo>([])
    todos.add({ title: 'Ship' }, { title: 'Docs' })

    todos.view('ship', ['title'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Docs'])

    todos.add({ title: 'Readme' })
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])

    todos.view('')
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Docs', 'Readme'])
  })

  it('notifies subscribers on mutation', () => {
    const list = listSignal<{ n: number }>([{ n: 1 }])
    const seen: number[] = []
    list.subscribe((v) => seen.push(v.length))
    list.add({ n: 2 })
    expect(seen[seen.length - 1]).toBe(2)
  })
})
