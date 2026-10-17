import { createRef, type ReactElement } from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, ScrollController, ScrollView } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-scrollview')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-scrollview')
  return el
}

function innerOf(el: HTMLElement = host()): HTMLElement {
  const node = el.querySelector(':scope > .fibo-scroll-inner')
  if (!(node instanceof HTMLElement)) throw new Error('missing .fibo-scroll-inner')
  return node
}

describe('W22-09 ScrollView leftover — controller attach', () => {
  it('detaches on unmount so the handle is not leftover-attached', () => {
    const controller = new ScrollController()
    const { unmount } = render(
      ScrollView().controller(controller).children('pane').build() as ReactElement,
    )
    expect(controller.node).toBe(host())
    unmount()
    expect(controller.node).toBeNull()
  })

  it('merges a user ref with controller.attach', () => {
    const controller = new ScrollController()
    const userRef = createRef<HTMLDivElement>()
    render(
      ScrollView()
        .controller(controller)
        .props({ ref: userRef, 'data-testid': 'sv-ref' })
        .children('ref')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-ref')
    expect(controller.node).toBe(el)
    expect(userRef.current).toBe(el)
  })

  it('.props({ controller }) attaches and does not leak onto the DOM', () => {
    const controller = new ScrollController()
    render(
      ScrollView()
        .props({ controller, 'data-testid': 'sv-ctrl' })
        .children('via-props')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-ctrl')
    expect(el.getAttribute('controller')).toBeNull()
    expect(el.hasAttribute('controller')).toBe(false)
    expect(controller.node).toBe(el)
  })

  it('scrollByChild uses the first slide when querySelector leftover returns null', () => {
    const controller = new ScrollController()
    render(
      ScrollView()
        .horizontal()
        .controller(controller)
        .children([Box().width(80).children('s1'), Box().width(80).children('s2')])
        .build() as ReactElement,
    )
    const scroller = host()
    const slide = innerOf(scroller).firstElementChild as HTMLElement
    const docQ = vi.spyOn(document, 'querySelector')
    scroller.querySelector = (() => null) as typeof scroller.querySelector
    const scrollBy = vi.fn()
    scroller.scrollBy = scrollBy as typeof scroller.scrollBy
    slide.getBoundingClientRect = () =>
      ({
        width: 80,
        height: 40,
        top: 0,
        left: 0,
        bottom: 40,
        right: 80,
        x: 0,
        y: 0,
        toJSON() {},
      }) as DOMRect
    controller.scrollByChild(1)
    expect(docQ).not.toHaveBeenCalled()
    expect(scrollBy).toHaveBeenCalled()
    const opts = scrollBy.mock.calls[0][0] as ScrollToOptions
    expect(opts.left).toBe(80)
    expect(opts.top).toBeUndefined()
    docQ.mockRestore()
  })
})

describe('W22-09 ScrollView leftover — nested overflow', () => {
  it('vertical inner is width-locked so a nested horizontal view can scroll', () => {
    render(
      ScrollView()
        .vertical()
        .props({ 'data-testid': 'sv-outer' })
        .children([
          ScrollView()
            .horizontal()
            .props({ 'data-testid': 'sv-nested' })
            .children([Box().width(400).children('a'), Box().width(400).children('b')]),
        ])
        .build() as ReactElement,
    )
    const outer = screen.getByTestId('sv-outer')
    const nested = screen.getByTestId('sv-nested')
    const strip = innerOf(outer)
    expect(strip.style.maxWidth).toBe('100%')
    expect(strip.style.minWidth).toBe('0px')
    expect(strip.style.width).toBe('100%')
    expect(outer.style.overflowX).toBe('hidden')
    expect(nested.style.overflowX).toBe('auto')
    expect(nested.style.minWidth).toBe('0px')
  })

  it('overflow shorthand leftover does not reset direction longhands', () => {
    render(
      ScrollView()
        .vertical()
        .style({ overflow: 'hidden' })
        .props({ style: { color: 'rgb(1, 2, 3)' }, 'data-testid': 'sv-ov' })
        .children('body')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-ov')
    expect(el.style.overflowY).toBe('auto')
    expect(el.style.overflowX).toBe('hidden')
    expect(el.style.overflow).toBe('')
    expect(el.style.color).toBe('rgb(1, 2, 3)')
  })
})

describe('W22-09 ScrollView leftover — direction horizontal', () => {
  it('.props({ direction: "horizontal" }) scrolls X and does not leak the attr', () => {
    render(
      ScrollView()
        .props({ direction: 'horizontal', 'data-testid': 'sv-dir' })
        .children([Box().width(80).children('h1'), Box().width(80).children('h2')])
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-dir')
    expect(el).not.toHaveAttribute('direction')
    expect(el.style.overflowX).toBe('auto')
    expect(el.style.overflowY).toBe('hidden')
    expect(innerOf(el).style.flexDirection).toBe('row')
    expect(innerOf(el).style.width).toBe('max-content')
  })

  it('direction both is not a leftover horizontal-only row', () => {
    render(
      ScrollView()
        .direction('both')
        .props({ 'data-testid': 'sv-both' })
        .children('xy')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-both')
    expect(el.style.overflowX).toBe('auto')
    expect(el.style.overflowY).toBe('auto')
    expect(innerOf(el).style.flexDirection).toBe('column')
    expect(innerOf(el).style.width).toBe('max-content')
  })

  it('.props({ scrollbar: "hidden" }) stamps hide and does not leak', () => {
    render(
      ScrollView()
        .props({ scrollbar: 'hidden', 'data-testid': 'sv-bar' })
        .children('x')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-bar')
    expect(el).not.toHaveAttribute('scrollbar')
    expect(el.className).toMatch(/\bscrollbar-hide\b/)
    expect(el.style.scrollbarWidth).toBe('none')
  })
})

describe('W22-09 ScrollView leftover — onScroll', () => {
  it('.props({ onScroll }) fires on the overflow host', () => {
    const onScroll = vi.fn()
    render(
      ScrollView()
        .vertical()
        .props({ onScroll, 'data-testid': 'sv-scroll' })
        .children('pane')
        .build() as ReactElement,
    )
    fireEvent.scroll(screen.getByTestId('sv-scroll'), { target: { scrollTop: 24 } })
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('.onScroll(handler) is a scroll listener, not a leftover reveal preset', () => {
    const onScroll = vi.fn()
    render(
      ScrollView()
        .vertical()
        .onScroll(onScroll)
        .props({ 'data-testid': 'sv-onscroll' })
        .children('pane')
        .build() as ReactElement,
    )
    const el = screen.getByTestId('sv-onscroll')
    expect(el.closest('.fibo-reveal')).toBeNull()
    fireEvent.scroll(el, { target: { scrollTop: 12 } })
    expect(onScroll).toHaveBeenCalledTimes(1)
  })
})

describe('W22-09 ScrollView leftover — SSR document guard', () => {
  it('renderToString with controller does not touch document.querySelector', () => {
    const controller = new ScrollController()
    const spy = vi.spyOn(document, 'querySelector')
    let html = ''
    expect(() => {
      html = renderToString(
        ScrollView()
          .horizontal()
          .controller(controller)
          .props({ onScroll: () => undefined, style: { overflow: 'hidden' } })
          .children('ssr-sv')
          .build() as ReactElement,
      )
    }).not.toThrow()
    expect(html).toContain('ssr-sv')
    expect(html).toMatch(/overflow-x:\s*auto/)
    expect(html).not.toMatch(/overflow:\s*hidden/)
    expect(html).not.toContain('controller=')
    expect(controller.node).toBeNull()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('controller methods no-op without document (no throw)', () => {
    const controller = new ScrollController()
    const fake = {
      style: { overflowX: 'auto', overflowY: 'hidden' },
      firstElementChild: {
        classList: { contains: (name: string) => name === 'fibo-scroll-inner' },
        firstElementChild: {
          getBoundingClientRect: () => ({ width: 80, height: 40 }),
          offsetLeft: 80,
          offsetTop: 0,
        },
        children: [{ offsetLeft: 80, offsetTop: 0 }],
      },
      scrollBy: vi.fn(),
      scrollTo: vi.fn(),
    } as unknown as HTMLElement
    controller.attach(fake)
    const original = globalThis.document
    vi.stubGlobal('document', undefined)
    expect(() => {
      controller.scrollBy({ left: 1 })
      controller.scrollTo({ left: 0 })
      controller.scrollByChild(1)
      controller.scrollToChild(0)
    }).not.toThrow()
    vi.stubGlobal('document', original)
    expect(fake.scrollBy).not.toHaveBeenCalled()
    expect(fake.scrollTo).not.toHaveBeenCalled()
  })
})
