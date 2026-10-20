import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Text, ZStack, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function tokens(el: HTMLElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

describe('W14-03 ZStack leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(ZStack().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(ZStack().children(`n=${interp(n)}`).id('zs-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('zs-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(ZStack().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(ZStack().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(ZStack().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      ZStack()
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

describe('W14-03 ZStack leftover — alignment longhands', () => {
  it('places top/bottom on the overlay content slot', () => {
    const { container: topRoot } = render(
      ZStack().alignment('top').children([Text('T'), Text('over')]).build()
    )
    const topSlot = topRoot.querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(topSlot.style.alignItems).toBe('flex-start')
    expect(topSlot.style.justifyContent).toBe('center')

    const { container: bottomRoot } = render(
      ZStack().alignment('bottom').children([Text('B'), Text('over')]).build()
    )
    const bottomSlot = bottomRoot.querySelector('.fibo-zstack-overlay-content') as HTMLElement
    expect(bottomSlot.style.alignItems).toBe('flex-end')
    expect(bottomSlot.style.justifyContent).toBe('center')
  })
})

describe('W14-03 ZStack leftover — host class lock', () => {
  it('keeps fibo-zstack stacking classes when .props({ className }) is set', () => {
    render(
      ZStack()
        .props({ className: 'extra-zs', 'data-testid': 'zs-host' })
        .children('hello-zs')
        .build()
    )
    const el = screen.getByTestId('zs-host')
    expect(el.className).toMatch(/\bfibo-zstack\b/)
    expect(el.className).toMatch(/\brelative\b/)
    expect(el.className).toMatch(/\bextra-zs\b/)
    expect(tokens(el)).toContain('w-auto')
    const layer = el.querySelector(':scope > .fibo-zstack-layer') as HTMLElement
    expect(layer).toBeTruthy()
    expect(layer.className).toMatch(/fibo-zstack-layer-base/)
    expect(el).toHaveTextContent('hello-zs')
  })
})

describe('W14-03 ZStack leftover — locks', () => {
  it('forwards role and id (rest-spread lock)', () => {
    render(
      ZStack()
        .id('zs')
        .props({ role: 'group', 'data-testid': 'zs' })
        .children('hello-zs')
        .build()
    )
    const el = screen.getByTestId('zs')
    expect(el).toHaveAttribute('id', 'zs')
    expect(el).toHaveAttribute('role', 'group')
    expect(el).toHaveTextContent('hello-zs')
    expect(el.className).toMatch(/\bfibo-zstack\b/)
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo-zs').build()
    expect(() => render(ZStack().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo-zs')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(ZStack().children('ssr-zs').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(ZStack().children('ssr-zs').build() as ReactElement)
    ).toContain('ssr-zs')
  })
})
