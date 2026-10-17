import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Center, Column, Line, Spacer, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(selector: string): HTMLElement {
  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) throw new Error(`missing ${selector}`)
  return el
}

describe('W14-04 Center leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Center().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Center().children(`n=${interp(n)}`).id('ctr-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('ctr-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Center().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Center().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Center().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Center()
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

describe('W14-04 Line leftover — live interp children', () => {
  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Line().children(`n=${interp(n)}`).id('ln-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('ln-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Line().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Line().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Line()
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

describe('W14-04 leftover — host class lock', () => {
  it('keeps fibo-center when .props({ className }) is set', () => {
    render(
      Center()
        .props({ className: 'extra-ctr', 'data-testid': 'ctr-host' })
        .children('hello-ctr')
        .build()
    )
    const el = screen.getByTestId('ctr-host')
    expect(el.className).toMatch(/\bfibo-center\b/)
    expect(el.className).toMatch(/\bitems-center\b/)
    expect(el.className).toMatch(/\bextra-ctr\b/)
    expect(el).toHaveTextContent('hello-ctr')
  })

  it('keeps fibo-line when .props({ className }) is set', () => {
    render(
      Line()
        .props({ className: 'extra-ln', 'data-testid': 'ln-host' })
        .children('hello-ln')
        .build()
    )
    const el = screen.getByTestId('ln-host')
    expect(el.className).toMatch(/\bfibo-line\b/)
    expect(el.className).toMatch(/\bflex-row\b/)
    expect(el.className).toMatch(/\bextra-ln\b/)
    expect(el).toHaveTextContent('hello-ln')
  })

  it('keeps fibo-spacer when .props({ className }) is set', () => {
    render(
      Spacer()
        .props({ className: 'extra-sp', 'data-testid': 'sp-host' })
        .build()
    )
    const el = screen.getByTestId('sp-host')
    expect(el.className).toMatch(/\bfibo-spacer\b/)
    expect(el.className).toMatch(/\bextra-sp\b/)
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Center().children('x').props({ className: undefined as never }).build())
    expect(host('.fibo-center').className.split(/\s+/)).not.toContain('undefined')
    expect(host('.fibo-center').className).toMatch(/\bfibo-center\b/)
  })
})

describe('W14-04 leftover — locks', () => {
  it('Center fills width and shrinks instead of clipping', () => {
    const { container } = render(Center().children(Text('mid')).build())
    const el = container.querySelector('.fibo-center') as HTMLElement
    expect(el.className).toMatch(/w-full/)
    expect(el.className).toMatch(/min-w-0/)
    expect(el.className).toMatch(/min-h-0/)
    expect(el.className).toMatch(/self-stretch/)
  })

  it('empty Line is a horizontal hr with separator role', () => {
    render(Line().build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('HR')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
    expect(el.className).toMatch(/fibo-line/)
    expect(el.className).not.toMatch(/flex-row/)
  })

  it('Line with children is a flex row, not a separator', () => {
    const { container } = render(Line().children([Text('a'), Text('b')]).build())
    expect(screen.queryByRole('separator')).toBeNull()
    const el = container.querySelector('.fibo-line') as HTMLElement
    expect(el.className).toMatch(/flex-row/)
    expect(el.className).toMatch(/min-w-0/)
  })

  it('bare Spacer still grows, is not a flex container, and is presentational', () => {
    const { container } = render(Column().children([Text('A'), Spacer(), Text('B')]).build())
    const el = container.querySelector('.fibo-spacer') as HTMLElement
    expect(el.style.flex).toBe('1 1 0%')
    expect(el.style.display).toBe('')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not throw when Center children is a single element via .props()', () => {
    const el = Text('solo-center').build()
    expect(() => render(Center().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo-center')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Center().children('ssr-ctr').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Center().children('ssr-ctr').build() as ReactElement)
    ).toContain('ssr-ctr')
    expect(
      renderToString(Line().build() as ReactElement)
    ).toContain('separator')
  })
})
