import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, ScrollController, ScrollView, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-scrollview')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-scrollview')
  return el
}

function inner(): HTMLElement {
  const el = host().querySelector('.fibo-scroll-inner')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-scroll-inner')
  return el
}

describe('W14-09 ScrollView leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(ScrollView().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(ScrollView().children(`n=${interp(n)}`).id('sv-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('sv-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(ScrollView().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(ScrollView().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(ScrollView().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      ScrollView()
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement
    )
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
    expect(inner().textContent).toContain('p=4')
  })
})

describe('W14-09 ScrollView leftover — host class / overflow lock', () => {
  it('keeps fibo-scrollview when .props({ className }) is set', () => {
    render(
      ScrollView()
        .props({ className: 'extra-sv', 'data-testid': 'sv-host' })
        .children('hello-sv')
        .build()
    )
    const el = screen.getByTestId('sv-host')
    expect(el.className).toMatch(/\bfibo-scrollview\b/)
    expect(el.className).toMatch(/\bextra-sv\b/)
    expect(el).toHaveTextContent('hello-sv')
    expect(el.querySelector('.fibo-scroll-inner')).toBeTruthy()
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(ScrollView().children('x').props({ className: undefined as never }).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().className).toMatch(/\bfibo-scrollview\b/)
  })

  it('keeps overflow when .props({ style }) is set', () => {
    render(
      ScrollView()
        .vertical()
        .props({ style: { color: 'rgb(255, 0, 0)' }, 'data-testid': 'sv-style' })
        .children('body')
        .build()
    )
    const el = screen.getByTestId('sv-style')
    expect(el.style.overflowY).toBe('auto')
    expect(el.style.overflowX).toBe('hidden')
    expect(el.style.minWidth).toBe('0px')
    expect(el.style.minHeight).toBe('0px')
    expect(el.style.color).toBe('rgb(255, 0, 0)')
  })

  it('scrollbar hidden survives extra className', () => {
    render(
      ScrollView()
        .scrollbar('hidden')
        .props({ className: 'extra-sv' })
        .children('x')
        .build()
    )
    expect(host().className).toMatch(/\bfibo-scrollview\b/)
    expect(host().className).toMatch(/\bscrollbar-hide\b/)
    expect(host().className).toMatch(/\bextra-sv\b/)
    expect(host().style.scrollbarWidth).toBe('none')
  })
})

describe('W14-09 ScrollView leftover — controller axis', () => {
  it('scrollByChild on a horizontal view uses left even when it does not currently overflow', () => {
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
    const slide = inner().firstElementChild as HTMLElement
    const scrollBy = vi.fn()
    scroller.scrollBy = scrollBy as typeof scroller.scrollBy
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, get: () => 80 })
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, get: () => 80 })
    slide.getBoundingClientRect = () =>
      ({ width: 80, height: 40, top: 0, left: 0, bottom: 40, right: 80, x: 0, y: 0, toJSON() {} })
    controller.scrollByChild(1)
    expect(scrollBy).toHaveBeenCalled()
    const opts = scrollBy.mock.calls[0][0] as ScrollToOptions
    expect(opts.left).toBe(80)
    expect(opts.top).toBeUndefined()
  })

  it('scrollToChild on a vertical view uses top even when height does not overflow', () => {
    const controller = new ScrollController()
    render(
      ScrollView()
        .vertical()
        .controller(controller)
        .children([
          Box().height(40).children('a'),
          Box().height(40).children('b'),
        ])
        .build()
    )
    const scroller = host()
    const slide = inner().children[1] as HTMLElement
    Object.defineProperty(slide, 'offsetTop', { configurable: true, get: () => 40 })
    Object.defineProperty(slide, 'offsetLeft', { configurable: true, get: () => 0 })
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, get: () => 200 })
    Object.defineProperty(scroller, 'clientWidth', { configurable: true, get: () => 100 })
    const scrollTo = vi.fn()
    scroller.scrollTo = scrollTo as typeof scroller.scrollTo
    controller.scrollToChild(1)
    expect(scrollTo).toHaveBeenCalled()
    const opts = scrollTo.mock.calls[0][0] as ScrollToOptions
    expect(opts.top).toBe(40)
    expect(opts.left).toBeUndefined()
  })
})

describe('W14-09 ScrollView leftover — locks', () => {
  it('forwards role and id (rest-spread lock)', () => {
    render(
      ScrollView()
        .id('sv')
        .props({ role: 'region', 'data-testid': 'sv' })
        .children('hello-sv')
        .build()
    )
    const el = screen.getByTestId('sv')
    expect(el).toHaveAttribute('id', 'sv')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-sv')
    expect(el.className).toMatch(/\bfibo-scrollview\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo-sv').build()
    expect(() => render(ScrollView().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo-sv')).toBeInTheDocument()
    expect(inner().textContent).toContain('solo-sv')
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(ScrollView().children('ssr-sv').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(ScrollView().children('ssr-sv').build() as ReactElement)
    ).toContain('ssr-sv')
  })
})
