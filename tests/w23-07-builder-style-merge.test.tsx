import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { withFiboStyles } from '../src/index'

afterEach(() => {
  cleanup()
  StyleManager.resetForTests()
})

function hostStyle(node: unknown): Record<string, unknown> {
  const el = node as { props?: { style?: Record<string, unknown> } }
  return { ...(el.props?.style ?? {}) }
}

describe('W23-07 sequential .style() vs .css() last-write', () => {
  it('later .style({ color }) wins over earlier .css({ color })', () => {
    const style = hostStyle(
      Box().css({ color: 'red' }).style({ color: 'blue' }).children([]).build(),
    )
    expect(style.color).toBe('blue')
  })

  it('later .css({ color }) still wins over earlier .style({ color })', () => {
    const style = hostStyle(
      Box().style({ color: 'blue' }).css({ color: 'red' }).children([]).build(),
    )
    expect(style.color).toBe('red')
  })

  it('later .flex() wins over earlier .css({ display: "block" })', () => {
    const style = hostStyle(
      Box().css({ display: 'block' }).flex().children([]).build(),
    )
    expect(style.display).toBe('flex')
  })

  it('later .center() wins over earlier .css({ display: "block" })', () => {
    const style = hostStyle(
      Box().css({ display: 'block' }).center().children([]).build(),
    )
    expect(style.display).toBe('flex')
    expect(style.alignItems).toBe('center')
    expect(style.justifyContent).toBe('center')
  })

  it('SSR later .style() color is not the earlier .css() color', () => {
    const html = renderToString(
      Box().css({ color: 'red' }).style({ color: 'blue' }).children([]).build() as never,
    )
    expect(html).toMatch(/color:\s*blue/)
    expect(html).not.toMatch(/color:\s*red/)
  })
})

describe('W23-07 proxy box longhands vs later padding()/margin()', () => {
  it('later .padding() does not clobber earlier proxy paddingLeft', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        (Box() as any).paddingLeft(12).padding(0).id('pl').children([]),
      ) as never,
    )
    expect(html).toContain('padding-left-12px')
    expect(html).not.toContain('fibo-padding-0px')
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/padding-left:\s*12px/)
    expect(css).not.toMatch(/(?<![a-z-])padding:\s*0px/)
  })

  it('later .margin() does not clobber earlier proxy marginTop', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        (Box() as any).marginTop(8).margin(0).id('mt').children([]),
      ) as never,
    )
    expect(html).toContain('margin-top-8px')
    expect(html).not.toContain('fibo-margin-0px')
  })

  it('later .padding() does not clobber earlier .style({ paddingLeft })', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      Box().style({ paddingLeft: 12 }).padding(0).id('sl').children([]).build() as never,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).not.toContain('fibo-padding-0px')
  })

  it('later .padding() does not clobber earlier .css({ paddingLeft })', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      Box().css({ paddingLeft: 12 }).padding(0).id('cl').children([]).build() as never,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).not.toContain('fibo-padding-0px')
  })
})

describe('W23-07 resetStyle leftover transform', () => {
  it('resetStyle drops earlier translateX from the painted style', () => {
    const { container } = render(
      Box().id('tx').translateX(10).resetStyle().children('x').build() as never,
    )
    const el = container.querySelector('#tx') as HTMLElement
    expect(el.className).toContain('fibo-reset')
    expect(el.style.transform).toBe('')
  })
})
