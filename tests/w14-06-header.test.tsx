import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Header, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('header')
  if (!(el instanceof HTMLElement)) throw new Error('missing header')
  return el
}

function injectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => {
      const el = node as HTMLStyleElement
      const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : ''
      return `${el.textContent ?? ''}\n${rules}`
    })
    .join('\n')
}

function lastStickyOffset(): string | undefined {
  const matches = [...injectedCss().matchAll(/--fibo-sticky-offset:\s*([^;}]+)/g)]
  return matches[matches.length - 1]?.[1]?.trim()
}

describe('W14-06 Header leftover — live interp children', () => {
  it('string children with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Header().children(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Header().children(`n=${interp(n)}`).id('hdr-interp').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('hdr-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('array children with interp stay live', () => {
    const n = signal(1)
    render(Header().children([`Go ${interp(n)}`]).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('factory children with interp stay live', () => {
    const n = signal(1)
    render(Header().children(() => `Go ${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('Go 1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('Go 2')).toBeInTheDocument()
  })

  it('bare interp() child stays live', () => {
    const n = signal(7)
    render(Header().children(interp(n)).build() as ReactElement)
    expect(screen.getByText('7')).toBeInTheDocument()
    act(() => {
      n.value = 8
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live', () => {
    const n = signal(3)
    render(
      Header()
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

describe('W14-06 Header leftover — sticky offset keeps custom top after height()', () => {
  it('Header().sticky(24).height(72) publishes top+height (not height alone)', () => {
    render(Header().sticky(24).height(72).children(Text('nav')).build() as ReactElement)
    expect(lastStickyOffset()).toBe('96px')
    expect(host().className.split(/\s+/)).toContain('sticky')
    expect(host().className.split(/\s+/)).not.toContain('top-0')
  })

  it('Header().sticky().height(72) still publishes the bar height', () => {
    render(Header().sticky().height(72).children(Text('nav')).build() as ReactElement)
    expect(lastStickyOffset()).toBe('72px')
  })

  it('Header().height(80).sticky(24) is order-independent', () => {
    render(Header().height(80).sticky(24).children(Text('nav')).build() as ReactElement)
    expect(lastStickyOffset()).toBe('104px')
  })
})

describe('W14-06 Header leftover — locks', () => {
  it('does not force Tailwind top-0 over a custom sticky offset', () => {
    const { container } = render(Header().sticky(24).children(Text('App')).build())
    const header = container.querySelector('header') as HTMLElement
    const classes = header.className.split(/\s+/).filter(Boolean)
    expect(classes).toContain('sticky')
    expect(classes).not.toContain('top-0')
  })

  it('forwards role and id (rest-spread lock)', () => {
    render(
      Header()
        .id('hdr')
        .props({ role: 'banner', 'data-testid': 'hdr' })
        .children('hello-hdr')
        .build()
    )
    const el = screen.getByTestId('hdr')
    expect(el).toHaveAttribute('id', 'hdr')
    expect(el).toHaveAttribute('role', 'banner')
    expect(el).toHaveTextContent('hello-hdr')
    expect(el.tagName).toBe('HEADER')
  })

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo-hdr').build()
    expect(() => render(Header().props({ children: el }).build())).not.toThrow()
    expect(screen.getByText('solo-hdr')).toBeInTheDocument()
  })

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Header().children('ssr-hdr').build() as ReactElement)
    ).not.toThrow()
    expect(
      renderToString(Header().children('ssr-hdr').build() as ReactElement)
    ).toContain('ssr-hdr')
  })
})
