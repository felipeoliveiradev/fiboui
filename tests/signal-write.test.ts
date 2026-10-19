import { describe, expect, it } from 'vitest'
import { signal } from '../src/core/state'
import { listSignal } from '../src/core/listSignal'

describe('signal set / change / reset', () => {
  it('set writes and notifies once', () => {
    const count = signal(0)
    const seen: number[] = []
    count.subscribe((v) => seen.push(v))
    count.set(3)
    expect(count.value).toBe(3)
    expect(seen).toEqual([3])
  })

  it('set of the same value does not notify', () => {
    const count = signal(1)
    const seen: number[] = []
    count.subscribe((v) => seen.push(v))
    count.set(1)
    expect(seen).toEqual([])
  })

  it('change writes a value or an updater', () => {
    const count = signal(2)
    count.change(10)
    expect(count.value).toBe(10)
    count.change((n) => n + 1)
    expect(count.value).toBe(11)
  })

  it('reset restores the initial value', () => {
    const count = signal(0)
    count.change((n) => n + 5)
    count.reset()
    expect(count.value).toBe(0)
  })

  it('keeps .value assignment working', () => {
    const count = signal(0)
    count.value = 9
    expect(count.value).toBe(9)
    count.value++
    expect(count.value).toBe(10)
  })

  it('listSignal.update still patches by id', () => {
    const todos = listSignal<{ title: string; done?: boolean }>([{ title: 'Ship' }])
    const id = todos.value[0]._id
    todos.update(id, { done: true })
    expect(todos.find(id)).toEqual({ title: 'Ship', done: true, _id: id })
  })

  it('listSignal.reset restores the initial list', () => {
    const todos = listSignal<{ title: string }>([{ title: 'Ship' }])
    const id = todos.value[0]._id
    todos.add({ title: 'Docs' })
    expect(todos.length).toBe(2)
    todos.reset()
    expect(todos.value.map((t) => t.title)).toEqual(['Ship'])
    expect(todos.value[0]._id).toBe(id)
  })
})
