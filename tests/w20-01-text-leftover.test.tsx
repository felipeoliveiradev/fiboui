import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Text } from '../src/content/Text'
import { interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('W20-01 Text leftover — children interp is live', () => {
  it('Text().children(`…${list.$length}`) auto-updates (not frozen PUA marks)', () => {
    const todos = listSignal<{ title: string }>([])
    render(Text().children(`Total: ${todos.$length}`).build())
    expect(screen.getByText('Total: 0')).toBeInTheDocument()
    expect(screen.queryByText(/FIBO:/)).toBeNull()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Total: 1')).toBeInTheDocument()
  })

  it('Text().children(interp(sig)) stays live without a template wrapper', () => {
    const name = signal('Ada')
    render(Text().children(interp(name)).build())
    expect(screen.getByText('Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Grace'
    })
    expect(screen.getByText('Grace')).toBeInTheDocument()
  })
})

describe('W20-01 Text leftover — dangerouslySetInnerHTML XSS', () => {
  it('static Text does not paint HTML from rest.dangerouslySetInnerHTML', () => {
    const { container } = render(
      Text('safe')
        .props({
          dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('safe')
    expect(container.innerHTML.toLowerCase()).not.toContain('onerror')
  })

  it('empty Text does not become an HTML injection hole', () => {
    const { container } = render(
      Text()
        .props({
          dangerouslySetInnerHTML: {
            __html: '<img data-xss="1" src="x" onerror="window.__w2001=1">',
          },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect((window as { __w2001?: number }).__w2001).toBeUndefined()
  })

  it('live FineGrain Text does not paint HTML from rest.dangerouslySetInnerHTML', () => {
    const n = signal(1)
    const { container } = render(
      Text(() => `n=${n.value}`)
        .props({
          dangerouslySetInnerHTML: { __html: '<b data-xss="1">own</b>' },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toBe('n=1')
    act(() => {
      n.value = 2
    })
    expect(container.textContent).toBe('n=2')
    expect(container.querySelector('b')).toBeNull()
  })

  it('a string that looks like HTML is text, not markup', () => {
    const { container } = render(Text('<img data-xss="1" src="x">').build())
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe('<img data-xss="1" src="x">')
  })
})

describe('W20-01 Text leftover — HTML vs CSS .type()', () => {
  it('.type("h1") is a heading (HTML tag + fibo-text-h1 CSS)', () => {
    const { container } = render(Text('Hero').type('h1').build())
    const el = screen.getByRole('heading', { level: 1, name: 'Hero' })
    expect(el.tagName).toBe('H1')
    expect(el.className).toMatch(/fibo-text-h1/)
    expect((el as HTMLElement).style.fontSize).toMatch(/--fibo-text-h1/)
    expect(container.querySelector('h1')?.textContent).toBe('Hero')
  })

  it('.type("block") is CSS display, not a swallowed typography type', () => {
    const { container } = render(Text('Boxy').type('block' as 'body').build())
    const el = container.querySelector('.fibo-text') as HTMLElement
    expect(el).toBeTruthy()
    expect(el.tagName).toBe('P')
    expect(el.className).toMatch(/fibo-text-body/)
    expect(el.style.display).toBe('block')
    expect(el.textContent).toBe('Boxy')
  })

  it('CSS .type("flex") after .type("h2") keeps the heading and sets display', () => {
    render(Text('Keep').type('h2').type('flex' as 'body').build())
    const el = screen.getByRole('heading', { level: 2, name: 'Keep' })
    expect(el.tagName).toBe('H2')
    expect(el.className).toMatch(/fibo-text-h2/)
    expect(el.style.display).toBe('flex')
  })

  it('prototype keys are not treated as tags (constructor / toString)', () => {
    expect(() => render(Text('Nope').type('constructor' as 'body').build())).not.toThrow()
    const { container } = render(Text('Nope').type('constructor' as 'body').build())
    const el = container.querySelector('.fibo-text') as HTMLElement
    expect(el.tagName).toBe('P')
    expect(el.className).toMatch(/fibo-text-body/)
    expect(el.textContent).toBe('Nope')
  })

  it('live FineGrain .type("h1") stays a heading after the signal writes', () => {
    const n = signal(1)
    render(Text(() => `n=${n.value}`).type('h1').build())
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('n=1')
    act(() => {
      n.value = 9
    })
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('n=9')
  })
})

describe('W20-01 Text leftover — selectable / copy', () => {
  it('host is user-select:text so copy works inside clickable ancestors', () => {
    const { container } = render(Text('Copy me').build())
    const el = container.querySelector('.fibo-text') as HTMLElement
    expect(el.style.userSelect).toBe('text')
  })
})

describe('W20-01 Text leftover — SSR', () => {
  it('renderToString does not emit injected markup from dangerouslySetInnerHTML', () => {
    const html = renderToString(
      Text('ssr-safe')
        .props({
          dangerouslySetInnerHTML: { __html: '<script>alert(1)</script>' },
        })
        .build() as ReactElement,
    )
    expect(html.toLowerCase()).not.toContain('<script')
    expect(html).toContain('ssr-safe')
  })

  it('SSR children interp resolves marks', () => {
    const n = signal(3)
    const html = renderToString(
      Text().children(`n=${interp(n)}`).build() as ReactElement,
    )
    expect(html).toContain('n=3')
    expect(html).not.toMatch(/FIBO:/)
  })
})
