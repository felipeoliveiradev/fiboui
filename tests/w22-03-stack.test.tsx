import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Image, Text, ZStack } from '../src'

afterEach(cleanup)

function host(root?: HTMLElement): HTMLElement {
  const el = (root ?? document.body).querySelector('.fibo-zstack') as HTMLElement
  expect(el).toBeTruthy()
  return el
}

function layers(root?: HTMLElement): HTMLElement[] {
  return Array.from(host(root).querySelectorAll(':scope > .fibo-zstack-layer')) as HTMLElement[]
}

function tokens(el: HTMLElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

describe('W22-03 ZStack — SwiftUI/Flutter contract', () => {
  it('is a positioned isolated host that clips overlays to the base box', () => {
    const { container } = render(
      ZStack()
        .children([Text('back'), Text('front')])
        .build()
    )
    const el = host(container)
    expect(tokens(el)).toContain('relative')
    expect(tokens(el)).toContain('isolate')
    expect(tokens(el)).toContain('overflow-hidden')
  })

  it('defaults to fit(content): hug the base like SwiftUI ideal size', () => {
    const { container } = render(ZStack().children(Text('chip')).build())
    const el = host(container)
    expect(tokens(el)).toContain('w-auto')
    expect(tokens(el)).toContain('self-auto')
    expect(el.style.height).toBe('fit-content')
  })

  it('fit(expand) fills the parent like StackFit.expand', () => {
    const { container } = render(
      ZStack().fit('expand').children(Text('fill-me')).build()
    )
    const el = host(container)
    expect(tokens(el)).toContain('w-full')
    expect(tokens(el)).toContain('self-stretch')
  })

  it('keeps the first child in-flow (size driver) and later children absolute', () => {
    const { container } = render(
      ZStack()
        .alignment('bottom')
        .children([Text('back'), Text('front')])
        .build()
    )
    const zsLayers = layers(container)
    expect(zsLayers).toHaveLength(2)

    const base = zsLayers[0]
    expect(base.className).toMatch(/fibo-zstack-layer-base/)
    expect(base.style.position).toBe('relative')
    expect(base.style.zIndex).toBe('0')

    const overlay = zsLayers[1]
    expect(overlay.className).toMatch(/fibo-zstack-layer-overlay/)
    expect(overlay.style.position).toBe('absolute')
    expect(['0', '0px']).toContain(overlay.style.inset)
    expect(overlay.style.zIndex).toBe('1')
    expect(overlay.style.overflow).toBe('hidden')

    const slot = overlay.querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(slot).toBeTruthy()
    expect(slot.style.display).toBe('flex')
    expect(slot.style.width).toBe('100%')
    expect(slot.style.height).toBe('100%')
    expect(slot.style.minWidth).toMatch(/^0(px)?$/)
    expect(slot.style.alignItems).toBe('flex-end')
    expect(slot.style.justifyContent).toBe('center')
  })

  it('poster card: long title with width 100% stays inside the Image box', () => {
    const { container } = render(
      ZStack()
        .alignment('bottom')
        .children([
          Image('https://example.com/a.jpg')
            .resetStyle()
            .scaledToFill()
            .frame({ width: 300, height: 400 }),
          Text('THE GODFATHER: PART II')
            .width('100%')
            .backgroundColor('red')
            .letterSpacing('0.12em')
            .padding(12),
        ])
        .build()
    )
    const zsLayers = layers(container)
    expect(zsLayers).toHaveLength(2)
    expect(zsLayers[0].style.position).toBe('relative')
    expect(zsLayers[1].style.position).toBe('absolute')
    const slot = zsLayers[1].querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(slot.style.minWidth).toMatch(/^0(px)?$/)
    expect(container.querySelector('.fibo-image.fibo-reset')).toBeTruthy()
    const title = screen.getByText('THE GODFATHER: PART II')
    expect(title.className).toMatch(/fibo-width-100_/)
    // Percent width locks minWidth to 0 (not 100%) so flex can clamp.
    expect((title as HTMLElement).style.minWidth).toMatch(/^0(px)?$/)
  })

  it('badge without width hugs — overlay slot still fills for alignment', () => {
    const { container } = render(
      ZStack()
        .alignment('topRight')
        .children([
          Box().width(200).height(120).bg('#111'),
          Text('NEW').padding(6).bg('red'),
        ])
        .build()
    )
    const slot = layers(container)[1].querySelector(
      '.fibo-zstack-overlay-content'
    ) as HTMLElement
    expect(slot.style.alignItems).toBe('flex-start')
    expect(slot.style.justifyContent).toBe('flex-end')
    expect(screen.getByText('NEW')).toBeTruthy()
  })

  it('keeps layers when a child uses resetStyle (all: unset)', () => {
    const { container } = render(
      ZStack()
        .children([
          Image('https://example.com/a.jpg')
            .resetStyle()
            .scaledToFill()
            .frame({ width: 300, height: 400 }),
          Text('TITLE').resetStyle().padding(12),
        ])
        .build()
    )
    const zsLayers = layers(container)
    expect(zsLayers).toHaveLength(2)
    for (const layer of zsLayers) {
      expect(layer.className).not.toMatch(/\bfibo-reset\b/)
    }
    expect(container.querySelector('.fibo-image.fibo-reset')).toBeTruthy()
    expect(container.querySelector('.fibo-text.fibo-reset')).toBeTruthy()
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
    const kids = Array.from(host().children) as HTMLElement[]
    expect(kids[0]).toHaveTextContent('back')
    expect(kids[kids.length - 1]).toHaveTextContent('front')
    expect(screen.getByTestId('zs-front').compareDocumentPosition(screen.getByTestId('zs-back'))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    )
  })
})

describe('W22-03 ZStack leftover — Positioned child', () => {
  it('keeps a child that opted into position:absolute', () => {
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
    expect(host().className).toMatch(/\brelative\b/)
  })
})

describe('W22-03 ZStack leftover — host class lock', () => {
  it('keeps host classes when .props({ className }) is set', () => {
    render(
      ZStack()
        .fit('expand')
        .props({ className: 'extra-zs', 'data-testid': 'zs-host' })
        .children('hello-zs')
        .build()
    )
    const el = screen.getByTestId('zs-host')
    expect(el.className).toMatch(/\bfibo-zstack\b/)
    expect(el.className).toMatch(/\brelative\b/)
    expect(el.className).toMatch(/\bisolate\b/)
    expect(el.className).toMatch(/\bw-full\b/)
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
