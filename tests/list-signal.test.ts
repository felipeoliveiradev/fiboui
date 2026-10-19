import { describe, expect, it } from 'vitest'
import { listSignal } from '../src/core/listSignal'
import { resolveInterpString } from '../src/core/interpolate'

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
    todos.view('')

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

  it('does not notify on in-place mutation of .value (replace the array)', () => {
    const list = listSignal<{ n: number }>([{ n: 1 }])
    const seen: number[] = []
    list.subscribe((v) => seen.push(v.length))
    list.value.push({ n: 2, _id: 'x' })
    expect(seen).toEqual([])
    list.value = [...list.value]
    expect(seen[seen.length - 1]).toBe(2)
  })

  it('search applies a live view and returns a copy of visible rows', () => {
    const todos = listSignal<Todo>([])
    todos.add({ title: 'Ship' }, { title: 'Docs' })

    const hits = todos.search('ship', ['title'])
    expect(hits.map((t) => t.title)).toEqual(['Ship'])
    expect(hits).not.toBe(todos.value)
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Docs'])

    hits.pop()
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])

    todos.add({ title: 'Shipping' })
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Shipping'])
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Docs', 'Shipping'])
  })

  it('search notifies subscribers so a bound List/Table updates', () => {
    const todos = listSignal<Todo>([{ title: 'Ship' }, { title: 'Docs' }])
    const seen: string[][] = []
    todos.subscribe((v) => seen.push(v.map((t) => t.title)))
    todos.search('doc', ['title'])
    expect(seen[seen.length - 1]).toEqual(['Docs'])
    expect(todos.length).toBe(1)
  })

  it('search("") clears the query like view("")', () => {
    const todos = listSignal<Todo>([{ title: 'Ship' }, { title: 'Docs' }])
    todos.search('ship', ['title'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    const all = todos.search('')
    expect(all.map((t) => t.title)).toEqual(['Ship', 'Docs'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Docs'])
  })

  it('filter is a one-shot snapshot of the full list (safe in computed)', () => {
    const todos = listSignal<Todo>([
      { title: 'Ship', done: false },
      { title: 'Docs', done: true },
      { title: 'Readme', done: false },
    ])

    const hits = todos.filter((item) => !item.done)
    expect(hits.map((t) => t.title)).toEqual(['Ship', 'Readme'])
    expect(hits).not.toBe(todos.value)
    expect(Array.isArray(hits)).toBe(true)
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Docs', 'Readme'])
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Docs', 'Readme'])

    todos.view('s', ['title'])
    expect(todos.filter((item) => !item.done).map((t) => t.title)).toEqual(['Ship', 'Readme'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Docs'])
  })

  it('viewWhere is a live predicate ANDed with view', () => {
    const todos = listSignal<Todo>([
      { title: 'Ship', done: false },
      { title: 'Docs', done: true },
      { title: 'Readme', done: false },
    ])
    todos.viewWhere((item) => !item.done)
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Readme'])
    todos.view('s', ['title'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    todos.add({ title: 'Note', done: false })
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    expect(todos.map((t) => t.title)).toContain('Note')
    todos.viewWhere()
    todos.view('')
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Docs', 'Readme', 'Note'])
  })

  it('todos.set(todos.filter(fn)) replaces the source (clearDone)', () => {
    const todos = listSignal<Todo>([
      { title: 'Ship', done: false },
      { title: 'Docs', done: true },
      { title: 'Readme', done: false },
    ])
    todos.set(todos.filter((item) => !item.done))
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Readme'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Readme'])

    todos.add({ title: 'Later', done: true })
    expect(todos.map((t) => t.title)).toEqual(['Ship', 'Readme', 'Later'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'Readme', 'Later'])
  })

  it('viewWhere notifies subscribers and keeps add/delete/map/$length', () => {
    const todos = listSignal<Todo>([
      { title: 'Ship', done: false },
      { title: 'Docs', done: true },
    ])
    const seen: number[] = []
    todos.subscribe((v) => seen.push(v.length))
    todos.viewWhere((item) => !item.done)
    expect(seen[seen.length - 1]).toBe(1)
    expect(todos.length).toBe(1)
    expect(resolveInterpString(`${todos.$length}`)).toBe('1')

    const id = todos.find((t) => t.title === 'Docs')!._id
    todos.delete(id)
    expect(todos.map((t) => t.title)).toEqual(['Ship'])
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])

    todos.add({ title: 'New', done: false })
    expect(todos.value.map((t) => t.title)).toEqual(['Ship', 'New'])
  })

  it('patches one item without a structure tick', () => {
    const list = listSignal<Todo>([{ title: 'A' }, { title: 'B' }])
    const idA = list.value[0]._id
    const idB = list.value[1]._id
    let structure = 0
    let itemA = 0
    const titles: string[] = []
    list.subscribeStructure(() => { structure += 1 })
    list.subscribeItem(idA, () => { itemA += 1 })
    list.subscribe((rows) => { titles.push(rows[0].title) })
    const version = list.structureVersion()

    list.update(idA, { title: 'A1' })
    expect(itemA).toBe(1)
    expect(list.itemVersion(idB)).toBe(0)
    expect(structure).toBe(0)
    expect(list.structureVersion()).toBe(version)
    expect(titles[titles.length - 1]).toBe('A1')

    list.add({ title: 'C' })
    expect(structure).toBe(1)
    expect(list.structureVersion()).toBe(version + 1)
    expect(itemA).toBe(1)
  })
})
