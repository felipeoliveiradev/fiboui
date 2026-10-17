import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Row, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-row')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-row')
  return el
}

describe('W14-02 Row leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Row().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Row().children(`n=${interp(n)}`).id('row-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('row-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Row().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Row().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Row().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Row()
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement
    )
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
  })

  it('.items() string with interp stays live', () => {
    const n = signal(5)
    render(Row().items([`i=${interp(n)}` as unknown as ReactElement]).build() as ReactElement)
    expect(screen.getByText('i=5')).toBeInTheDocument()
    act(() => {
      n.value = 6
    })
    expect(screen.getByText('i=6')).toBeInTheDocument()
  })
})

describe('W14-02 Row leftover — spacing 0 is real gap', () => {
  it('.spacing(0) stamps gap 0px (overrides a prior .gap())', () => {
    render(
      Row()
        .gap(16)
        .spacing(0)
        .children([Text('A'), Text('B')])
        .build()
    )
    expect(host().style.gap).toBe('0px')
  })
})

describe('W14-02 Row leftover — locks', () => {
  it('forwards role and id (rest-spread lock)', () => {
    render(
      Row()
        .id('rw')
        .props({ role: 'group', 'data-testid': 'rw' })
        .children('hello-row')
        .build()
    )
    const el = screen.getByTestId('rw')
    expect(el).toHaveAttribute('id', 'rw')
    expect(el).toHaveAttribute('role', 'group')
    expect(el).toHaveTextContent('hello-row')
    expect(el.className).toMatch(/\bfibo-row\b/)
    expect(el.className).toMatch(/\bflex-row\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo').build()
    expect(() => render(Row().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo')).toBeInTheDocument()
  })

  it('keeps hug / stretch classes', () => {
    const { unmount } = render(Row().hug().children('chip').build())
    expect(host().className).toMatch(/w-auto/)
    expect(host().className).not.toMatch(/self-stretch/)
    unmount()
    render(Row().children('full').build())
    expect(host().className).toMatch(/w-full/)
    expect(host().className).toMatch(/self-stretch/)
    expect(host().className).toMatch(/min-w-0/)
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Row().children('ssr-row').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Row().children('ssr-row').build() as ReactElement)
    ).toContain('ssr-row')
  })
})
