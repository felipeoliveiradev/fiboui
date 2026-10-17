import { createElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Integration } from '../src/content/Integration'

afterEach(cleanup)

function iframeOf(container: HTMLElement): HTMLIFrameElement | null {
  return container.querySelector('iframe')
}

describe('Integration iframe src XSS', () => {
  it('strips javascript: src on a cloned iframe', () => {
    const { container } = render(
      Integration(
        createElement('iframe', { src: 'javascript:alert(1)', title: 'plug' }),
      ).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('src') ?? '').not.toMatch(/javascript/i)
  })

  it('strips data: / vbscript: / file: src on a cloned iframe', () => {
    for (const src of [
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
    ]) {
      const { container, unmount } = render(
        Integration(createElement('iframe', { src, title: 'plug' })).build() as ReactElement,
      )
      const frame = iframeOf(container)
      expect(frame, src).toBeTruthy()
      const got = frame!.getAttribute('src') ?? ''
      expect(got, src).not.toMatch(/javascript|data:|vbscript|file:/i)
      unmount()
    }
  })

  it('strips javascript: injected via .props() onto a cloned iframe', () => {
    const { container } = render(
      Integration(createElement('iframe', { src: 'https://example.com/ok', title: 'plug' }))
        .props({ src: 'javascript:alert(1)' })
        .build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('src') ?? '').not.toMatch(/javascript/i)
  })

  it('strips srcdoc so it cannot bypass src sanitization', () => {
    const { container } = render(
      Integration(
        createElement('iframe', {
          title: 'plug',
          srcdoc: '<script>alert(1)</script>',
        }),
      ).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('srcdoc') ?? '').not.toMatch(/script/i)
  })

  it('Integration("iframe") does not keep a javascript: src', () => {
    const { container } = render(
      Integration('iframe')
        .props({ src: 'javascript:alert(1)', title: 'plug' })
        .build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('src') ?? '').not.toMatch(/javascript/i)
  })
})

describe('Integration iframe sandbox', () => {
  it('adds sandbox on a cloned iframe when missing', () => {
    const { container } = render(
      Integration(
        createElement('iframe', { src: 'https://example.com/embed', title: 'plug' }),
      ).build() as ReactElement,
    )
    const frame = iframeOf(container)
    expect(frame).toBeTruthy()
    expect(frame!.getAttribute('sandbox')).toBeTruthy()
  })

  it('keeps an explicit sandbox from .props()', () => {
    const { container } = render(
      Integration(createElement('iframe', { src: 'https://example.com/embed', title: 'plug' }))
        .props({ sandbox: 'allow-popups' })
        .build() as ReactElement,
    )
    expect(iframeOf(container)).toHaveAttribute('sandbox', 'allow-popups')
  })

  it('keeps a safe https src', () => {
    const { container } = render(
      Integration(
        createElement('iframe', { src: 'https://example.com/embed', title: 'plug' }),
      ).build() as ReactElement,
    )
    expect(iframeOf(container)).toHaveAttribute('src', 'https://example.com/embed')
  })

  it('still clones a non-iframe element', () => {
    const { container } = render(
      Integration(createElement('span', { 'data-testid': 'plug' }, 'ok')).build() as ReactElement,
    )
    expect(container.querySelector('[data-testid="plug"]')?.textContent).toBe('ok')
    expect(iframeOf(container)).toBeNull()
  })

  it('renderToString does not throw for a cloned iframe', () => {
    expect(() =>
      renderToString(
        Integration(
          createElement('iframe', { src: 'https://example.com/embed', title: 'plug' }),
        ).build() as ReactElement,
      ),
    ).not.toThrow()
  })
})
