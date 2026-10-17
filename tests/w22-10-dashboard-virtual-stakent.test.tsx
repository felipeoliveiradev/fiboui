import { createElement, type ReactElement, type ReactNode } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardLayout, Text, VirtualColumn, interp, signal } from '../src'
import * as layoutEntry from '../src/layout-entry'
import * as layoutIndex from '../src/layout'
import { StakentCard } from '../src/layout/StakentComponents'

afterEach(cleanup)

function row(key: string, label: string): ReactElement {
  return createElement('div', { key }, label)
}

function column(children: ReactNode[]): ReactElement {
  return VirtualColumn()
    .measureItems(true)
    .estimatedItemHeight(50)
    .overscan(0)
    .containerHeight(10)
    .children(children)
    .build() as ReactElement
}

function spacerHeight(container: HTMLElement): string {
  const col = container.querySelector('.fibo-virtual-column') as HTMLElement
  const spacer = col?.firstElementChild as HTMLElement
  return spacer?.style.height ?? ''
}

function stubRect(height: number): DOMRect {
  return {
    height,
    width: 100,
    top: 0,
    left: 0,
    bottom: height,
    right: 100,
    x: 0,
    y: 0,
    toJSON() {},
  }
}

function mockRectsByText(): () => void {
  const orig = HTMLElement.prototype.getBoundingClientRect
  HTMLElement.prototype.getBoundingClientRect = function mockRect() {
    const text = this.textContent ?? ''
    if (text === 'tall') return stubRect(80)
    if (text === 'short') return stubRect(20)
    return stubRect(0)
  }
  return () => {
    HTMLElement.prototype.getBoundingClientRect = orig
  }
}

describe('W22-10 DashboardLayout leftover — slots dropped', () => {
  it('.sidebar() after .props({ sidebar }) keeps the fluent slot', () => {
    render(
      DashboardLayout()
        .props({ sidebar: 'from-props' })
        .sidebar(Text('from-method'))
        .children('Body')
        .build() as ReactElement,
    )
    expect(screen.getByText('from-method')).toBeInTheDocument()
    expect(screen.queryByText('from-props')).toBeNull()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('.header() after .props({ header }) keeps the fluent slot', () => {
    render(
      DashboardLayout()
        .props({ header: 'from-props-h' })
        .header(Text('from-method-h'))
        .children('Body')
        .build() as ReactElement,
    )
    expect(screen.getByText('from-method-h')).toBeInTheDocument()
    expect(screen.queryByText('from-props-h')).toBeNull()
  })

  it('.props({ sidebar, header }) interp stays live', () => {
    const title = signal('Dash')
    const nav = signal('Home')
    render(
      DashboardLayout()
        .props({
          header: `H=${interp(title)}`,
          sidebar: `S=${interp(nav)}`,
        })
        .children('Body')
        .build() as ReactElement,
    )
    expect(screen.getByText('H=Dash')).toBeInTheDocument()
    expect(screen.getByText('S=Home')).toBeInTheDocument()
    act(() => {
      title.value = 'App'
      nav.value = 'Settings'
    })
    expect(screen.getByText('H=App')).toBeInTheDocument()
    expect(screen.getByText('S=Settings')).toBeInTheDocument()
  })
})

describe('W22-10 VirtualColumn leftover — host props + key cache', () => {
  it('forwards .id() and .props() onto the scroller host', () => {
    render(
      VirtualColumn()
        .itemHeight(20)
        .containerHeight(80)
        .id('vc-host')
        .props({ className: 'extra-vc', 'data-testid': 'vc-host', role: 'list' })
        .children([Text('alpha')])
        .build() as ReactElement,
    )
    const el = screen.getByTestId('vc-host')
    expect(el.id).toBe('vc-host')
    expect(el).toHaveAttribute('role', 'list')
    expect(el.className).toMatch(/\bfibo-virtual-column\b/)
    expect(el.className).toMatch(/\bextra-vc\b/)
    expect(el).toHaveTextContent('alpha')
  })

  it('drops height cache leftovers when keyed rows leave the list', async () => {
    const restore = mockRectsByText()
    try {
      const tall = row('tall', 'tall')
      const short = row('short', 'short')
      const { container, rerender } = render(column([tall, short]))
      await waitFor(() => expect(spacerHeight(container)).toBe('130px'))

      rerender(column([short]))
      await waitFor(() => expect(spacerHeight(container)).toBe('20px'))
    } finally {
      restore()
    }
  })
})

describe('W22-10 Stakent leftover — StakentCard', () => {
  it('renders children as a React element', () => {
    render(StakentCard({ className: 'stakent-x', children: 'card-body' }))
    expect(screen.getByText('card-body')).toBeInTheDocument()
    const el = screen.getByText('card-body')
    const host = el.closest('div')
    expect(host?.className).toMatch(/stakent-x/)
  })
})

describe('W22-10 layout barrels', () => {
  const factories = [
    'Center',
    'Column',
    'Container',
    'Row',
    'Spacer',
    'Scaffold',
    'Header',
    'Sidebar',
    'DashboardLayout',
    'ZStack',
    'Line',
    'ScrollView',
    'ScrollController',
    'VirtualColumn',
  ] as const

  it('layout-entry and folder barrel export the same public factories', () => {
    for (const name of factories) {
      expect(layoutEntry[name], `layout-entry ${name}`).toBeTypeOf('function')
      expect(layoutIndex[name], `layout/index ${name}`).toBeTypeOf('function')
    }
    expect(layoutEntry).not.toHaveProperty('StakentButton')
    expect(layoutEntry).not.toHaveProperty('StakentCard')
    expect(layoutIndex).not.toHaveProperty('StakentButton')
    expect(layoutIndex).not.toHaveProperty('StakentCard')
  })
})
