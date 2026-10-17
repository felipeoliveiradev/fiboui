import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Sidebar, Text } from '../src'
import { PluginManager } from '../src/core/plugin/PluginManager'

afterEach(() => {
  cleanup()
  PluginManager.resetForTests()
})

function nav(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Sidebar' })
}

describe('W22-07 Sidebar leftover — landmark / nav', () => {
  it('is a named navigation landmark, not leftover complementary aside', () => {
    render(Sidebar().children(Text('Home')).build() as ReactElement)
    const el = nav()
    expect(el.tagName).toBe('NAV')
    expect(el).toHaveAttribute('aria-label', 'Sidebar')
    expect(el.className).toMatch(/\bfibo-sidebar\b/)
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('keeps the landmark when .props({ className }) adds extras', () => {
    render(
      Sidebar()
        .props({ className: 'extra-sb', 'data-testid': 'sb-host' })
        .children(Text('Home'))
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sb-host')
    expect(el.tagName).toBe('NAV')
    expect(el).toHaveAttribute('aria-label', 'Sidebar')
    expect(el.className).toMatch(/\bfibo-sidebar\b/)
    expect(el.className).toMatch(/\bextra-sb\b/)
    expect(el.className.split(/\s+/)).not.toContain('undefined')
  })
})

describe('W22-07 Sidebar leftover — width', () => {
  it('default rail is 260px, .width() is not leftover 260', () => {
    const { unmount } = render(Sidebar().build() as ReactElement)
    expect(nav().style.width).toBe('260px')
    expect(nav().style.minWidth).toBe('260px')
    unmount()

    render(Sidebar().width(120).build() as ReactElement)
    expect(nav().style.width).toBe('120px')
    expect(nav().style.minWidth).toBe('120px')
  })

  it('.width() and string units stick (not leftover CSS width:auto)', () => {
    render(Sidebar().width('16rem').build() as ReactElement)
    expect(nav().style.width).toBe('16rem')
    expect(nav().style.minWidth).toBe('16rem')
  })

  it('.width() wins over leftover .style({ width }) / .props({ style })', () => {
    render(
      Sidebar()
        .width(200)
        .style({ width: 1, minWidth: 1, backgroundColor: 'rgb(255, 0, 0)' })
        .props({ style: { width: 9, minWidth: 9 } })
        .build() as ReactElement,
    )
    const el = nav()
    expect(el.style.width).toBe('200px')
    expect(el.style.minWidth).toBe('200px')
    expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })
})

describe('W22-07 Sidebar leftover — collapsed', () => {
  it('collapsed rail stays 80px even when style/minWidth leftover 400', () => {
    render(
      Sidebar()
        .width(400)
        .collapsible(true)
        .style({ width: 400, minWidth: 400 })
        .children(Text('Long label that should clip'))
        .build() as ReactElement,
    )
    const el = nav()
    expect(el.style.width).toBe('80px')
    expect(el.style.minWidth).toBe('80px')
    expect(el.style.overflowX).toBe('hidden')
    expect(el.style.flexShrink).toBe('0')
    expect(screen.getByText('Long label that should clip')).toBeInTheDocument()
  })

  it('hides plugin labels when collapsed but keeps an accessible name', () => {
    PluginManager.getInstance().registerSidebarItem({
      label: 'Dash',
      path: '/dash',
      icon: 'i-heroicons-home',
    })
    render(Sidebar().collapsible(true).build() as ReactElement)
    const link = screen.getByRole('link', { name: 'Dash' })
    expect(link).toHaveAttribute('href', '/dash')
    expect(link).toHaveAttribute('aria-label', 'Dash')
    expect(link.textContent ?? '').not.toMatch(/Dash/)
  })

  it('.collapsible(false) is the expanded width, not leftover 80px rail', () => {
    render(Sidebar().width(180).collapsible(false).build() as ReactElement)
    expect(nav().style.width).toBe('180px')
  })
})

describe('W22-07 Sidebar leftover — overlay mobile / focus trap', () => {
  it('is a static rail: no leftover dialog overlay, backdrop, or aria-modal', () => {
    const { container } = render(
      Sidebar().children(Text('Nav item')).build() as ReactElement,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(nav().getAttribute('aria-modal')).toBeNull()
    expect(nav().hasAttribute('inert')).toBe(false)
    expect(container.querySelector('[class*="inset-0"]')).toBeNull()
    expect(container.querySelector('[class*="fixed"]')).toBeNull()
    expect(container.querySelectorAll('.fibo-sidebar')).toHaveLength(1)
  })

  it('does not leftover-trap focus (Tab can leave the rail)', async () => {
    const user = userEvent.setup()
    render(
      <div>
        {Sidebar()
          .children(
            <button type="button" data-testid="in-sb">
              Inside
            </button>,
          )
          .build()}
        <button type="button" data-testid="out-sb">
          Outside
        </button>
      </div>,
    )
    const inside = screen.getByTestId('in-sb')
    const outside = screen.getByTestId('out-sb')
    inside.focus()
    expect(inside).toHaveFocus()
    await user.tab()
    expect(outside).toHaveFocus()
  })
})
