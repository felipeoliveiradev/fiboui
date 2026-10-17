import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DashboardLayout,
  Header,
  Sidebar,
  Text,
  interp,
  listSignal,
  signal,
} from '../src'
import * as layoutEntry from '../src/layout-entry'
import * as layoutIndex from '../src/layout'
import {
  StakentBadge,
  StakentButton,
  StakentSidebarItem,
} from '../src/layout/StakentComponents'

afterEach(cleanup)

describe('W14-10 DashboardLayout leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(DashboardLayout().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(
      DashboardLayout().children(`n=${interp(n)}`).id('dl-interp').build() as ReactElement
    )
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('dl-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(DashboardLayout().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(DashboardLayout().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(DashboardLayout().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      DashboardLayout()
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement
    )
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
  })

  it('header and sidebar string slots interp live', () => {
    const title = signal('Dash')
    const nav = signal('Home')
    render(
      DashboardLayout()
        .header(`H=${interp(title)}`)
        .sidebar(`S=${interp(nav)}`)
        .children('Body')
        .build() as ReactElement
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

describe('W14-10 DashboardLayout leftover — host / drawer locks', () => {
  it('keeps fibo-dashboard when .props({ className }) is set', () => {
    render(
      DashboardLayout()
        .props({ className: 'extra-dash', 'data-testid': 'dl-host' })
        .children('hello-dl')
        .build()
    )
    const el = screen.getByTestId('dl-host')
    expect(el.className).toMatch(/\bfibo-dashboard\b/)
    expect(el.className).toMatch(/\bextra-dash\b/)
    expect(el).toHaveTextContent('hello-dl')
  })

  it('forwards role and id (rest-spread lock)', () => {
    render(
      DashboardLayout()
        .id('dl')
        .props({ role: 'region', 'data-testid': 'dl' })
        .children('hello-dl')
        .build()
    )
    const el = screen.getByTestId('dl')
    expect(el).toHaveAttribute('id', 'dl')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-dl')
    expect(el.className).toMatch(/\bfibo-dashboard\b/)
  })

  it('names the hamburger and closes the drawer on Escape', () => {
    render(
      DashboardLayout()
        .sidebar(Sidebar().children(Text('Nav item')))
        .header(Header().children(Text('Dash')))
        .children(Text('Body'))
        .build()
    )
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveAttribute('aria-controls', 'fibo-dashboard-sidebar')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo-dl').build()
    expect(() =>
      render(DashboardLayout().props({ children: el }).build())
    ).not.toThrow()
    expect(screen.getByText('solo-dl')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(DashboardLayout().children('ssr-dl').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(DashboardLayout().children('ssr-dl').build() as ReactElement)
    ).toContain('ssr-dl')
  })
})

describe('W14-10 Stakent helpers leftover', () => {
  it('StakentButton text with interp stays live', () => {
    const n = signal(1)
    render(StakentButton({ text: `Go ${interp(n)}` }))
    expect(screen.getByRole('button', { name: 'Go 1' })).toHaveAttribute('type', 'button')
    act(() => {
      n.value = 2
    })
    expect(screen.getByRole('button', { name: 'Go 2' })).toBeInTheDocument()
  })

  it('StakentBadge text with interp stays live', () => {
    const n = signal(1)
    render(StakentBadge({ text: `n=${interp(n)}` }))
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
  })

  it('active StakentSidebarItem keeps aria-current', () => {
    render(StakentSidebarItem({ label: 'Dashboard', active: true }))
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})

describe('W14-10 layout barrels', () => {
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

  it('layout-entry and folder barrel export public factories, not Stakent', () => {
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
