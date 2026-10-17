import { type CSSProperties, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Container } from '../src/layout/Container'
import { interp, listSignal, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-container')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-container')
  return el
}

function hostStyle(node: unknown): CSSProperties {
  const el = node as { props?: { style?: CSSProperties } }
  return { ...(el.props?.style ?? {}) }
}

describe('W22-05 Container leftover — dangerouslySetInnerHTML XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML when children exist', () => {
    expect(() =>
      render(
        Container()
          .children('safe')
          .props({
            dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
          })
          .build(),
      ),
    ).not.toThrow()
    expect(document.querySelector('[data-xss]')).toBeNull()
    expect(document.querySelector('img')).toBeNull()
    expect(host().textContent).toContain('safe')
  })

  it('empty Container is not an HTML injection hole', () => {
    const { container } = render(
      Container()
        .props({
          dangerouslySetInnerHTML: {
            __html: '<img data-xss="1" src="x" onerror="window.__w2205=1">',
          },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect((window as { __w2205?: number }).__w2205).toBeUndefined()
  })
})

describe('W22-05 Container leftover — as/tag host', () => {
  it('.props({ as: "main" }) renders main, not as= on a div', () => {
    render(
      Container()
        .props({ as: 'main', 'data-testid': 'ct-as' })
        .children('region')
        .build(),
    )
    const el = screen.getByTestId('ct-as')
    expect(el.tagName).toBe('MAIN')
    expect(el).not.toHaveAttribute('as')
    expect(el).not.toHaveAttribute('tag')
    expect(el.className).toMatch(/\bfibo-container\b/)
  })

  it('.props({ tag: "section" }) renders a section', () => {
    render(
      Container()
        .props({ tag: 'section', 'data-testid': 'ct-tag' })
        .children('block')
        .build(),
    )
    const el = screen.getByTestId('ct-tag')
    expect(el.tagName).toBe('SECTION')
    expect(el).not.toHaveAttribute('tag')
  })

  it('rejects script/iframe as host and does not leak as/tag attrs', () => {
    const { container, unmount } = render(
      Container()
        .props({ as: 'script', 'data-testid': 'ct-script' })
        .children('nope')
        .build(),
    )
    const el = screen.getByTestId('ct-script')
    expect(el.tagName).toBe('DIV')
    expect(container.querySelector('script')).toBeNull()
    expect(el).not.toHaveAttribute('as')
    unmount()

    render(
      Container()
        .props({ tag: 'iframe', src: 'https://evil.test', 'data-testid': 'ct-iframe' })
        .build(),
    )
    const iframeHost = screen.getByTestId('ct-iframe')
    expect(iframeHost.tagName).toBe('DIV')
    expect(document.querySelector('iframe')).toBeNull()
    expect(iframeHost).not.toHaveAttribute('tag')
  })

  it('garbage as falls back to div', () => {
    render(
      Container()
        .props({ as: 'not a tag<>', 'data-testid': 'ct-junk' })
        .children('x')
        .build(),
    )
    const el = screen.getByTestId('ct-junk')
    expect(el.tagName).toBe('DIV')
    expect(el).not.toHaveAttribute('as')
  })
})

describe('W22-05 Container leftover — maxWidth', () => {
  it('.maxWidth(600) keeps the StyleManager class and does not leak a DOM attribute', () => {
    render(
      Container().maxWidth(600).children('boxed').props({ 'data-testid': 'ct-mw' }).build(),
    )
    const el = screen.getByTestId('ct-mw')
    expect(el.className).toMatch(/fibo-max-width-600px/)
    expect(el).not.toHaveAttribute('maxWidth')
    expect(el).not.toHaveAttribute('max-width')
  })

  it('.props({ maxWidth }) applies CSS and does not leak a DOM attribute', () => {
    render(
      Container()
        .props({ maxWidth: 720, 'data-testid': 'ct-prop-mw' })
        .children('via-props')
        .build(),
    )
    const el = screen.getByTestId('ct-prop-mw')
    expect(el.style.maxWidth).toBe('720px')
    expect(el).not.toHaveAttribute('maxWidth')
    expect(el).not.toHaveAttribute('max-width')
  })

  it('.props({ style }) does not drop earlier fluent maxWidth class', () => {
    render(
      Container()
        .maxWidth(600)
        .props({ style: { backgroundColor: 'red' }, 'data-testid': 'ct-mw-merge' })
        .children('m')
        .build(),
    )
    const el = screen.getByTestId('ct-mw-merge')
    expect(el.className).toMatch(/fibo-max-width-600px/)
    expect(el.style.backgroundColor).toBe('red')
    expect(el).not.toHaveAttribute('maxWidth')
  })

  it('fluent maxWidth wins over leftover props.maxWidth', () => {
    render(
      Container()
        .maxWidth(480)
        .props({ maxWidth: 999, 'data-testid': 'ct-mw-win' })
        .children('win')
        .build(),
    )
    const el = screen.getByTestId('ct-mw-win')
    expect(el.className).toMatch(/fibo-max-width-480px/)
    expect(el).not.toHaveAttribute('maxWidth')
    expect(el.style.maxWidth).not.toBe('999px')
  })
})

describe('W22-05 Container leftover — center (Tailwind mx-auto does not paint)', () => {
  it('centers with real margin auto + width 100%, not only leftover classes', () => {
    render(
      Container().maxWidth(600).children('boxed').props({ 'data-testid': 'ct-center' }).build(),
    )
    const el = screen.getByTestId('ct-center')
    expect(el.style.marginLeft).toBe('auto')
    expect(el.style.marginRight).toBe('auto')
    expect(el.style.width).toBe('100%')
    expect(el.className).toMatch(/\bmx-auto\b/)
    expect(el.className).toMatch(/\bw-full\b/)
  })

  it('.props({ className }) does not drop fibo-container / mx-auto', () => {
    render(
      Container()
        .props({ className: 'extra-ct', 'data-testid': 'ct-cls' })
        .children('keep')
        .build(),
    )
    const el = screen.getByTestId('ct-cls')
    expect(el.className).toMatch(/\bfibo-container\b/)
    expect(el.className).toMatch(/\bmx-auto\b/)
    expect(el.className).toMatch(/\bw-full\b/)
    expect(el.className).toMatch(/\bextra-ct\b/)
    expect(el.style.marginLeft).toBe('auto')
    expect(el.style.marginRight).toBe('auto')
  })

  it('hug drops full-width centering in class and inline style', () => {
    render(Container().hug().children('hug-me').props({ 'data-testid': 'ct-hug' }).build())
    const el = screen.getByTestId('ct-hug')
    expect(el.className).toMatch(/\bw-auto\b/)
    expect(el.className).not.toMatch(/\bw-full\b/)
    expect(el.className).not.toMatch(/\bmx-auto\b/)
    expect(el.style.width).toBe('auto')
    expect(el.style.marginLeft).not.toBe('auto')
    expect(el.style.marginRight).not.toBe('auto')
  })

  it('user marginLeft is not overwritten by leftover mx-auto', () => {
    render(
      Container()
        .marginLeft(12)
        .children('left')
        .props({ 'data-testid': 'ct-ml' })
        .build(),
    )
    const el = screen.getByTestId('ct-ml')
    expect(el.className).toMatch(/fibo-margin-left-12px/)
    expect(el.style.marginLeft).not.toBe('auto')
    expect(el.style.marginRight).toBe('auto')
  })
})

describe('W22-05 Container leftover — padding vs safe area', () => {
  it('default gutters include env(safe-area-inset-*) so content clears the notch', () => {
    const node = Container().children('pad').props({ 'data-testid': 'ct-sa' }).build()
    const style = hostStyle(node)
    expect(String(style.paddingLeft)).toMatch(/env\(safe-area-inset-left/)
    expect(String(style.paddingRight)).toMatch(/env\(safe-area-inset-right/)
    render(node)
    const el = screen.getByTestId('ct-sa')
    expect(el.className).toMatch(/safe-area-inset-left/)
    expect(el.className).toMatch(/safe-area-inset-right/)
  })

  it('user padding combines with safe-area via max() instead of wiping it', () => {
    const node = Container()
      .padding(24)
      .children('gutter')
      .props({ 'data-testid': 'ct-pad' })
      .build()
    const style = hostStyle(node)
    expect(String(style.paddingLeft)).toMatch(/max\(/)
    expect(String(style.paddingLeft)).toMatch(/24px/)
    expect(String(style.paddingLeft)).toMatch(/env\(safe-area-inset-left/)
    expect(String(style.paddingRight)).toMatch(/env\(safe-area-inset-right/)
    expect(String(style.paddingTop)).toMatch(/max\(/)
    expect(String(style.paddingTop)).toMatch(/24px/)
    expect(String(style.paddingTop)).toMatch(/env\(safe-area-inset-top/)
    expect(String(style.paddingBottom)).toMatch(/env\(safe-area-inset-bottom/)
    const html = renderToString(node as ReactElement)
    expect(html).toMatch(/safe-area-inset-left/)
    expect(html).toMatch(/24px/)
  })

  it('paddingHorizontal longhands survive leftover props.style padding and keep safe-area', () => {
    const style = hostStyle(
      Container()
        .paddingHorizontal(12)
        .props({ style: { padding: '8px calc(50% - 10px)' } })
        .children([])
        .build(),
    )
    expect(style.padding).toBeUndefined()
    expect(String(style.paddingLeft)).toMatch(/12px/)
    expect(String(style.paddingLeft)).toMatch(/env\(safe-area-inset-left/)
    expect(String(style.paddingRight)).toMatch(/12px/)
    expect(String(style.paddingRight)).toMatch(/env\(safe-area-inset-right/)
    expect(String(style.paddingTop)).toMatch(/8px/)
    expect(String(style.paddingTop)).toMatch(/env\(safe-area-inset-top/)
    expect(String(style.paddingBottom)).toMatch(/8px/)
    expect(String(style.paddingBottom)).toMatch(/env\(safe-area-inset-bottom/)
    expect(String(style.paddingRight)).not.toMatch(/calc\(50%/)
  })
})

describe('W22-05 Container leftover — locks', () => {
  it('string children with $length stay live after as + maxWidth', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Container()
        .maxWidth(600)
        .props({ as: 'section', 'data-testid': 'ct-live' })
        .children(`Kids ${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    expect(screen.getByTestId('ct-live').tagName).toBe('SECTION')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
    expect(host().textContent).not.toMatch(/FIBO:/)
  })

  it('.props({ children: interp }) stays live', () => {
    const n = signal(1)
    render(
      Container()
        .props({ children: `n=${interp(n)}`, 'data-testid': 'ct-pinterp' })
        .build() as ReactElement,
    )
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
  })

  it('forwards role and id (rest-spread lock)', () => {
    render(
      Container()
        .id('ct')
        .props({ role: 'region', 'data-testid': 'ct' })
        .children('hello-ct')
        .build(),
    )
    const el = screen.getByTestId('ct')
    expect(el).toHaveAttribute('id', 'ct')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-ct')
    expect(el.className).toMatch(/\bfibo-container\b/)
  })

  it('renderToString without window', () => {
    const html = renderToString(
      Container()
        .maxWidth(600)
        .padding(16)
        .props({ as: 'main', dangerouslySetInnerHTML: { __html: '<img data-xss="1">' } })
        .children('ssr-ct')
        .build() as ReactElement,
    )
    expect(html).toContain('ssr-ct')
    expect(html).toContain('max-width')
    expect(html).toMatch(/safe-area-inset/)
    expect(html).not.toContain('data-xss')
    expect(html).not.toContain(' as=')
  })
})
