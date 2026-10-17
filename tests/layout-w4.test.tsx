import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Center, Column, Line, Row, Sidebar, Spacer, Text } from '../src'
import { PluginManager } from '../src/core/plugin/PluginManager'
import { Router } from '../src'
import {
  StakentButton,
  StakentSidebarItem,
} from '../src/layout/StakentComponents'

afterEach(() => {
  cleanup()
  PluginManager.resetForTests()
})

describe('Column / Row / Center / Line children crash', () => {
  it('does not crash when props.children is a single element', () => {
    expect(() =>
      render(Column().props({ children: Text('solo-col').build() }).build())
    ).not.toThrow()
    expect(screen.getByText('solo-col')).toBeInTheDocument()

    expect(() =>
      render(Row().props({ children: Text('solo-row').build() }).build())
    ).not.toThrow()
    expect(screen.getByText('solo-row')).toBeInTheDocument()

    expect(() =>
      render(Center().props({ children: Text('solo-center').build() }).build())
    ).not.toThrow()
    expect(screen.getByText('solo-center')).toBeInTheDocument()

    expect(() =>
      render(Line().props({ children: Text('solo-line').build() }).build())
    ).not.toThrow()
    expect(screen.getByText('solo-line')).toBeInTheDocument()
  })
})

describe('flex shrink so nested overflow can scroll', () => {
  it('gives Column min-w-0 and min-h-0', () => {
    const { container } = render(Column().children(Text('c')).build())
    const el = container.querySelector('.fibo-column') as HTMLElement
    expect(el.className).toMatch(/min-w-0/)
    expect(el.className).toMatch(/min-h-0/)
  })

  it('gives Row min-w-0 so it can shrink on the main axis', () => {
    const { container } = render(Row().children(Text('r')).build())
    const el = container.querySelector('.fibo-row') as HTMLElement
    expect(el.className).toMatch(/min-w-0/)
  })

  it('makes Center fill width and shrink instead of clipping', () => {
    const { container } = render(Center().children(Text('mid')).build())
    const el = container.querySelector('.fibo-center') as HTMLElement
    expect(el.className).toMatch(/w-full/)
    expect(el.className).toMatch(/min-w-0/)
    expect(el.className).toMatch(/min-h-0/)
  })
})

describe('Line as separator', () => {
  it('empty Line is a horizontal hr with separator role', () => {
    const { container } = render(Line().build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('HR')
    expect(el).toHaveAttribute('role', 'separator')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
    expect(el.className).toMatch(/fibo-line/)
    expect(container.querySelector('.fibo-line')?.className).not.toMatch(/flex-row/)
  })

  it('Line with children is a flex row, not a separator', () => {
    const { container } = render(Line().children([Text('a'), Text('b')]).build())
    expect(screen.queryByRole('separator')).toBeNull()
    const el = container.querySelector('.fibo-line') as HTMLElement
    expect(el.className).toMatch(/flex-row/)
    expect(el.className).toMatch(/min-w-0/)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })
})

describe('Sidebar landmark, collapse, plugins, SSR', () => {
  it('is a named navigation landmark', () => {
    render(Sidebar().children(Text('Home')).build())
    const nav = screen.getByRole('navigation', { name: 'Sidebar' })
    expect(nav.tagName).toBe('NAV')
    expect(nav.className).toMatch(/min-h-0/)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('collapsed rail is 80px and clips overflow', () => {
    render(
      Sidebar()
        .collapsible(true)
        .children(Text('Long label that should clip'))
        .build()
    )
    const nav = screen.getByRole('navigation', { name: 'Sidebar' })
    expect(nav.style.width).toBe('80px')
    expect(nav.style.minWidth).toBe('80px')
    expect(nav.style.overflowX).toBe('hidden')
  })

  it('plugin links do not crash without a Router and keep an accessible name when collapsed', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Dash',
      path: '/dash',
      icon: 'i-heroicons-home',
    })
    expect(() => render(Sidebar().collapsible(true).build())).not.toThrow()
    const link = screen.getByRole('link', { name: 'Dash' })
    expect(link).toHaveAttribute('href', '/dash')
  })

  it('marks the active plugin path with aria-current', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'Dash', path: '/' })
    render(
      <Router
        routes={[
          {
            path: '/',
            component: () => Sidebar().build(),
          },
        ]}
      />
    )
    expect(screen.getByRole('link', { name: 'Dash' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('does not warn about missing keys on plugin items', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'A', path: '/a' })
    PluginManager.getInstance().registerSidebarItem({ label: 'B', path: '/b' })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(Sidebar().build())
    const joined = spy.mock.calls.map((args) => args.map(String).join(' ')).join('\n')
    spy.mockRestore()
    expect(joined).not.toMatch(/unique key|each child/i)
    expect(screen.getByRole('link', { name: 'A' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'B' })).toBeInTheDocument()
  })

  it('SSR does not read window and plugin items do not throw without Router', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'Dash', path: '/dash' })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const html = renderToString(
      Sidebar().children(Text('ssr-side')).build() as ReactElement
    )
    const joined = spy.mock.calls.map((args) => args.map(String).join(' ')).join('\n')
    spy.mockRestore()
    expect(html).toContain('ssr-side')
    expect(html).toContain('Sidebar')
    expect(html).toContain('Dash')
    expect(joined).not.toMatch(/window is not defined|useRouter must be used/)
  })
})

describe('Spacer grow', () => {
  it('bare Spacer still grows, is not a flex container, and is presentational', () => {
    const { container } = render(Column().children([Text('A'), Spacer(), Text('B')]).build())
    const el = container.querySelector('.fibo-spacer') as HTMLElement
    expect(el).toBeTruthy()
    expect(el.style.flex).toBe('1 1 0%')
    expect(el.style.display).toBe('')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Stakent helpers', () => {
  it('StakentButton is a type=button control', () => {
    render(StakentButton({ text: 'Go' }))
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button')
  })

  it('active StakentSidebarItem exposes aria-current', () => {
    render(StakentSidebarItem({ label: 'Dashboard', active: true }))
    expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})
