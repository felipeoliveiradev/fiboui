import { createElement, type ReactElement, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Integration } from '../src/content/Integration'

afterEach(cleanup)

function iframeOf(container: HTMLElement): HTMLIFrameElement | null {
  return container.querySelector('iframe')
}

function Plug(props: { className?: string; style?: React.CSSProperties; children?: ReactNode; title?: string }) {
  return createElement('div', { 'data-testid': 'plug', className: props.className, style: props.style, title: props.title }, props.children)
}

describe('W20-08 Integration source strings / null', () => {
  it('null source does not crash', () => {
    expect(() => render(Integration(null).build() as ReactElement)).not.toThrow()
    expect(() => render(Integration().build() as ReactElement)).not.toThrow()
  })

  it('plain URL source paints a sandboxed iframe (not a custom element / crash)', () => {
    const { container } = render(
      Integration('https://example.com/embed').props({ title: 'maps' }).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('src')).toBe('https://example.com/embed')
    expect(frame!.getAttribute('sandbox')).toBeTruthy()
    expect(frame!.tagName).toBe('IFRAME')
  })

  it('javascript: URL source does not become iframe src', () => {
    expect(() =>
      render(Integration('javascript:alert(1)').props({ title: 'x' }).build() as ReactElement),
    ).not.toThrow()
    const { container } = render(
      Integration('javascript:alert(1)').props({ title: 'x' }).build() as ReactElement,
    )
    const frame = iframeOf(container)
    const src = frame?.getAttribute('src') ?? ''
    expect(src).not.toMatch(/javascript/i)
  })

  it('data: / vbscript: / file: URL sources do not become iframe src', () => {
    for (const src of [
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      '  JAVASCRIPT:alert(1)',
    ]) {
      const { container, unmount } = render(
        Integration(src).props({ title: 'x' }).build() as ReactElement,
      )
      const got = iframeOf(container)?.getAttribute('src') ?? ''
      expect(got, src).not.toMatch(/javascript|data:|vbscript|file:/i)
      unmount()
    }
  })

  it('non-url tag strings are not treated as components', () => {
    expect(() => render(Integration('script').build() as ReactElement)).not.toThrow()
    const { container } = render(Integration('script').build() as ReactElement)
    expect(container.querySelector('script')).toBeNull()
  })
})

describe('W20-08 Integration className / style', () => {
  it('forwards .className() and .style() onto a cloned host', () => {
    const { container } = render(
      Integration(createElement('span', { 'data-testid': 'plug' }, 'ok'))
        .className('from-fluent')
        .style({ color: 'rgb(1, 2, 3)' })
        .build() as ReactElement,
    )
    const el = screen.getByTestId('plug')
    expect(el.className).toMatch(/\bfibo-integration\b/)
    expect(el.className).toMatch(/\bfrom-fluent\b/)
    expect(el.style.color).toBe('rgb(1, 2, 3)')
    expect(iframeOf(container)).toBeNull()
  })

  it('keeps fibo-integration when .props({ className, style }) is set', () => {
    render(
      Integration(createElement('span', { 'data-testid': 'plug' }, 'ok'))
        .className('from-fluent')
        .style({ color: 'rgb(1, 2, 3)' })
        .props({ className: 'from-props', style: { display: 'block' } })
        .build() as ReactElement,
    )
    const el = screen.getByTestId('plug')
    expect(el.className).toMatch(/\bfibo-integration\b/)
    expect(el.className).toMatch(/\bfrom-fluent\b/)
    expect(el.className).toMatch(/\bfrom-props\b/)
    expect(el.style.color).toBe('rgb(1, 2, 3)')
    expect(el.style.display).toBe('block')
  })

  it('forwards className/style onto a function-component source', () => {
    render(
      Integration(Plug)
        .className('from-fluent')
        .style({ color: 'rgb(4, 5, 6)' })
        .build() as ReactElement,
    )
    const el = screen.getByTestId('plug')
    expect(el.className).toMatch(/\bfibo-integration\b/)
    expect(el.className).toMatch(/\bfrom-fluent\b/)
    expect(el.style.color).toBe('rgb(4, 5, 6)')
  })

  it('forwards className/style onto Integration("iframe")', () => {
    const { container } = render(
      Integration('iframe')
        .className('from-fluent')
        .style({ width: '80px' })
        .props({ src: 'https://example.com/embed', title: 'plug' })
        .build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.className).toMatch(/\bfibo-integration\b/)
    expect(frame!.className).toMatch(/\bfrom-fluent\b/)
    expect(frame!.style.width).toBe('80px')
  })
})

describe('W20-08 Integration children', () => {
  it('forwards .children() onto a function-component source', () => {
    render(Integration(Plug).children('kid-text').build() as ReactElement)
    expect(screen.getByTestId('plug')).toHaveTextContent('kid-text')
  })

  it('forwards .children() onto a cloned host', () => {
    render(
      Integration(createElement('div', { 'data-testid': 'plug' }))
        .children('kid-clone')
        .build() as ReactElement,
    )
    expect(screen.getByTestId('plug')).toHaveTextContent('kid-clone')
  })

  it('keeps cloned source children when .children() is omitted', () => {
    render(
      Integration(createElement('div', { 'data-testid': 'plug' }, 'original')).build() as ReactElement,
    )
    expect(screen.getByTestId('plug')).toHaveTextContent('original')
  })
})

describe('W20-08 Integration iframe srcdoc must not blank src', () => {
  it('does not leave srcdoc="" on a cloned iframe with a safe src', () => {
    const { container } = render(
      Integration(
        createElement('iframe', { src: 'https://example.com/embed', title: 'plug' }),
      ).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('src')).toBe('https://example.com/embed')
    expect(frame!.hasAttribute('srcdoc')).toBe(false)
  })

  it('omits srcdoc after stripping a dangerous srcdoc so https src can load', () => {
    const { container } = render(
      Integration(
        createElement('iframe', {
          src: 'https://example.com/ok',
          title: 'plug',
          srcdoc: '<script>alert(1)</script>',
        }),
      ).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.hasAttribute('srcdoc')).toBe(false)
    expect(frame!.getAttribute('srcdoc') ?? '').not.toMatch(/script/i)
    expect(frame!.getAttribute('src')).toBe('https://example.com/ok')
  })

  it('URL source iframe also omits srcdoc', () => {
    const { container } = render(
      Integration('https://example.com/embed').props({ title: 'plug' }).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.hasAttribute('srcdoc')).toBe(false)
    expect(frame!.getAttribute('src')).toBe('https://example.com/embed')
  })

  it('renderToString does not throw for a URL source', () => {
    expect(() =>
      renderToString(Integration('https://example.com/embed').props({ title: 'plug' }).build() as ReactElement),
    ).not.toThrow()
  })
})
