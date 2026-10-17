import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TodoItem } from '../boilerplate/src/modules/todo/Views/components/TodoItem'
import type { Todo } from '../boilerplate/src/modules/todo/Models/Todo'

const ROOT = resolve(__dirname, '..')
const BOILER = resolve(ROOT, 'boilerplate')

function readBoiler(rel: string): string {
  return readFileSync(resolve(BOILER, rel), 'utf8')
}

function todo(partial: Partial<Todo> = {}): Todo {
  return {
    id: '1',
    text: 'Learn FiboUI Architecture',
    isCompleted: false,
    createdAt: new Date('2026-01-01'),
    ...partial,
  }
}

afterEach(cleanup)

describe('W16-10 boilerplate TodoItem a11y + controlled checkbox', () => {
  it('names the checkbox from the todo text', () => {
    render(
      TodoItem({
        todo: todo(),
        onToggle: () => undefined,
      }) as any
    )
    expect(
      screen.getByRole('checkbox', { name: /learn fiboui architecture/i })
    ).toBeInTheDocument()
  })

  it('paints checked from todo.isCompleted on rerender (controlled)', () => {
    const onToggle = () => undefined
    const { rerender } = render(
      TodoItem({ todo: todo({ isCompleted: false }), onToggle }) as any
    )
    const box = screen.getByRole('checkbox', { name: /learn fiboui architecture/i })
    expect(box).not.toBeChecked()

    rerender(TodoItem({ todo: todo({ isCompleted: true }), onToggle }) as any)
    expect(
      screen.getByRole('checkbox', { name: /learn fiboui architecture/i })
    ).toBeChecked()
  })

  it('calls onToggle when the named checkbox is clicked', async () => {
    let n = 0
    render(
      TodoItem({
        todo: todo(),
        onToggle: () => {
          n += 1
        },
      }) as any
    )
    await act(async () => {
      screen.getByRole('checkbox', { name: /learn fiboui architecture/i }).click()
    })
    expect(n).toBe(1)
  })
})

describe('W16-10 boilerplate List empty + performance cleanup', () => {
  it('Todo list paints an empty state via List.empty', () => {
    const page = readBoiler('src/modules/todo/Views/TodoPage.tsx')
    expect(page).toMatch(/List\s*\(/)
    expect(page).toMatch(/\.empty\s*\(/)
  })

  it('Performance page disposes the store interval on unmount', () => {
    const page = readBoiler('src/modules/performance/Views/PerformancePage.tsx')
    expect(page).toMatch(/useEffect/)
    expect(page).toMatch(/\.dispose\s*\(/)
  })

  it('icon-only header buttons expose an accessible name', () => {
    const header = readBoiler('src/modules/performance/Views/components/FloatingHeader.tsx')
    expect(header).toMatch(/aria-label['"]?\s*[:=]\s*['"]Menu['"]/)
    expect(header).toMatch(/aria-label['"]?\s*[:=]\s*['"]Notifications['"]/)
  })
})
