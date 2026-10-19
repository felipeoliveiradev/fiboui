import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { Box } from '../src'
import { AspectRatio } from '../src/layout/AspectRatio'
import { Baseline } from '../src/layout/Baseline'
import { Line } from '../src/layout/Line'
import { Overlay } from '../src/layout/Overlay'
import { SafeArea } from '../src/layout/SafeArea'
import { ViewThatFits } from '../src/layout/ViewThatFits'
import { Wrap } from '../src/layout/Wrap'

afterEach(() => {
  cleanup()
})

describe('layout gaps', () => {
  it('renders a vertical Line as a separator', () => {
    render(Line().direction('vertical').build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('aria-orientation', 'vertical')
    expect(el.style.width).toBe('1px')
    expect(el.style.alignSelf).toBe('stretch')
    expect(el.style.height).toBe('100%')
  })

  it('keeps an empty Line horizontal', () => {
    render(Line().build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('HR')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('sets aspect-ratio and a default width', () => {
    const { container } = render(AspectRatio(16 / 9).ratio(2).build())
    const el = container.querySelector('.fibo-aspect-ratio') as HTMLElement
    expect(el.style.aspectRatio).toBe('2')
    expect(el.style.width).toBe('100%')
  })

  it('lets width() replace the default width', () => {
    const { container } = render(AspectRatio(1).width(120).build())
    const el = container.querySelector('.fibo-aspect-ratio') as HTMLElement
    expect(el.style.aspectRatio).toBe('1')
    expect(el.style.width).toBe('120px')
  })

  it('wraps with flex and gap from spacing', () => {
    const { container } = render(
      Wrap().direction('horizontal').spacing(8).runSpacing(12).children(['a', 'b']).build()
    )
    const el = container.querySelector('.fibo-wrap') as HTMLElement
    expect(el.style.display).toBe('flex')
    expect(el.style.flexWrap).toBe('wrap')
    expect(el.style.flexDirection).toBe('row')
    expect(el.style.gap).toBe('8px')
    expect(el.style.rowGap).toBe('12px')
  })

  it('pads the chosen safe-area edges', () => {
    const html = renderToString(SafeArea().edges('top').children(['x']).build())
    expect(html).toContain('env(safe-area-inset-top)')
    expect(html).not.toContain('env(safe-area-inset-bottom)')
  })

  it('pads every edge when edges is all or a list', () => {
    const all = renderToString(SafeArea().edges('all').build())
    expect(all).toContain('env(safe-area-inset-top)')
    expect(all).toContain('env(safe-area-inset-bottom)')
    expect(all).toContain('env(safe-area-inset-left)')
    expect(all).toContain('env(safe-area-inset-right)')

    const list = renderToString(SafeArea().edges(['top', 'left']).build())
    expect(list).toContain('env(safe-area-inset-top)')
    expect(list).toContain('env(safe-area-inset-left)')
    expect(list).not.toContain('env(safe-area-inset-bottom)')
  })

  it('passes reverse flex directions through', () => {
    const { container } = render(Box().flexDirection('row-reverse').build())
    const el = container.querySelector('.fibo-box') as HTMLElement
    expect(el.style.flexDirection).toBe('row-reverse')
  })

  it('aligns children on the baseline', () => {
    const { container } = render(Baseline().children(['a', 'b']).build())
    const el = container.querySelector('.fibo-baseline') as HTMLElement
    expect(el.style.display).toBe('flex')
    expect(el.style.alignItems).toBe('baseline')
  })

  it('stacks the second overlay child', () => {
    const { container } = render(
      Overlay().child('back').overlay('front').alignItems('center').build()
    )
    expect(screen.getByText('back')).toBeInTheDocument()
    const front = container.querySelector('.fibo-overlay-front') as HTMLElement
    expect(front.style.position).toBe('absolute')
    expect(front.style.inset).toBe('0')
    expect(front.style.alignItems).toBe('center')
    expect(front.textContent).toBe('front')
  })

  it('shows the first child that fits the container width', () => {
    const { container } = render(ViewThatFits().children(['wide', 'narrow']).build())
    const shown = container.querySelector('[data-view-that-fits="shown"]')
    expect(shown?.textContent).toBe('wide')
  })

  it('falls back to the last child when nothing fits', () => {
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 10,
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: () => 100,
    })
    try {
      const { container } = render(ViewThatFits().children(['wide', 'narrow']).build())
      const shown = container.querySelector('[data-view-that-fits="shown"]')
      expect(shown?.textContent).toBe('narrow')
    } finally {
      if (client) Object.defineProperty(HTMLElement.prototype, 'clientWidth', client)
      if (scroll) Object.defineProperty(HTMLElement.prototype, 'scrollWidth', scroll)
    }
  })
})
