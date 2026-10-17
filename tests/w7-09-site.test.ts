import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  doneCount,
  openCount,
  setFilter,
  todos,
  toggleTodo,
  visibleTodos,
} from '../examples/site/src/modules/site/Views/demos/SignalsViewModel'

function resetTodos() {
  todos.set([
    { label: 'Ship the Stage demos', done: false },
    { label: 'Wire signals to the list', done: true },
    { label: 'Keep the tree fluent', done: false },
  ])
  setFilter('all')
}

beforeEach(resetTodos)

describe('SignalsViewModel computed snapshots', () => {
  it('openCount / doneCount update after toggle (filter snapshot must track todos.value)', () => {
    expect(openCount.value).toBe(2)
    expect(doneCount.value).toBe(1)
    const open = todos.value.find((item) => !item.done)
    expect(open).toBeTruthy()
    toggleTodo(open!._id)
    expect(openCount.value).toBe(1)
    expect(doneCount.value).toBe(2)
  })

  it('visibleTodos on active tracks toggle without switching to viewWhere', () => {
    setFilter('active')
    expect(visibleTodos.value.map((item) => item.label)).toEqual([
      'Ship the Stage demos',
      'Keep the tree fluent',
    ])
    const open = todos.value.find((item) => item.label === 'Keep the tree fluent')
    toggleTodo(open!._id)
    expect(visibleTodos.value.map((item) => item.label)).toEqual(['Ship the Stage demos'])
  })

  it('computed filters stay listSignal.filter snapshots, not viewWhere', () => {
    const src = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/demos/SignalsViewModel.ts'),
      'utf8',
    )
    expect(src).toContain('todos.filter((item) => !item.done)')
    expect(src).toContain('todos.filter((item) => item.done)')
    expect(src).not.toContain('viewWhere')
  })
})

describe('site leftover locks', () => {
  it('checkout form fields keep .name()', () => {
    const src = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/shop/CheckoutView.ts'),
      'utf8',
    )
    expect(src).toContain(".name(name)")
    expect(src).toContain(".name('note')")
    expect(src).toContain(".name('ship-method')")
    expect(src).toContain(".name('newsletter')")
    expect(src).toContain("shopField('name'")
    expect(src).toContain("shopField('email'")
    expect(src).toContain("shopField('address'")
  })

  it('suggest innerHTML runs names through escapeHtml', () => {
    const src = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/playground/suggest.ts'),
      'utf8',
    )
    expect(src).toContain('host.innerHTML = rowsHtml')
    expect(src).toContain('data-name="${escapeHtml(name)}"')
    expect(src).toContain('function escapeHtml')
  })

  it('site views do not mint javascript: hrefs', () => {
    const home = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/Home.ts'),
      'utf8',
    )
    const ui = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/ui.ts'),
      'utf8',
    )
    expect(home).not.toMatch(/javascript:/i)
    expect(ui).not.toMatch(/javascript:/i)
    expect(ui).toContain('openExternal(url)')
  })
})
