import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Text, ZStack } from '../src'

afterEach(cleanup)

function host(root?: HTMLElement): HTMLElement {
  const el = (root ?? document.body).querySelector('.fibo-zstack') as HTMLElement
  expect(el).toBeTruthy()
  return el
}

function tokens(el: HTMLElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

describe('W22-03 ZStack overlay — z-index / containing block', () => {
  it('is a positioned isolated overlay host so abspos children pin to the stack', () => {
    const { container } = render(
      ZStack()
        .children([Text('back'), Text('front')])
        .build()
    )
    const el = host(container)
    expect(tokens(el)).toContain('relative')
    expect(tokens(el)).toContain('isolate')
    expect(tokens(el)).toContain('grid')
    expect(el.className).toMatch(/col-start-1/)
    expect(el.className).toMatch(/row-start-1/)
  })

  it('isolates each overlay layer so z-index:-1 FX cannot punch through later siblings', () => {
    const { container } = render(
      ZStack()
        .children([Text('back'), Text('front')])
        .build()
    )
    expect(host(container).className).toMatch(/\[&>\*\]:isolate/)
  })

  it('later children stay last in the overlay (DOM paint order)', () => {
    render(
      ZStack()
        .children([
          Text('back').props({ 'data-testid': 'zs-back' }),
          Text('front').props({ 'data-testid': 'zs-front' }),
        ])
        .build()
    )
    const el = host()
    const kids = Array.from(el.children) as HTMLElement[]
    expect(kids.length).toBeGreaterThanOrEqual(2)
    expect(kids[0]).toHaveTextContent('back')
    expect(kids[kids.length - 1]).toHaveTextContent('front')
    expect(screen.getByTestId('zs-front').compareDocumentPosition(screen.getByTestId('zs-back'))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    )
  })
})

describe('W22-03 ZStack leftover — children not force-absolute', () => {
  it('does not stamp [&>*]:absolute leftover on stacked children', () => {
    const { container } = render(
      ZStack().children([Text('a'), Text('b')]).build()
    )
    const el = host(container)
    expect(el.className).not.toMatch(/\[&>\*\]:absolute/)
    expect(el.className).not.toMatch(/\[&>\*\]:inset-0/)
    for (const child of Array.from(el.children) as HTMLElement[]) {
      expect(child.style.position).not.toBe('absolute')
      expect(child.className.split(/\s+/)).not.toContain('absolute')
    }
  })

  it('keeps a child that opted into position:absolute (Flutter Positioned leftover)', () => {
    render(
      ZStack()
        .children([
          Box().width('100%').height('100%').children('canvas'),
          Text('NEW').position('absolute').top(8).right(8),
        ])
        .build()
    )
    const badge = screen.getByText('NEW')
    expect(badge.className).toMatch(/fibo-position-absolute/)
    expect(badge.className).toMatch(/fibo-top-8px/)
    expect(badge.className).toMatch(/fibo-right-8px/)
    expect(host().className).toMatch(/\brelative\b/)
  })
})

describe('W22-03 ZStack leftover — fit vs fill', () => {
  it('fills the parent by default like Column/Center', () => {
    const { container } = render(ZStack().children(Text('fill-me')).build())
    const el = host(container)
    expect(tokens(el)).toContain('w-full')
    expect(tokens(el)).toContain('min-w-0')
    expect(tokens(el)).toContain('min-h-0')
    expect(tokens(el)).toContain('self-stretch')
    expect(tokens(el)).not.toContain('w-auto')
  })

  it('hug() shrink-wraps instead of stretching', () => {
    const { container } = render(ZStack().hug().children(Text('chip')).build())
    const el = host(container)
    expect(tokens(el)).toContain('w-auto')
    expect(tokens(el)).toContain('self-auto')
    expect(tokens(el)).not.toContain('w-full')
    expect(tokens(el)).not.toContain('self-stretch')
  })
})

describe('W22-03 ZStack leftover — alignment longhands', () => {
  it('center / corners use items-* + justify-items-* (place-items shorthand fights extra className)', () => {
    const { container: centerRoot } = render(
      ZStack().alignment('center').children([Text('C')]).build()
    )
    const center = host(centerRoot)
    expect(tokens(center)).toContain('items-center')
    expect(tokens(center)).toContain('justify-items-center')
    expect(tokens(center)).not.toContain('place-items-center')

    const { container: tlRoot } = render(
      ZStack().alignment('topLeft').children([Text('TL')]).build()
    )
    const tl = host(tlRoot)
    expect(tokens(tl)).toContain('items-start')
    expect(tokens(tl)).toContain('justify-items-start')
    expect(tokens(tl)).not.toContain('place-items-start')

    const { container: brRoot } = render(
      ZStack().alignment('bottomRight').children([Text('BR')]).build()
    )
    const br = host(brRoot)
    expect(tokens(br)).toContain('items-end')
    expect(tokens(br)).toContain('justify-items-end')
    expect(tokens(br)).not.toContain('place-items-end')
  })

  it('keeps left/right and top/bottom longhands from W14', () => {
    const { container: leftRoot } = render(
      ZStack().alignment('left').children([Text('L')]).build()
    )
    const left = host(leftRoot)
    expect(tokens(left)).toContain('justify-items-start')
    expect(tokens(left)).toContain('items-center')
    expect(tokens(left)).not.toContain('place-items-start')

    const { container: topRoot } = render(
      ZStack().alignment('top').children([Text('T')]).build()
    )
    const top = host(topRoot)
    expect(tokens(top)).toContain('items-start')
    expect(tokens(top)).toContain('justify-items-center')
    expect(tokens(top)).not.toContain('place-items-start')
  })
})

describe('W22-03 ZStack leftover — host class lock', () => {
  it('keeps overlay + fill classes when .props({ className }) is set', () => {
    render(
      ZStack()
        .props({ className: 'extra-zs', 'data-testid': 'zs-host' })
        .children('hello-zs')
        .build()
    )
    const el = screen.getByTestId('zs-host')
    expect(el.className).toMatch(/\bfibo-zstack\b/)
    expect(el.className).toMatch(/\brelative\b/)
    expect(el.className).toMatch(/\bisolate\b/)
    expect(el.className).toMatch(/\bw-full\b/)
    expect(el.className).toMatch(/\bgrid\b/)
    expect(el.className).toMatch(/\bextra-zs\b/)
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(ZStack().children('ssr-zs').build() as ReactElement)
    ).not.toThrow()
    expect(renderToString(ZStack().children('ssr-zs').build() as ReactElement)).toContain(
      'ssr-zs'
    )
    expect(renderToString(ZStack().children('ssr-zs').build() as ReactElement)).toMatch(
      /fibo-zstack/
    )
  })
})
