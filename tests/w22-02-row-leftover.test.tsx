import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Row, Text } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-row')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-row')
  return el
}

function classTokens(el: HTMLElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

describe('W22-02 Row leftover — wrap', () => {
  it('.flexWrap("wrap") stamps wrap (not leftover nowrap)', () => {
    render(
      Row()
        .flexWrap('wrap')
        .children([Text('A'), Text('B'), Text('C')])
        .build()
    )
    expect(host().style.flexWrap).toBe('wrap')
    expect(classTokens(host())).toContain('flex-wrap')
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('.flexWrap("wrap") survives .props({ style }) merge', () => {
    render(
      Row()
        .flexWrap('wrap')
        .gap(8)
        .props({ style: { backgroundColor: 'red' }, 'data-testid': 'row-wrap' })
        .children([Text('A'), Text('B')])
        .build()
    )
    const el = screen.getByTestId('row-wrap')
    expect(el.style.flexWrap).toBe('wrap')
    expect(el.style.gap).toBe('8px')
    expect(el.style.backgroundColor).toBe('red')
    expect(el).toHaveTextContent('A')
    expect(el).toHaveTextContent('B')
  })

  it('.flexWrap("wrap-reverse") is wrap-reverse, not leftover wrap', () => {
    render(
      Row()
        .flexWrap('wrap-reverse')
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.flexWrap).toBe('wrap-reverse')
    expect(classTokens(host())).toContain('flex-wrap-reverse')
    expect(classTokens(host())).not.toContain('flex-wrap')
  })
})

describe('W22-02 Row leftover — gap vs spacing', () => {
  it('.gap() after .spacing() wins (last writer)', () => {
    render(
      Row()
        .spacing(8)
        .gap(24)
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.gap).toBe('24px')
  })

  it('.spacing(0) after .gap() still stamps 0px', () => {
    render(
      Row()
        .gap(16)
        .spacing(0)
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.gap).toBe('0px')
  })

  it('.spacing(16) and .gap(16) agree on px (no *4 leftover)', () => {
    const { unmount } = render(
      Row().spacing(16).children([Text('A'), Text('B')]).build()
    )
    expect(host().style.gap).toBe('16px')
    unmount()
    render(Row().gap(16).children([Text('A'), Text('B')]).build())
    expect(host().style.gap).toBe('16px')
  })

  it("numeric string .spacing('8') is 8px like .gap(8), not Tailwind *4", () => {
    render(
      Row()
        .spacing('8')
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.gap).toBe('8px')
  })

  it('.spacing() gap survives .props({ style }) merge', () => {
    render(
      Row()
        .spacing(16)
        .props({ style: { color: 'blue' }, 'data-testid': 'row-gap' })
        .children([Text('A'), Text('B')])
        .build()
    )
    const el = screen.getByTestId('row-gap')
    expect(el.style.gap).toBe('16px')
    expect(el.style.color).toBe('blue')
  })
})

describe('W22-02 Row leftover — reverse', () => {
  it('row-reverse drops leftover flex-row class', () => {
    render(
      Row()
        .style({ flexDirection: 'row-reverse' })
        .children([Text('L'), Text('R')])
        .build()
    )
    expect(host().style.flexDirection).toBe('row-reverse')
    expect(classTokens(host())).toContain('flex-row-reverse')
    expect(classTokens(host())).not.toContain('flex-row')
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('row-reverse survives .props({ style }) merge', () => {
    render(
      Row()
        .style({ flexDirection: 'row-reverse' })
        .props({ style: { color: 'navy' } })
        .children([Text('L'), Text('R')])
        .build()
    )
    expect(host().style.flexDirection).toBe('row-reverse')
    expect(host().style.color).toBe('navy')
  })
})

describe('W22-02 Row leftover — vertical align', () => {
  it('.alignItems("center") is not stuck on leftover items-start', () => {
    render(
      Row()
        .alignItems('center')
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.alignItems).toBe('center')
  })

  it('.crossAxisAlignment() after .alignItems() wins (last writer)', () => {
    render(
      Row()
        .alignItems('center')
        .crossAxisAlignment('end')
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.alignItems).toBe('flex-end')
  })

  it('.alignItems("baseline") after .crossAxisAlignment() is baseline', () => {
    render(
      Row()
        .crossAxisAlignment('center')
        .alignItems('baseline')
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.alignItems).toBe('baseline')
  })

  it('vertical align survives .props({ style }) merge', () => {
    render(
      Row()
        .crossAxisAlignment('center')
        .props({ style: { minHeight: '40px' } })
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.alignItems).toBe('center')
    expect(host().style.minHeight).toBe('40px')
  })
})

describe('W22-02 Row leftover — children dropped', () => {
  it('keeps every child when wrap + gap + reverse are set', () => {
    render(
      Row()
        .flexWrap('wrap')
        .gap(8)
        .style({ flexDirection: 'row-reverse' })
        .crossAxisAlignment('center')
        .children([Text('one'), Text('two'), Text('three')])
        .build()
    )
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getByText('three')).toBeInTheDocument()
    expect(host().querySelectorAll('.fibo-text').length).toBe(3)
  })

  it('.children() after .props({ className }) is not dropped', () => {
    render(
      Row()
        .props({ className: 'extra-row', 'data-testid': 'row-kids' })
        .children([Text('keep-a'), Text('keep-b')])
        .build()
    )
    const el = screen.getByTestId('row-kids')
    expect(el.className).toMatch(/\bfibo-row\b/)
    expect(el).toHaveTextContent('keep-a')
    expect(el).toHaveTextContent('keep-b')
  })

  it('strips leftover dangerouslySetInnerHTML so children still paint', () => {
    const { container } = render(
      Row()
        .children([Text('safe-a'), Text('safe-b')])
        .props({
          dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
        })
        .build()
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('safe-a')).toBeInTheDocument()
    expect(screen.getByText('safe-b')).toBeInTheDocument()
  })

  it('renderToString keeps wrap, gap, reverse, kids', () => {
    const html = renderToString(
      Row()
        .flexWrap('wrap')
        .spacing(12)
        .style({ flexDirection: 'row-reverse' })
        .crossAxisAlignment('center')
        .children([Text('ssr-a'), Text('ssr-b')])
        .build() as ReactElement
    )
    expect(html).toMatch(/flex-wrap:\s*wrap/)
    expect(html).toMatch(/gap:\s*12px/)
    expect(html).toMatch(/flex-direction:\s*row-reverse/)
    expect(html).toMatch(/align-items:\s*center/)
    expect(html).toContain('ssr-a')
    expect(html).toContain('ssr-b')
    expect(html).toMatch(/\bflex-row-reverse\b/)
    expect(html).not.toMatch(/\bflex-row /)
  })
})
