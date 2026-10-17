import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Card, listSignal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-card')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-card')
  return el
}

describe('W13-02 Card leftover — theme / .bg() not forced white', () => {
  it('does not stamp inline #ffffff that beats theme .fibo-card and .bg()', () => {
    render(Card().text('REVENUE').number('$1').build())
    const bg = host().style.backgroundColor.replace(/\s/g, '').toLowerCase()
    expect(bg).not.toBe('#ffffff')
    expect(bg).not.toBe('#fff')
    expect(bg).not.toBe('rgb(255,255,255)')
    expect(bg).not.toBe('rgba(255,255,255,1)')
  })

  it('.bg() class can paint because host does not lock backgroundColor', () => {
    render(Card().text('USERS').bg('#111111').build())
    const el = host()
    const bg = el.style.backgroundColor.replace(/\s/g, '').toLowerCase()
    expect(bg).not.toBe('#ffffff')
    expect(bg).not.toBe('rgb(255,255,255)')
    expect(el.className).toMatch(/\bfibo-card\b/)
  })
})

describe('W13-02 Card leftover — .color() accent is live', () => {
  it('.color("blue") paints a solid left accent (docs API)', () => {
    render(Card().text('USERS').number('1,234').color('blue').build())
    const el = host()
    expect(el.className).not.toMatch(/\bborder-none\b/)
    expect(el.className.split(/\s+/)).not.toContain('undefined')
    expect(el.style.borderLeftWidth).toBe('4px')
    expect(el.style.borderLeftStyle).toBe('solid')
    expect(el.style.borderLeftColor).toBeTruthy()
  })

  it.each(['green', 'orange', 'red', 'blue', 'purple'] as const)(
    '.color(%s) does not stamp class "undefined"',
    (accent) => {
      const { unmount } = render(Card().text('X').color(accent).build())
      expect(host().className.split(/\s+/)).not.toContain('undefined')
      expect(host().style.borderLeftWidth).toBe('4px')
      unmount()
    },
  )

  it('unknown .color() does not stamp class "undefined"', () => {
    render(Card().text('X').color('yellow' as never).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().style.borderLeftWidth).not.toBe('4px')
  })
})

describe('W13-02 Card leftover — host class lock', () => {
  it('keeps fibo-card when .props({ className }) is set', () => {
    render(
      Card()
        .text('CUSTOM')
        .props({ className: 'extra-card', 'data-testid': 'card-host' })
        .build(),
    )
    const el = screen.getByTestId('card-host')
    expect(el.className).toMatch(/\bfibo-card\b/)
    expect(el.className).toMatch(/\bextra-card\b/)
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Card().text('X').props({ className: undefined as never }).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().className).toMatch(/\bfibo-card\b/)
  })
})

describe('W13-02 Card leftover — interp (W6 regression)', () => {
  it('text, subtitle and number with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Card()
        .text(`Total ${todos.$length}`)
        .subtitle(`n=${todos.$length}`)
        .number(`${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('Total 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Total 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    const html = renderToString(
      Card().text('SSR').children('ssr-card').build() as ReactElement,
    )
    expect(html).toContain('SSR')
    expect(html).toContain('ssr-card')
    expect(html).toContain('fibo-card')
  })
})
