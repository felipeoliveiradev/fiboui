import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Column, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-column')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-column')
  return el
}

describe('W14-01 Column leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Column().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Column().children(`n=${interp(n)}`).id('col-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('col-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Column().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Column().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Column().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Column()
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

describe('W14-01 Column leftover — host class lock', () => {
  it('keeps fibo-column when .props({ className }) is set', () => {
    render(
      Column()
        .props({ className: 'extra-col', 'data-testid': 'col-host' })
        .children('hello-col')
        .build()
    )
    const el = screen.getByTestId('col-host')
    expect(el.className).toMatch(/\bfibo-column\b/)
    expect(el.className).toMatch(/\bflex-col\b/)
    expect(el.className).toMatch(/\bextra-col\b/)
    expect(el).toHaveTextContent('hello-col')
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Column().children('x').props({ className: undefined as never }).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().className).toMatch(/\bfibo-column\b/)
  })
})

describe('W14-01 Column leftover — locks', () => {
  it('defaults cross-axis to center and shrinks in flex', () => {
    const { container } = render(Column().children(Text('c')).build())
    const el = container.querySelector('.fibo-column') as HTMLElement
    expect(el.className).toMatch(/items-center/)
    expect(el.className).not.toMatch(/items-stretch/)
    expect(el.className).toMatch(/min-w-0/)
    expect(el.className).toMatch(/min-h-0/)
  })

  it('forwards role and id (rest-spread lock)', () => {
    render(
      Column()
        .id('col')
        .props({ role: 'region', 'data-testid': 'col' })
        .children('hello-col')
        .build()
    )
    const el = screen.getByTestId('col')
    expect(el).toHaveAttribute('id', 'col')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-col')
    expect(el.className).toMatch(/\bfibo-column\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo-col').build()
    expect(() => render(Column().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo-col')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Column().children('ssr-col').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Column().children('ssr-col').build() as ReactElement)
    ).toContain('ssr-col')
  })
})
