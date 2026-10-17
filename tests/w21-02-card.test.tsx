import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Card, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-card')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-card')
  return el
}

describe('W21-02 Card leftover — title/subtitle interp', () => {
  it('.title() is a live alias of .text() with no leftover FIBO marks', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Card()
        .title(`Total ${todos.$length}`)
        .subtitle(`n=${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('Total 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
    expect(host().textContent).not.toMatch(/\uE000/)
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Total 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
    expect(screen.queryByText('Total 0')).toBeNull()
    expect(host().textContent).not.toMatch(/FIBO:/)
  })

  it('.props({ text, subtitle }) interp stays live and does not paint leftover marks', () => {
    const name = signal('Ada')
    render(
      Card()
        .props({
          text: `Hi ${interp(name)}`,
          subtitle: `bye ${interp(name)}`,
        })
        .build() as ReactElement,
    )
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    expect(screen.getByText('bye Ada')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
    expect(screen.getByText('bye Bob')).toBeInTheDocument()
    expect(screen.queryByText('Hi Ada')).toBeNull()
  })
})

describe('W21-02 Card leftover — clickable keyboard / a11y', () => {
  it('.onClick() is a named button: tabindex, Enter and Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(Card().text('Open').onClick(onClick).build())
    const el = screen.getByRole('button', { name: 'Open' })
    expect(el).toBe(host())
    expect(el).toHaveAttribute('tabindex', '0')
    expect(el.className).toMatch(/\bfibo-clickable\b/)
    el.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('locks role=button when clickable even if props try to clobber it', () => {
    render(
      Card()
        .text('Go')
        .onClick(() => undefined)
        .props({ role: 'presentation', 'data-testid': 'card-host' })
        .build(),
    )
    const el = screen.getByTestId('card-host')
    expect(el).toHaveAttribute('role', 'button')
    expect(screen.getByRole('button', { name: 'Go' })).toBe(el)
  })

  it('non-clickable card is not a button and keeps a custom role', () => {
    render(
      Card()
        .text('Static')
        .props({ role: 'group', 'data-testid': 'static-card' })
        .build(),
    )
    const el = screen.getByTestId('static-card')
    expect(el).toHaveAttribute('role', 'group')
    expect(el).not.toHaveAttribute('tabindex')
    expect(el.className).not.toMatch(/\bfibo-clickable\b/)
    expect(screen.queryByRole('button', { name: 'Static' })).toBeNull()
  })
})

describe('W21-02 Card leftover — header / footer dropped', () => {
  it('.header() and .footer() render as <header>/<footer> and are not dropped', () => {
    render(
      Card()
        .header('Head')
        .footer('Foot')
        .children('Body')
        .build(),
    )
    const el = host()
    const header = el.querySelector('header')
    const footer = el.querySelector('footer')
    expect(header).toBeTruthy()
    expect(footer).toBeTruthy()
    expect(header).toHaveTextContent('Head')
    expect(footer).toHaveTextContent('Foot')
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(el.getAttribute('header')).toBeNull()
    expect(el.getAttribute('footer')).toBeNull()
  })

  it('.props({ header, footer }) nodes are painted, not stamped as DOM attrs', () => {
    render(
      Card()
        .props({
          header: Text('PropHead').build(),
          footer: Text('PropFoot').build(),
          'data-testid': 'slots',
        })
        .children('Mid')
        .build(),
    )
    const el = screen.getByTestId('slots')
    expect(screen.getByText('PropHead')).toBeInTheDocument()
    expect(screen.getByText('PropFoot')).toBeInTheDocument()
    expect(screen.getByText('Mid')).toBeInTheDocument()
    expect(el.getAttribute('header')).toBeNull()
    expect(el.getAttribute('footer')).toBeNull()
  })

  it('header/footer interp stays live without leftover marks', () => {
    const n = signal(1)
    render(
      Card()
        .header(`H ${interp(n)}`)
        .footer(`F ${interp(n)}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('H 1')).toBeInTheDocument()
    expect(screen.getByText('F 1')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('H 2')).toBeInTheDocument()
    expect(screen.getByText('F 2')).toBeInTheDocument()
  })
})

describe('W21-02 Card leftover — elevation / shadow(0)', () => {
  it('.shadow(0) is not beaten by hardcoded Tailwind elevation shadow', () => {
    render(Card().text('Flat').shadow(0).build())
    const el = host()
    expect(el.className).not.toMatch(/shadow-\[0_8px_30px/)
    expect(el.className).not.toMatch(/hover:shadow-\[/)
    expect(el.style.boxShadow === '' || el.style.boxShadow === 'none').toBe(true)
  })

  it('unflattened Card still has fibo-card (theme elevation can paint)', () => {
    render(Card().text('Raised').build())
    const el = host()
    expect(el.className).toMatch(/\bfibo-card\b/)
    expect(el.className).not.toMatch(/shadow-\[0_8px_30px/)
  })
})

describe('W21-02 Card leftover — as / article semantics', () => {
  it('default host is <article class="fibo-card">', () => {
    render(Card().text('Semantic').build())
    const el = host()
    expect(el.tagName).toBe('ARTICLE')
    expect(el.className).toMatch(/\bfibo-card\b/)
  })

  it('.as("section") changes the host tag and does not stamp as= on the DOM', () => {
    render(Card().text('Block').as('section').build())
    const el = host()
    expect(el.tagName).toBe('SECTION')
    expect(el.getAttribute('as')).toBeNull()
  })

  it('.props({ as: "aside" }) is honored', () => {
    render(
      Card()
        .text('Side')
        .props({ as: 'aside', 'data-testid': 'as-card' })
        .build(),
    )
    const el = screen.getByTestId('as-card')
    expect(el.tagName).toBe('ASIDE')
    expect(el).toHaveAttribute('class', expect.stringMatching(/\bfibo-card\b/))
    expect(el.getAttribute('as')).toBeNull()
  })

  it('SSR html is an article with fibo-card', () => {
    const html = renderToString(
      Card().text('SSR').children('ssr-card').build() as ReactElement,
    )
    expect(html).toMatch(/<article\b/)
    expect(html).toContain('fibo-card')
    expect(html).toContain('SSR')
    expect(html).toContain('ssr-card')
    expect(html).not.toContain('shadow-[0_8px_30px')
  })
})

describe('W21-02 Card leftover — click still fires', () => {
  it('mouse click still runs onClick', () => {
    const onClick = vi.fn()
    render(Card().text('Tap').onClick(onClick).build())
    fireEvent.click(screen.getByRole('button', { name: 'Tap' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
