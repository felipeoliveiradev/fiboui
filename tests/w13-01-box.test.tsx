import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('W13-01 Box leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Box().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Box().children(`n=${interp(n)}`).id('bx-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('bx-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Box().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Box().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Box().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Box()
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement
    )
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
  })
})

describe('W13-01 Box leftover — locks', () => {
  it('forwards role and id (rest-spread lock)', () => {
    render(
      Box()
        .id('bx')
        .props({ role: 'region', 'data-testid': 'bx' })
        .children('hello-box')
        .build()
    )
    const el = screen.getByTestId('bx')
    expect(el).toHaveAttribute('id', 'bx')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-box')
    expect(el.className).toMatch(/\bfibo-box\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo').build()
    expect(() => render(Box().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Box().children('ssr-box').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Box().children('ssr-box').build() as ReactElement)
    ).toContain('ssr-box')
  })
})
