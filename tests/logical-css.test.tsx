import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Column } from '../src/layout/Column'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { withFiboStyles } from '../src/index'

describe('logical CSS on every builder', () => {
  it('borderHorizontal and paddingHorizontal land on the host', () => {
    const html = renderToString(
      Column()
        .paddingHorizontal(12)
        .borderHorizontal('1px solid red')
        .roundedTop(8)
        .children([])
        .build() as any
    )
    expect(html).toContain('padding-left')
    expect(html).toContain('padding-right')
    expect(html).toContain('border-left')
    expect(html).toContain('border-right')
    expect(html).toContain('border-top-left-radius')
    expect(html).toContain('border-top-right-radius')
  })

  it('hover accepts any CSS and logical axes', () => {
    const html = renderToString(
      withFiboStyles(
        Column()
          .hover((h) =>
            h.paddingHorizontal(8).boxShadow('0 4px 12px rgba(0,0,0,.2)').marginVertical(4)
          )
          .children([])
      ) as any
    )
    expect(html).toContain('padding-left')
    expect(html).toContain('box-shadow')
    expect(html).toContain('margin-top')
    expect(html).toContain('margin-bottom')
  })
})

describe('FiboBuilder object CSS + box shorthand', () => {
  it('style/css/media object values go through normalizeCssValue (boxShadow: 0 → none)', () => {
    StyleManager.resetForTests()
    const inline = renderToString(
      Box().style({ boxShadow: 0 as any }).children([]).build() as any
    )
    expect(inline).toMatch(/box-shadow:\s*none/)
    expect(inline).not.toMatch(/box-shadow:\s*0px/)

    const cssObj = renderToString(
      Box().css({ boxShadow: 0 as any }).children([]).build() as any
    )
    expect(cssObj).toMatch(/box-shadow:\s*none/)
    expect(cssObj).not.toMatch(/box-shadow:\s*0px/)

    StyleManager.resetForTests()
    const media = renderToString(
      withFiboStyles(Box().media('md', { boxShadow: 0 as any }).children([])) as any
    )
    expect(media).toMatch(/box-shadow:\s*none/)
    expect(media).not.toMatch(/box-shadow:\s*0px/)
  })

  it('later padding() / p() do not clobber paddingHorizontal longhands', () => {
    StyleManager.resetForTests()
    const viaPadding = renderToString(
      Box().paddingHorizontal(12).padding(0).id('pad').children([]).build() as any
    )
    expect(viaPadding).toContain('padding-left-12px')
    expect(viaPadding).toContain('padding-right-12px')
    expect(viaPadding).not.toContain('fibo-padding-0px')

    const viaP = renderToString(
      Box().paddingHorizontal(12).p(0).id('p').children([]).build() as any
    )
    expect(viaP).toContain('padding-left-12px')
    expect(viaP).toContain('padding-right-12px')
    expect(viaP).not.toContain('fibo-padding-0px')
  })

  it('hover shadow(0) is none and later padding does not clobber axes', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        Box()
          .hover((h) => h.shadow(0).css('box-shadow', 0).paddingHorizontal(12).padding(0))
          .children([])
      ) as any
    )
    expect(html).toMatch(/box-shadow:\s*none/)
    expect(html).not.toMatch(/box-shadow:\s*0(?:px)?\s*!important/)
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/padding-left:\s*12px/)
    expect(css).toMatch(/padding-right:\s*12px/)
    expect(css).not.toMatch(/:hover \{ padding:\s*0px/)
  })
})
