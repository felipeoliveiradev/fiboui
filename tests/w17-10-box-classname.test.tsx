import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-box')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-box')
  return el
}

describe('W17-10 Box leftover — host class lock', () => {
  it('keeps fibo-box when .props({ className }) is set', () => {
    render(
      Box()
        .props({ className: 'extra-box', 'data-testid': 'box-host' })
        .children('hello-box')
        .build()
    )
    const el = screen.getByTestId('box-host')
    expect(el.className).toMatch(/\bfibo-box\b/)
    expect(el.className).toMatch(/\bmin-w-0\b/)
    expect(el.className).toMatch(/\bextra-box\b/)
    expect(el).toHaveTextContent('hello-box')
  })

  it('merges fluent .className() with .props({ className })', () => {
    render(
      Box()
        .className('from-fluent')
        .props({ className: 'from-props', 'data-testid': 'box-merge' })
        .children('merged')
        .build()
    )
    const el = screen.getByTestId('box-merge')
    expect(el.className).toMatch(/\bfibo-box\b/)
    expect(el.className).toMatch(/\bfrom-fluent\b/)
    expect(el.className).toMatch(/\bfrom-props\b/)
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Box().children('x').props({ className: undefined as never }).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().className).toMatch(/\bfibo-box\b/)
    expect(host().className).toMatch(/\bmin-w-0\b/)
  })

  it('SSR html keeps fibo-box plus extra className', () => {
    const html = renderToString(
      Box()
        .props({ className: 'ssr-extra' })
        .children('ssr-box')
        .build() as ReactElement
    )
    expect(html).toContain('fibo-box')
    expect(html).toContain('min-w-0')
    expect(html).toContain('ssr-extra')
    expect(html).toContain('ssr-box')
  })
})
