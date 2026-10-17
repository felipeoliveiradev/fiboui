import { type CSSProperties, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box } from '../src/structure/Box'
import { interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-box')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-box')
  return el
}

function hostStyle(node: unknown): CSSProperties {
  const el = node as { props?: { style?: CSSProperties } }
  return { ...(el.props?.style ?? {}) }
}

describe('W21-01 Box leftover — dangerouslySetInnerHTML XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML when children exist', () => {
    const { container } = render(
      Box()
        .children('safe')
        .props({
          dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('safe')
  })

  it('empty Box is not an HTML injection hole', () => {
    const { container } = render(
      Box()
        .props({
          dangerouslySetInnerHTML: {
            __html: '<img data-xss="1" src="x" onerror="window.__w2101=1">',
          },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect((window as { __w2101?: number }).__w2101).toBeUndefined()
  })
})

describe('W21-01 Box leftover — role when onClick', () => {
  it('.onClick() on a div stamps role=button and is keyboard-reachable', () => {
    const onClick = vi.fn()
    render(
      Box()
        .onClick(onClick)
        .children('tap-me')
        .props({ 'data-testid': 'box-click' })
        .build(),
    )
    const el = screen.getByTestId('box-click')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('role', 'button')
    expect(el.tabIndex).toBe(0)
    fireEvent.click(el)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('.props({ onClick }) also stamps role=button unless role is set', () => {
    const onClick = vi.fn()
    render(
      Box()
        .props({ onClick, 'data-testid': 'box-props-click' })
        .children('go')
        .build(),
    )
    const el = screen.getByTestId('box-props-click')
    expect(el).toHaveAttribute('role', 'button')
    expect(el.tabIndex).toBe(0)
  })

  it('explicit role is kept when onClick is set', () => {
    render(
      Box()
        .onClick(() => undefined)
        .props({ role: 'link', 'data-testid': 'box-link' })
        .children('docs')
        .build(),
    )
    expect(screen.getByTestId('box-link')).toHaveAttribute('role', 'link')
  })

  it('plain Box has no role=button', () => {
    render(Box().children('static').props({ 'data-testid': 'box-static' }).build())
    expect(screen.getByTestId('box-static')).not.toHaveAttribute('role')
  })
})

describe('W21-01 Box leftover — as/tag invalid HTML', () => {
  it('.props({ as: "section" }) renders a section, not as= on a div', () => {
    render(
      Box()
        .props({ as: 'section', 'data-testid': 'box-as' })
        .children('region')
        .build(),
    )
    const el = screen.getByTestId('box-as')
    expect(el.tagName).toBe('SECTION')
    expect(el).not.toHaveAttribute('as')
    expect(el).not.toHaveAttribute('tag')
    expect(el.className).toMatch(/\bfibo-box\b/)
  })

  it('.props({ tag: "article" }) renders an article', () => {
    render(
      Box()
        .props({ tag: 'article', 'data-testid': 'box-tag' })
        .children('post')
        .build(),
    )
    const el = screen.getByTestId('box-tag')
    expect(el.tagName).toBe('ARTICLE')
    expect(el).not.toHaveAttribute('tag')
  })

  it('rejects script/iframe/object as host and does not leak as/tag attrs', () => {
    const { container, unmount } = render(
      Box()
        .props({ as: 'script', 'data-testid': 'box-script' })
        .children('nope')
        .build(),
    )
    const el = screen.getByTestId('box-script')
    expect(el.tagName).toBe('DIV')
    expect(container.querySelector('script')).toBeNull()
    expect(el).not.toHaveAttribute('as')
    unmount()

    render(
      Box()
        .props({ tag: 'iframe', src: 'https://evil.test', 'data-testid': 'box-iframe' })
        .build(),
    )
    const iframeHost = screen.getByTestId('box-iframe')
    expect(iframeHost.tagName).toBe('DIV')
    expect(document.querySelector('iframe')).toBeNull()
    expect(iframeHost).not.toHaveAttribute('tag')
  })

  it('garbage as falls back to div', () => {
    render(
      Box()
        .props({ as: 'not a tag<>', 'data-testid': 'box-junk' })
        .children('x')
        .build(),
    )
    const el = screen.getByTestId('box-junk')
    expect(el.tagName).toBe('DIV')
    expect(el).not.toHaveAttribute('as')
  })
})

describe('W21-01 Box leftover — overflow/padding shorthand vs expandBoxShorthand', () => {
  it('.props({ style }) does not drop earlier paddingHorizontal longhands', () => {
    render(
      Box()
        .style({ paddingHorizontal: 12 } as never)
        .props({ style: { backgroundColor: 'red' }, 'data-testid': 'box-merge' })
        .children('m')
        .build(),
    )
    const el = screen.getByTestId('box-merge')
    expect(el.style.paddingLeft).toBe('12px')
    expect(el.style.paddingRight).toBe('12px')
    expect(el.style.backgroundColor).toBe('red')
    expect(el.style.padding).toBe('')
  })

  it('props.style padding with calc expands around existing axes; no leftover shorthand', () => {
    const style = hostStyle(
      Box()
        .style({ paddingLeft: 12 })
        .props({ style: { padding: '8px calc(50% - 10px)' } })
        .children([])
        .build(),
    )
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingBottom).toBe('8px')
    expect(style.paddingRight).toBe('calc(50% - 10px)')
  })

  it('overflow shorthand does not reset earlier overflowX', () => {
    render(
      Box()
        .style({ overflowX: 'auto', overflow: 'hidden' })
        .props({ 'data-testid': 'box-ov' })
        .children('scroll')
        .build(),
    )
    const el = screen.getByTestId('box-ov')
    expect(el.style.overflowX).toBe('auto')
    expect(el.style.overflowY).toBe('hidden')
    expect(el.style.overflow).toBe('')
  })

  it('props.style overflow two-value expands to overflowX/overflowY', () => {
    render(
      Box()
        .props({
          style: { overflow: 'hidden auto' },
          'data-testid': 'box-ov2',
        })
        .children('x')
        .build(),
    )
    const el = screen.getByTestId('box-ov2')
    expect(el.style.overflowX).toBe('hidden')
    expect(el.style.overflowY).toBe('auto')
    expect(el.style.overflow).toBe('')
  })

  it('SSR does not emit leftover padding: or overflow: shorthand that resets axes', () => {
    const html = renderToString(
      Box()
        .style({ paddingHorizontal: 12 } as never)
        .props({ style: { padding: '8px calc(50% - 10px)', overflow: 'hidden auto' } })
        .children([])
        .build() as ReactElement,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).toMatch(/padding-right:\s*12px/)
    expect(html).not.toMatch(/padding:\s*8px/)
    expect(html).toMatch(/overflow-x:\s*hidden/)
    expect(html).toMatch(/overflow-y:\s*auto/)
    expect(html).not.toMatch(/overflow:\s*hidden auto/)
  })
})

describe('W21-01 Box leftover — children interp still live', () => {
  it('string children with $length stay live after as + onClick', () => {
    const todos = listSignal<{ title: string }>([])
    const onClick = vi.fn()
    render(
      Box()
        .onClick(onClick)
        .props({ as: 'section', 'data-testid': 'box-live' })
        .children(`Kids ${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    expect(screen.getByTestId('box-live').tagName).toBe('SECTION')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
  })

  it('.props({ children: interp }) stays live', () => {
    const n = signal(1)
    render(
      Box()
        .props({ children: `n=${interp(n)}`, 'data-testid': 'box-pinterp' })
        .build() as ReactElement,
    )
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
  })
})
