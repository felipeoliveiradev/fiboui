import { type ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Align, Box, Color, Row, Scaffold, ScrollView, Size, Space, Text } from '../src'

describe('align and size tokens', () => {
  it('align sets both screen axes, with or without the token', () => {
    const { container } = render(
      Row()
        .align(Align.center)
        .children([Text('L')])
        .build() as ReactElement,
    )
    const row = container.querySelector('.fibo-row')
    expect(row?.className).toMatch(/justify-center/)
    expect(row?.className).toMatch(/items-center/)

    const { container: raw } = render(
      Row().align('end').children([Text('R')]).build() as ReactElement,
    )
    const end = raw.querySelector('.fibo-row')
    expect(end?.className).toMatch(/justify-end/)
    expect(end?.className).toMatch(/items-end/)
  })

  it('a passed height stays locked inside the scaffold body', () => {
    const { container } = render(
      Scaffold()
        .children([
          Box().height(700).children(Text('header')),
          ScrollView()
            .horizontal()
            .height(400)
            .scrollbar('hidden')
            .children(Box().width(300).height(400).bg(Color.primary).children(Text('card'))),
        ])
        .build() as ReactElement,
    )

    const header = screen.getByText('header').parentElement as HTMLElement
    expect(header.style.height).toBe('700px')
    expect(header.style.minHeight).toBe('700px')
    expect(header.style.flexShrink).toBe('0')

    const scroller = container.querySelector('.fibo-scrollview') as HTMLElement
    expect(scroller.style.height).toBe('400px')
    expect(scroller.style.minHeight).toBe('400px')
    expect(scroller.style.flexShrink).toBe('0')

    const card = screen.getByText('card').parentElement as HTMLElement
    expect(card.style.width).toBe('300px')
    expect(card.style.minWidth).toBe('300px')
    expect(card.style.flexShrink).toBe('0')
  })

  it('size words and theme space still accept a custom length', () => {
    const { container } = render(
      Box()
        .width(Size.full)
        .height(Space.xl)
        .children(Text('x'))
        .build() as ReactElement,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toMatch(/\bw-full\b/)
    expect(el.style.minWidth).toBe('100%')
    expect(el.style.height).toBe('var(--fibo-space-xl)')
    expect(el.style.minHeight).toBe('var(--fibo-space-xl)')
    expect(el.style.flexShrink).toBe('0')
  })
})
