import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ForEach, Row, Text, listSignal } from '../src'

afterEach(cleanup)

describe('ForEach', () => {
  it('maps items into a Row as flex leaves (Fragment)', () => {
    const tabs = [
      { id: 'home', label: 'Home' },
      { id: 'search', label: 'Search' },
    ]
    const { container } = render(
      Row()
        .gap(4)
        .children(
          ForEach(tabs)
            .keyBy((t) => t.id)
            .renderItem((t) => Text(t.label)),
        ),
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    const row = container.firstElementChild as HTMLElement
    expect(row.children.length).toBe(2)
  })

  it('accepts constructor factory ForEach(data, renderItem)', () => {
    render(
      Row().children(
        ForEach(['a', 'b'], (label) => Text(label)),
      ),
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('reads listSignal .value at build', () => {
    const todos = listSignal([
      { _id: '1', title: 'One' },
      { _id: '2', title: 'Two' },
    ])
    render(
      Row().children(
        ForEach(todos)
          .keyBy((t) => t._id)
          .renderItem((t) => Text(t.title)),
      ),
    )
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
  })

  it('supports items() fluent', () => {
    render(
      ForEach(['x', 'y'] as const).renderItem((s) => Text(s)),
    )
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
  })
})
