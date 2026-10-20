import { type ReactElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  Box,
  Container,
  DashboardLayout,
  Header,
  Scaffold,
  ScrollController,
  ScrollView,
  Sidebar,
  Text,
  VirtualColumn,
  ZStack,
} from '../src'

describe('ScrollView overflow', () => {
  it('can shrink inside a flex parent so overflow actually scrolls', () => {
    const { container } = render(ScrollView().vertical().children([Text('a')]).build())
    const el = container.querySelector('.fibo-scrollview') as HTMLElement
    expect(el).toBeTruthy()
    expect(el.style.minWidth).toBe('0px')
    expect(el.style.minHeight).toBe('0px')
    expect(el.style.overflowY).toBe('auto')
  })

  it('keeps horizontal slides from shrinking so the strip can overflow', () => {
    const { container } = render(
      ScrollView()
        .horizontal()
        .children([Box().width(280).children('one'), Box().width(280).children('two')])
        .build()
    )
    const el = container.querySelector('.fibo-scrollview') as HTMLElement
    expect(el.style.overflowX).toBe('auto')
    const inner = el.querySelector('.fibo-scroll-inner') as HTMLElement
    expect(inner).toBeTruthy()
    expect(inner.style.flex).toMatch(/0 0 auto/)
    expect(inner.style.width).toBe('max-content')
  })

  it('scrollByChild steps the first slide, not the inner wrapper', () => {
    const controller = new ScrollController()
    const { container } = render(
      ScrollView()
        .horizontal()
        .controller(controller)
        .children([
          Box().width(80).children('s1'),
          Box().width(80).children('s2'),
        ])
        .build()
    )
    const scroller = container.querySelector('.fibo-scrollview') as HTMLElement
    const inner = scroller.querySelector('.fibo-scroll-inner') as HTMLElement
    const slide = inner.firstElementChild as HTMLElement
    const scrollBy = vi.fn()
    scroller.scrollBy = scrollBy as typeof scroller.scrollBy
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, get: () => 160 })
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, get: () => 80 })
    slide.getBoundingClientRect = () =>
      ({ width: 80, height: 40, top: 0, left: 0, bottom: 40, right: 80, x: 0, y: 0, toJSON() {} })
    controller.scrollByChild(1)
    expect(scrollBy).toHaveBeenCalled()
    const opts = scrollBy.mock.calls[0][0] as ScrollToOptions
    expect(opts.left).toBe(80)
  })
})

describe('DashboardLayout drawer a11y', () => {
  it('names the hamburger, hides the off-screen drawer, and closes on Escape', () => {
    render(
      DashboardLayout()
        .sidebar(Sidebar().children(Text('Nav item')))
        .header(Header().children(Text('Dash')))
        .children(Text('Body'))
        .build()
    )

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'fibo-dashboard-sidebar')

    const aside = document.getElementById('fibo-dashboard-sidebar')
    expect(aside?.tagName).toBe('ASIDE')
    expect(aside?.getAttribute('aria-label')).toBe('Sidebar')
    expect(aside?.className).toMatch(/invisible/)

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(aside?.className).toMatch(/\bvisible\b/)
    expect(aside?.className).not.toMatch(/invisible/)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('lets the main pane shrink so body content scrolls instead of clipping', () => {
    const { container } = render(
      DashboardLayout().children(Text('Body')).build()
    )
    const main = container.querySelector('main') as HTMLElement
    expect(main.className).toMatch(/min-h-0/)
    const pane = main.querySelector('.fibo-dashboard-body') as HTMLElement
    expect(pane.className).toMatch(/min-h-0/)
    expect(pane.className).toMatch(/overflow-y-auto/)
  })
})

describe('Scaffold overflow and overlay drawer', () => {
  it('gives main a min size of 0 so nested overflow can scroll', () => {
    const { container } = render(
      Scaffold().children(Text('Welcome to the main content area.')).build()
    )
    const main = container.querySelector('main') as HTMLElement
    expect(main.style.minWidth).toBe('0px')
    expect(main.style.minHeight).toBe('0px')
  })

  it('pins mode=over left sidebar to the edge instead of leaving absolute auto insets', () => {
    render(
      Scaffold()
        .sideBarLeft(Text('side-nav'))
        .structure({ sidebarLeft: { mode: 'over', width: 180 } })
        .children(Text('body'))
        .build()
    )
    const nav = screen.getByText('side-nav').parentElement as HTMLElement
    expect(nav.style.position).toBe('absolute')
    expect(nav.style.left).toBe('0px')
    expect(nav.style.top).toBe('0px')
    expect(nav.style.height).toBe('100%')
  })
})

describe('ZStack alignment', () => {
  it('places left/right on the overlay content slot', () => {
    const { container: leftRoot } = render(
      ZStack().alignment('left').children([Text('L'), Text('over')]).build()
    )
    const leftSlot = leftRoot.querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(leftSlot.style.justifyContent).toBe('flex-start')
    expect(leftSlot.style.alignItems).toBe('center')

    const { container: rightRoot } = render(
      ZStack().alignment('right').children([Text('R'), Text('over')]).build()
    )
    const rightSlot = rightRoot.querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(rightSlot.style.justifyContent).toBe('flex-end')
    expect(rightSlot.style.alignItems).toBe('center')
  })
})

describe('Header sticky offset', () => {
  it('does not force Tailwind top-0 over a custom sticky offset', () => {
    const { container } = render(Header().sticky(24).children(Text('App')).build())
    const header = container.querySelector('header') as HTMLElement
    const classes = header.className.split(/\s+/).filter(Boolean)
    expect(classes).toContain('sticky')
    expect(classes).not.toContain('top-0')
  })
})

describe('Container centering', () => {
  it('centers itself horizontally when it has a max width', () => {
    const { container } = render(Container().maxWidth(600).children(Text('boxed')).build())
    const el = container.querySelector('.fibo-container') as HTMLElement
    expect(el.className).toMatch(/mx-auto/)
    expect(el.className).toMatch(/w-full/)
  })
})

describe('VirtualColumn SSR', () => {
  it('does not warn about useLayoutEffect during renderToString', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const html = renderToString(
      VirtualColumn()
        .measureItems(true)
        .children([Text('ssr-row')])
        .build() as ReactElement
    )
    const joined = spy.mock.calls.map((args) => args.map(String).join(' ')).join('\n')
    spy.mockRestore()
    expect(html).toContain('ssr-row')
    expect(joined).not.toMatch(/useLayoutEffect/)
  })

  it('does not crash with an empty child list', () => {
    expect(() =>
      render(VirtualColumn().itemHeight(20).containerHeight(80).children([]).build())
    ).not.toThrow()
  })
})
