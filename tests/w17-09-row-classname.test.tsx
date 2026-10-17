import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Row } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-row')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-row')
  return el
}

describe('W17-09 Row leftover — host class lock', () => {
  it('keeps fibo-row when .props({ className }) is set', () => {
    render(
      Row()
        .props({ className: 'extra-row', 'data-testid': 'row-host' })
        .children('hello-row')
        .build()
    )
    const el = screen.getByTestId('row-host')
    expect(el.className).toMatch(/\bfibo-row\b/)
    expect(el.className).toMatch(/\bflex-row\b/)
    expect(el.className).toMatch(/\bextra-row\b/)
    expect(el).toHaveTextContent('hello-row')
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Row().children('x').props({ className: undefined as never }).build())
    expect(host().className.split(/\s+/)).not.toContain('undefined')
    expect(host().className).toMatch(/\bfibo-row\b/)
  })

  it('merges .className() with .props({ className }) without dropping host', () => {
    render(
      Row()
        .className('from-class')
        .props({ className: 'from-props', 'data-testid': 'row-merge' })
        .children('m')
        .build()
    )
    const el = screen.getByTestId('row-merge')
    expect(el.className).toMatch(/\bfibo-row\b/)
    expect(el.className).toMatch(/\bflex-row\b/)
    expect(el.className).toMatch(/\bfrom-class\b/)
    expect(el.className).toMatch(/\bfrom-props\b/)
  })

  it('renderToString keeps fibo-row when props.className is set', () => {
    const html = renderToString(
      Row()
        .props({ className: 'ssr-extra' })
        .children('ssr-row')
        .build() as ReactElement
    )
    expect(html).toMatch(/\bfibo-row\b/)
    expect(html).toMatch(/\bssr-extra\b/)
    expect(html).toContain('ssr-row')
  })
})
