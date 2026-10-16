import { signal } from 'fiboui/core'

export type Todo = {
  id: string
  label: string
  done: boolean
}

export type Filter = 'all' | 'active' | 'done'

let seq = 3

export const draft = signal('')
export const filter = signal<Filter>('all')
export const todos = signal<Todo[]>([
  { id: '1', label: 'Ship the Stage demos', done: false },
  { id: '2', label: 'Wire signals to the list', done: true },
  { id: '3', label: 'Keep the tree fluent', done: false },
])

export function setDraft(value: string) {
  draft.value = value
}

export function setFilter(next: Filter) {
  filter.value = next
}

export function addTodo() {
  const label = draft.value.trim()
  if (!label) return
  seq += 1
  todos.value = [{ id: String(seq), label, done: false }, ...todos.value]
  draft.value = ''
}

export function toggleTodo(id: string) {
  todos.value = todos.value.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  )
}

export function removeTodo(id: string) {
  todos.value = todos.value.filter((item) => item.id !== id)
}

export function clearDone() {
  todos.value = todos.value.filter((item) => !item.done)
}

export function visibleTodos() {
  if (filter.value === 'active') return todos.value.filter((item) => !item.done)
  if (filter.value === 'done') return todos.value.filter((item) => item.done)
  return todos.value
}

export function remaining() {
  return todos.value.filter((item) => !item.done).length
}

export function doneCount() {
  return todos.value.filter((item) => item.done).length
}
