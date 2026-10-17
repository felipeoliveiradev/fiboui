import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { Box } from '../src'
import { StyleManager } from '../src/core/styleManager'

afterEach(cleanup)

describe('resetStyle', () => {
  it('drops prior StyleManager hashes and inline _style/_cssStyles, then adds fibo-reset', () => {
    StyleManager.resetForTests()
    const { container } = render(
      Box()
        .id('reset-host')
        .bg('red')
        .padding(16)
        .style({ color: 'blue' })
        .css({ opacity: 0.5 })
        .resetStyle()
        .children('x')
        .build() as any
    )
    const el = container.querySelector('#reset-host') as HTMLElement
    expect(el.className).toContain('fibo-reset')
    expect(el.className).not.toContain('fibo-background-color-red')
    expect(el.className).not.toContain('fibo-padding-16px')
    expect(el.style.color).toBe('')
    expect(el.style.opacity).toBe('')
  })

  it('drops prior hover StyleManager hashes', () => {
    StyleManager.resetForTests()
    const { container } = render(
      Box()
        .id('hover-reset')
        .hover((h) => (h as any).backgroundColor('blue'))
        .resetStyle()
        .children('x')
        .build() as any
    )
    const el = container.querySelector('#hover-reset') as HTMLElement
    expect(el.className).toContain('fibo-reset')
    expect(el.className.split(/\s+/).some((c) => c.startsWith('fibo-ps-'))).toBe(false)
  })

  it('keeps layout helpers chained after resetStyle', () => {
    StyleManager.resetForTests()
    const { container } = render(
      Box()
        .id('after')
        .bg('red')
        .style({ color: 'blue' })
        .resetStyle()
        .flex()
        .gap(8)
        .width(120)
        .children('x')
        .build() as any
    )
    const el = container.querySelector('#after') as HTMLElement
    expect(el.className).toContain('fibo-reset')
    expect(el.className).not.toContain('fibo-background-color-red')
    expect(el.style.color).toBe('')
    expect(el.style.display).toBe('flex')
    expect(el.style.gap).toBe('8px')
    expect(el.className).toContain('fibo-width-120px')
  })
})
