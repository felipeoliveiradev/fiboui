import { type ReactElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Router, Sidebar, interp, listSignal, signal } from '../src'
import { PluginManager } from '../src/core/plugin/PluginManager'

afterEach(() => {
  cleanup()
  PluginManager.resetForTests()
  window.history.pushState({}, '', '/')
})

function pluginAnchor(name: string): HTMLAnchorElement {
  const el = screen.getByText(name).closest('a')
  expect(el, name).toBeTruthy()
  return el as HTMLAnchorElement
}

function mountSidebar(path: string) {
  window.history.pushState({}, '', path)
  return render(
    <Router
      initialPath={path}
      routes={[
        {
          path: '/',
          component: () => Sidebar().build(),
          children: [
            { path: '/', component: () => <span>home</span>, exact: true },
            { path: '/users', component: () => <span>users</span> },
            { path: '/users/:id', component: () => <span>user</span> },
            { path: '/dash', component: () => <span>dash</span> },
            { path: '/dashboard', component: () => <span>dashboard</span> },
          ],
        },
      ]}
    />,
  )
}

describe('W14-07 Sidebar leftover — plugin href sanitization', () => {
  it('strips javascript: plugin path href (XSS)', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Evil',
      path: 'javascript:alert(1)',
    })
    render(Sidebar().build())
    expect(pluginAnchor('Evil').getAttribute('href') ?? '').not.toMatch(/javascript/i)
  })

  it('strips data: and vbscript: plugin path hrefs', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Data',
      path: 'data:text/html,<script>alert(1)</script>',
    })
    PluginManager.getInstance().registerSidebarItem({
      label: 'Vb',
      path: 'vbscript:msgbox(1)',
    })
    render(Sidebar().build())
    expect(pluginAnchor('Data').getAttribute('href') ?? '').not.toMatch(/data:/i)
    expect(pluginAnchor('Vb').getAttribute('href') ?? '').not.toMatch(/vbscript/i)
  })

  it('strips javascript: with odd casing, whitespace, and BOM', () => {
    const paths = [
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
      '\tjavascript:alert(1)',
      '\uFEFFjavascript:alert(1)',
    ]
    for (const path of paths) {
      PluginManager.resetForTests()
      PluginManager.getInstance().registerSidebarItem({ label: 'Odd', path })
      const { unmount } = render(Sidebar().build())
      expect(pluginAnchor('Odd').getAttribute('href') ?? '', path).not.toMatch(/javascript/i)
      unmount()
    }
  })

  it('does not SPA-navigate javascript: (click is cancelled)', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Evil',
      path: 'javascript:alert(1)',
    })
    mountSidebar('/')
    const pushState = vi.spyOn(window.history, 'pushState')
    expect(fireEvent.click(pluginAnchor('Evil'))).toBe(false)
    expect(pushState).not.toHaveBeenCalled()
    pushState.mockRestore()
  })
})

describe('W14-07 Sidebar leftover — native plugin hrefs', () => {
  it('http(s) and protocol-relative plugin items are real navigation', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Abs',
      path: 'https://example.com/x',
    })
    PluginManager.getInstance().registerSidebarItem({
      label: 'Proto',
      path: '//cdn.example.com/y',
    })
    PluginManager.getInstance().registerSidebarItem({
      label: 'In',
      path: '/settings',
    })
    const pushState = vi.spyOn(window.history, 'pushState')
    render(
      <Router
        routes={[
          {
            path: '/',
            component: () => Sidebar().build(),
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Abs' })).toHaveAttribute('href', 'https://example.com/x')
    expect(screen.getByRole('link', { name: 'Proto' })).toHaveAttribute('href', '//cdn.example.com/y')
    expect(fireEvent.click(screen.getByRole('link', { name: 'Abs' }))).toBe(true)
    expect(fireEvent.click(screen.getByRole('link', { name: 'Proto' }))).toBe(true)
    expect(pushState).not.toHaveBeenCalled()
    expect(fireEvent.click(screen.getByRole('link', { name: 'In' }))).toBe(false)
    expect(pushState).toHaveBeenCalled()
    pushState.mockRestore()
  })

  it('prefixes in-app plugin href with Router basename', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'Dash', path: '/dash' })
    render(
      <Router
        basename="/app"
        routes={[{ path: '/', component: () => Sidebar().build() }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Dash' })).toHaveAttribute('href', '/app/dash')
  })
})

describe('W14-07 Sidebar leftover — nested active path', () => {
  it('prefix-matches /users on /users/1 and does not treat /dash as /dashboard', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'Users', path: '/users' })
    PluginManager.getInstance().registerSidebarItem({ label: 'Dash', path: '/dash' })
    PluginManager.getInstance().registerSidebarItem({ label: 'Home', path: '/' })
    mountSidebar('/users/1')
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dash' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})

describe('W14-07 Sidebar leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Sidebar().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Sidebar().children(`n=${interp(n)}`).id('sb-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('sb-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Sidebar()
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement,
    )
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
  })
})
