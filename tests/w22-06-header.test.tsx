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

function classTokens(el: HTMLElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

describe('W22-06 Header leftover — sticky(false) unpublishes', () => {
  it('sticky(true).sticky(false) drops position:sticky stamp and --fibo-sticky-offset', () => {
    render(
      Header().sticky(true).height(64).sticky(false).children(Text('nav')).build() as ReactElement,
    )
    const el = host()
    const classes = classTokens(el)
    expect(classes).not.toContain('sticky')
    expect(classes.some((c) => c.includes('position-sticky'))).toBe(false)
    expect(lastStickyOffset()).toBe('0px')
  })

  it('sticky(24).sticky(false) does not keep super.sticky top class', () => {
    render(Header().sticky(24).sticky(false).children('x').build() as ReactElement)
    const classes = classTokens(host())
    expect(classes).not.toContain('sticky')
    expect(classes.some((c) => /fibo-top-/.test(c))).toBe(false)
    expect(lastStickyOffset()).toBe('0px')
  })
})

describe('W22-06 Header leftover — landmark <header>', () => {
  it('is a banner landmark even when nested in <main>', () => {
    render(
      <main>
        {Header().children('AppNav').build() as ReactElement}
      </main>,
    )
    const banner = screen.getByRole('banner')
    expect(banner.tagName).toBe('HEADER')
    expect(banner).toHaveTextContent('AppNav')
  })

  it('honors an explicit role override', () => {
    render(
      Header()
        .props({ role: 'presentation' })
        .children('not-banner')
        .build() as ReactElement,
    )
    expect(screen.queryByRole('banner')).toBeNull()
    expect(host()).toHaveAttribute('role', 'presentation')
  })
})

describe('W22-06 Header leftover — leading/trailing dropped', () => {
  it('.leading() and .trailing() paint instead of becoming CSS/DOM leftovers', () => {
    render(
      Header()
        .leading('Lead')
        .trailing('Trail')
        .children('Body')
        .build() as ReactElement,
    )
    const el = host()
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('Trail')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(el).not.toHaveAttribute('leading')
    expect(el).not.toHaveAttribute('trailing')
    expect(el.className).not.toMatch(/fibo-leading-/)
    expect(el.className).not.toMatch(/fibo-trailing-/)
  })

  it('.props({ leading, trailing }) slots are not dropped onto the host', () => {
    render(
      Header()
        .props({ leading: 'L', trailing: 'R' })
        .children('M')
        .build() as ReactElement,
    )
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(host()).not.toHaveAttribute('leading')
    expect(host()).not.toHaveAttribute('trailing')
  })

  it('leading/trailing interp strings stay live', () => {
    const n = signal(1)
    render(
      Header()
        .leading(`L${interp(n)}`)
        .trailing(`R${interp(n)}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('L1')).toBeInTheDocument()
    expect(screen.getByText('R1')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('L2')).toBeInTheDocument()
    expect(screen.getByText('R2')).toBeInTheDocument()
  })
})

describe('W22-06 Header leftover — title interp', () => {
  it('.title() with $length auto-updates and does not dump PUA marks', () => {
    const todos = listSignal<{ title: string }>([])
    render(Header().title(`Kids ${todos.$length}`).build() as ReactElement)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
    expect(host().textContent).not.toMatch(/\uE000/)
    expect(host()).not.toHaveAttribute('title')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })

  it('.title() with interp() stays live', () => {
    const n = signal(3)
    render(Header().title(`n=${interp(n)}`).build() as ReactElement)
    expect(screen.getByText('n=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('n=4')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
  })

  it('.props({ title }) interp stays live and is not an HTML tooltip leftover', () => {
    const n = signal('Ada')
    render(
      Header()
        .props({ title: `Hi ${interp(n)}` })
        .build() as ReactElement,
    )
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    expect(host()).not.toHaveAttribute('title')
    expect(host().textContent).not.toMatch(/FIBO:/)
    act(() => {
      n.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('W22-06 Header leftover — z-index vs overlay', () => {
  it('non-sticky header does not keep leftover z-10 that would cover overlays', () => {
    render(Header().children('plain').build() as ReactElement)
    const el = host()
    expect(classTokens(el)).not.toContain('z-10')
    const inlineZ = el.style.zIndex
    expect(inlineZ === '' || inlineZ === 'auto').toBe(true)
  })

  it('sticky header stacks above content but below overlay z-40', () => {
    render(Header().sticky().children('bar').build() as ReactElement)
    const el = host()
    const inline = el.style.zIndex
    const fromClass = classTokens(el).includes('z-10')
    const z = inline !== '' ? Number.parseInt(inline, 10) : fromClass ? 10 : Number.NaN
    expect(Number.isFinite(z)).toBe(true)
    expect(z).toBeGreaterThan(0)
    expect(z).toBeLessThan(40)
  })
})

describe('W22-06 Header leftover — locks', () => {
  it('renderToString without window still includes title/leading/trailing', () => {
    const html = renderToString(
      Header().leading('L').title('T').trailing('R').build() as ReactElement,
    )
    expect(html).toMatch(/>L</)
    expect(html).toMatch(/>T</)
    expect(html).toMatch(/>R</)
    expect(html).not.toMatch(/FIBO:/)
  })
})
