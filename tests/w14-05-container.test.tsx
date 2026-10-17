import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Container, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('W14-05 Container leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Container().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Container().children(`n=${interp(n)}`).id('ct-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('ct-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Container().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Container().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Container().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Container()
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

describe('W14-05 Container leftover — locks', () => {
  it('centers with w-full mx-auto and applies max-width', () => {
    const { container } = render(
      Container().maxWidth(600).children(Text('boxed')).build()
    )
    const el = container.querySelector('.fibo-container') as HTMLElement
    expect(el.className).toMatch(/mx-auto/)
    expect(el.className).toMatch(/w-full/)
    expect(el.className).toMatch(/fibo-max-width-600px/)
  })

  it('hug drops the full-width centering classes', () => {
    const { container } = render(Container().hug().children('hug-me').build())
    const el = container.querySelector('.fibo-container') as HTMLElement
    expect(el.className).toMatch(/\bw-auto\b/)
    expect(el.className).not.toMatch(/\bw-full\b/)
    expect(el.className).not.toMatch(/\bmx-auto\b/)
  })

  it('forwards role and id (rest-spread lock)', () => {
    render(
      Container()
        .id('ct')
        .props({ role: 'region', 'data-testid': 'ct' })
        .children('hello-ct')
        .build()
    )
    const el = screen.getByTestId('ct')
    expect(el).toHaveAttribute('id', 'ct')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-ct')
    expect(el.className).toMatch(/\bfibo-container\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo').build()
    expect(() => render(Container().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Container().children('ssr-ct').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Container().children('ssr-ct').build() as ReactElement)
    ).toContain('ssr-ct')
  })
})
