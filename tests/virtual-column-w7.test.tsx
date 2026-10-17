import { createElement, type ReactElement, type ReactNode } from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { Text, VirtualColumn } from '../src'

afterEach(cleanup)

function row(key: string, label: string): ReactElement {
  return createElement('div', { key }, label)
}

function column(children: ReactNode[], extra?: { itemHeight?: number }): ReactElement {
  const builder = VirtualColumn()
    .measureItems(true)
    .estimatedItemHeight(50)
    .overscan(0)
    .containerHeight(10)
    .children(children)
  if (extra?.itemHeight != null) {
    builder.itemHeight(extra.itemHeight)
  }
  return builder.build() as ReactElement
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

async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30))
  })
}

describe('VirtualColumn W7 height cache keys', () => {
  it('measureItems: after swap, cached heights follow child keys not indices', async () => {
    const restore = mockRectsByText()
    try {
      const tall = row('tall', 'tall')
      const short = row('short', 'short')
      const { container, rerender } = render(column([tall, short]))

      // Only the first row is in the window (overscan 0, container 10).
      // tall measures 80; short stays at estimated 50 → spacer 130.
      await waitFor(() => expect(spacerHeight(container)).toBe('130px'))
      await settle()
      expect(spacerHeight(container)).toBe('130px')

      rerender(column([short, tall]))
      await settle()

      // short now leads (20) but tall's 80 must stay on key 'tall', not leak onto index 0.
      // Keyed cache: 20 + 80 = 100. Index cache would drop tall and use 20 + 50 = 70.
      expect(spacerHeight(container)).toBe('100px')

      rerender(column([short]))
      await settle()
      expect(spacerHeight(container)).toBe('20px')
    } finally {
      restore()
    }
  })

  it('fixed itemHeight: reorder does not throw and spacer is count * itemHeight', () => {
    const tall = row('tall', 'tall')
    const short = row('short', 'short')
    const { container, rerender } = render(column([tall, short], { itemHeight: 40 }))
    expect(spacerHeight(container)).toBe('80px')

    expect(() => rerender(column([short, tall], { itemHeight: 40 }))).not.toThrow()
    expect(spacerHeight(container)).toBe('80px')

    expect(() => rerender(column([short], { itemHeight: 40 }))).not.toThrow()
    expect(spacerHeight(container)).toBe('40px')
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(
        VirtualColumn()
          .measureItems(true)
          .children([Text('ssr-row')])
          .build() as ReactElement
      )
    ).not.toThrow()
  })
})
