import { createElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Text } from '../src/content/Text'
import { listSignal, signal } from '../src'

afterEach(cleanup)

describe('W12-01 Text leftover — host tag / dual type', () => {
  it('.type("h1") renders an h1 (not a swallowed React type stamp)', () => {
    const { container } = render(Text('Hero').type('h1').build())
    const el = container.querySelector('h1.fibo-text-h1')
    expect(el).toBeTruthy()
    expect(el?.textContent).toBe('Hero')
  })

  it('live FineGrain Text(() => …).type("h1") keeps the heading tag', () => {
    const n = signal(1)
    const { container } = render(Text(() => `n=${n.value}`).type('h1').build())
    const el = container.querySelector('h1.fibo-text-h1')
    expect(el?.textContent).toBe('n=1')
    act(() => {
      n.value = 2
    })
    expect(container.querySelector('h1.fibo-text-h1')?.textContent).toBe('n=2')
  })
})

describe('W12-01 Text leftover — bindSignal format', () => {
  it('Text().bindSignal(sig, format) replaces text and stays live', () => {
    const count = signal(0)
    render(Text().bindSignal(count, (v) => `Count: ${v}`).build())
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
    act(() => {
      count.value = 4
    })
    expect(screen.getByText('Count: 4')).toBeInTheDocument()
  })

  it('bindSignal(list, format) reads list.value (not a frozen length)', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Text()
        .bindSignal(todos, (list) => `Total: ${list.length}`)
        .build(),
    )
    expect(screen.getByText('Total: 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Total: 1')).toBeInTheDocument()
  })
})

describe('W12-01 Text leftover — clear nodes / rest clobber', () => {
  it('.text(null) after element children does not leave the old node', () => {
    render(
      Text()
        .text(createElement('strong', null, 'keep'))
        .text(null as never)
        .build(),
    )
    expect(screen.queryByText('keep')).toBeNull()
  })

  it('live Text keeps fibo-text classes when .props({ className }) is set', () => {
    const n = signal(0)
    const { container } = render(
      Text(() => `n=${n.value}`)
        .type('h2')
        .props({ className: 'extra-live', 'data-testid': 'live-h2' })
        .build(),
    )
    const el = screen.getByTestId('live-h2')
    expect(el.tagName).toBe('H2')
    expect(el.className).toMatch(/fibo-text/)
    expect(el.className).toMatch(/fibo-text-h2/)
    expect(el.className).toMatch(/extra-live/)
    expect(el.textContent).toBe('n=0')
    act(() => {
      n.value = 3
    })
    expect(container.querySelector('[data-testid="live-h2"]')?.textContent).toBe('n=3')
  })

  it('static Text .type("h1") is not overwritten by leftover rest type', () => {
    const { container } = render(
      Text('Title')
        .type('h1')
        .props({ 'data-testid': 'static-h1' })
        .build(),
    )
    const el = screen.getByTestId('static-h1')
    expect(el.tagName).toBe('H1')
    expect(el.className).toMatch(/fibo-text-h1/)
    expect(container.querySelector('h1')?.textContent).toBe('Title')
  })
})
