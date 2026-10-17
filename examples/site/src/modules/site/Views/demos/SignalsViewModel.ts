import { listSignal, computed, signal } from 'fiboui'

export type Todo = {
  label: string
  done: boolean
}

export type Filter = 'all' | 'active' | 'done'

export const filter = signal<Filter>('all')

export const todos = listSignal<Todo>([
  { label: 'Ship the Stage demos', done: false },
  { label: 'Wire signals to the list', done: true },
  { label: 'Keep the tree fluent', done: false },
])

/** Filtered view. `List.items` subscribes to this, so the row tree is not rebuilt by hand. */
export const visibleTodos = computed(() => {
  const all = todos.value
  if (filter.value === 'active') return todos.filter((item) => !item.done)
  if (filter.value === 'done') return todos.filter((item) => item.done)
  return all
})

export const openCount = computed(() => {
  void todos.value // filter() is a snapshot; .value is the subscribe
  return todos.filter((item) => !item.done).length
})
export const doneCount = computed(() => {
  void todos.value
  return todos.filter((item) => item.done).length
})

export const leftLabel = computed(() => {
  const left = openCount.value
  return left === 1 ? '1 task left' : `${left} tasks left`
})

export const emptyLabel = computed(() =>
  visibleTodos.value.length === 0 ? 'Nothing here.' : '',
)

export function setFilter(next: Filter) {
  filter.value = next
}

export function toggleTodo(id: string) {
  const item = todos.find(id)
  if (!item) return
  todos.update(id, { done: !item.done })
}

export function removeTodo(id: string) {
  todos.remove(id)
}

export function clearDone() {
  todos.set(todos.filter((item) => !item.done))
}
