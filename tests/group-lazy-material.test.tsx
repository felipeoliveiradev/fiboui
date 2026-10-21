import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  BottomAppBar,
  Box,
  Column,
  ForEach,
  Group,
  LazyHStack,
  LazyVStack,
  Material,
  Row,
  Text,
  ToolbarItem,
  VirtualColumn,
  VirtualRow,
} from '../src'

afterEach(cleanup)

describe('Group', () => {
  it('renders children without an extra host element', () => {
    const { container } = render(
      Row()
        .children(
          Group().children([Text('A'), Text('B')]),
        )
        .build() as ReactElement,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    const row = container.firstElementChild as HTMLElement
    expect(row.children.length).toBe(2)
  })
})

describe('Row/Column.forEach', () => {
  it('maps items like ForEach', () => {
    render(
      Row()
        .forEach(['x', 'y'], (label) => Text(label))
        .build() as ReactElement,
    )
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
  })

  it('Column.forEach works', () => {
    render(
      Column()
        .forEach([{ id: 1 }, { id: 2 }], (item) => Text(String(item.id)))
        .build() as ReactElement,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

describe('LazyVStack / LazyHStack', () => {
  it('are aliases of VirtualColumn / VirtualRow', () => {
    expect(LazyVStack).toBe(VirtualColumn)
    expect(LazyHStack).toBe(VirtualRow)
  })
})

describe('Material / backdropBlur', () => {
  it('applies blur + translucent background via .material()', () => {
    const { container } = render(
      Box()
        .material(Material.ultraThin)
        .children(Text('glass'))
        .build() as ReactElement,
    )
    const el = container.firstElementChild as HTMLElement
    const style = el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }
    expect(style.backdropFilter || style.webkitBackdropFilter).toMatch(/blur/)
    expect(el.style.backgroundColor || el.style.background).toMatch(/rgba/)
  })

  it('backdropBlur accepts numeric px', () => {
    const { container } = render(
      Box().backdropBlur(24).children(Text('b')).build() as ReactElement,
    )
    const el = container.firstElementChild as HTMLElement
    const style = el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }
    const blur = style.backdropFilter || style.webkitBackdropFilter || ''
    expect(blur).toContain('24')
  })
})

describe('BottomAppBar.floating', () => {
  it('sets data-floating', () => {
    const { container } = render(
      BottomAppBar()
        .floating()
        .resetStyle()
        .material(Material.ultraThin)
        .items([ToolbarItem().principal().children(Text('tabs'))])
        .build() as ReactElement,
    )
    const bar = container.querySelector('.fibo-bottom-app-bar') as HTMLElement
    expect(bar.dataset.floating).toBe('true')
    expect(bar.className).toMatch(/fibo-reset/)
  })
})

describe('ForEach + Group', () => {
  it('Group can wrap ForEach inside Row', () => {
    render(
      Row()
        .children(
          Group().children(
            ForEach(['p', 'q']).renderItem((s) => Text(s)),
          ),
        )
        .build() as ReactElement,
    )
    expect(screen.getByText('p')).toBeInTheDocument()
    expect(screen.getByText('q')).toBeInTheDocument()
  })
})
