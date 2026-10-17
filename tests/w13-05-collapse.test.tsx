import { type ReactElement, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Collapse, Text, interp, listSignal, signal } from '../src'

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

describe('W13-05 Collapse panel interp', () => {
  it('.content(`Items ${todos.$length}`) is live and does not dump FIBO marks', () => {
    const { todos, add } = bumpList()
    render(
      Collapse()
        .title('Open')
        .defaultOpen(true)
        .content(`Items ${todos.$length}`)
        .build() as any
    )
    expect(screen.getByText('Items 0')).toBeInTheDocument()
    expect(document.body.textContent || '').not.toMatch(/FIBO:/)
    act(add)
    expect(screen.getByText('Items 1')).toBeInTheDocument()
    expect(document.body.textContent || '').not.toMatch(/FIBO:/)
  })

  it('.children(`Hi ${interp(name)}`) is live', () => {
    const name = signal('Ada')
    render(
      Collapse()
        .title('Open')
        .defaultOpen(true)
        .children(`Hi ${interp(name)}`)
        .build() as any
    )
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('W13-05 Collapse host color reaches title', () => {
  it('string title does not force #1F2937 over host .color()', () => {
    const { container } = render(
      Collapse()
        .title('Paint')
        .color('#00ff00')
        .build()
    )
    const title = screen.getByText('Paint') as HTMLElement
    expect(title.className).not.toMatch(/fibo-color-_1F2937/)
    expect(title.style.color).toBe('inherit')
    expect(title.getAttribute('style') || '').not.toMatch(/#1F2937/i)

    const host = container.firstElementChild as HTMLElement
    expect(host.className).toMatch(/fibo-color-_00ff00/)
  })
})

describe('W13-05 Collapse leftover locks', () => {
  it('.title(Text(...)) does not crash', () => {
    expect(() =>
      render(
        Collapse()
          .title(Text('Built title'))
          .content('body')
          .build()
      )
    ).not.toThrow()
    expect(screen.getByRole('button', { name: 'Built title' })).toBeInTheDocument()
  })

  it('controlled isOpen follows the parent', async () => {
    const user = userEvent.setup()
    function Host() {
      const [open, setOpen] = useState(false)
      return Collapse()
        .title('Ctrl')
        .isOpen(open)
        .onToggle(setOpen)
        .content('secret')
        .build()
    }
    render(<Host />)
    const btn = screen.getByRole('button', { name: 'Ctrl' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('secret')).not.toBeVisible()
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('secret')).toBeVisible()
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(
        Collapse().title('SSR').content(`n ${listSignal([]).$length}`).build() as ReactElement
      )
    ).not.toThrow()
  })
})
