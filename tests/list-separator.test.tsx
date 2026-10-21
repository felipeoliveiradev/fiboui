import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Divider, Line, List, Row, Separator, Text } from '../src'

afterEach(() => cleanup())

describe('List.separator (Flutter ListView.separated)', () => {
  it('inserts a default Divider between items, not after the last', () => {
    const { container } = render(
      List()
        .items(['A', 'B', 'C'])
        .separator()
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    const seps = container.querySelectorAll('[data-list-separator]')
    expect(seps).toHaveLength(2)
    expect(seps[0].getAttribute('data-list-separator')).toBe('0')
    expect(seps[1].getAttribute('data-list-separator')).toBe('1')
    expect(container.querySelectorAll('[role="separator"]')).toHaveLength(2)
    expect(container.textContent).toContain('A')
    expect(container.textContent).toContain('C')
  })

  it('accepts a fixed custom separator (any widget)', () => {
    const { container } = render(
      List()
        .items(['one', 'two'])
        .separator(Text('·').className('custom-sep'))
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    expect(container.querySelectorAll('[data-list-separator]')).toHaveLength(1)
    expect(container.querySelector('.custom-sep')?.textContent).toBe('·')
  })

  it('accepts Divider / Separator with Flutter-like paint', () => {
    const { container } = render(
      List()
        .items(['x', 'y'])
        .separator(Divider().thickness(2).indent(12).color('#112233'))
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    const hr = container.querySelector('hr.fibo-divider') as HTMLElement
    expect(hr).toBeTruthy()
    expect(hr.style.borderTop).toContain('2px')
    expect(hr.style.borderTop).toContain('rgb(17, 34, 51)')
    expect(hr.style.marginLeft).toBe('12px')
    expect(Separator).toBe(Divider)
  })

  it('separator(fn) builds each gap — index 0 … n-2', () => {
    const seen: number[] = []
    render(
      List()
        .items(['a', 'b', 'c', 'd'])
        .separator((index) => {
          seen.push(index)
          return Text(`sep-${index}`)
        })
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    expect(seen).toEqual([0, 1, 2])
    expect(screen.getByText('sep-0')).toBeTruthy()
    expect(screen.getByText('sep-2')).toBeTruthy()
    expect(screen.queryByText('sep-3')).toBeNull()
  })

  it('can build a composite separator (Row + lines + label)', () => {
    const { container } = render(
      List()
        .items(['left', 'right'])
        .separator(
          Row()
            .gap(8)
            .alignX('center')
            .children([
              Line().flex(1).height(1).bg('#ccc'),
              Text('OR'),
              Line().flex(1).height(1).bg('#ccc'),
            ]),
        )
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    expect(container.textContent).toContain('OR')
    expect(container.querySelectorAll('[data-list-separator]')).toHaveLength(1)
  })

  it('separator(false) paints nothing between rows', () => {
    const { container } = render(
      List()
        .items(['A', 'B'])
        .separator(false)
        .renderItem((item) => Text(item))
        .build() as ReactElement,
    )
    expect(container.querySelectorAll('[data-list-separator]')).toHaveLength(0)
  })
})
