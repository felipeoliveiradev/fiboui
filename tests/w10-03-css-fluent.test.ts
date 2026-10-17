import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import {
  CssStyleStore,
  createCssFluentProxy,
  normalizeCssProperties,
  normalizeCssValue,
} from '../src/core/cssFluent'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { withFiboStyles } from '../src/index'

describe('normalizeCssProperties — box shorthand vs axes', () => {
  it('does not let padding shorthand clobber paddingHorizontal in the same object', () => {
    const later = normalizeCssProperties({ paddingHorizontal: 12, padding: 0 })
    expect(later.padding).toBeUndefined()
    expect(later.paddingLeft).toBe('12px')
    expect(later.paddingRight).toBe('12px')
    expect(later.paddingTop).toBe('0px')
    expect(later.paddingBottom).toBe('0px')

    const earlier = normalizeCssProperties({ padding: 0, paddingHorizontal: 12 })
    expect(earlier.padding).toBeUndefined()
    expect(earlier.paddingLeft).toBe('12px')
    expect(earlier.paddingRight).toBe('12px')
    expect(earlier.paddingTop).toBe('0px')
    expect(earlier.paddingBottom).toBe('0px')
  })

  it('camelCases kebab keys so box-shadow: 0 becomes boxShadow none', () => {
    const out = normalizeCssProperties({ 'box-shadow': 0 as never })
    expect(out.boxShadow).toBe('none')
    expect((out as Record<string, unknown>)['box-shadow']).toBeUndefined()
  })
})

describe('normalizeCssValue — unitless', () => {
  it('keeps aspectRatio as a unitless number (not px)', () => {
    expect(normalizeCssValue('aspectRatio', 1.5)).toBe('1.5')
    expect(normalizeCssValue('aspect-ratio', 1)).toBe('1')
  })
})

describe('CssStyleStore / fluent .css()', () => {
  it('css() still goes through the normalizer (boxShadow 0 → none)', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.css('box-shadow', 0)
    expect(s.toStyle().boxShadow).toBe('none')
  })

  it('style() object padding does not reset paddingHorizontal longhands', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.paddingHorizontal(12).style({ padding: 0 })
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
  })
})

describe('builder .css() / .media() objects', () => {
  it('css({ paddingHorizontal, padding }) keeps axis longhands', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      Box()
        .css({ paddingHorizontal: 12, padding: 0 } as never)
        .id('css-pad')
        .children([])
        .build() as never,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).toMatch(/padding-right:\s*12px/)
    expect(html).not.toMatch(/padding:\s*0px/)
  })

  it('media() object values expand axes and normalize boxShadow 0', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        Box()
          .media('md', { paddingHorizontal: 12, padding: 0, boxShadow: 0 } as never)
          .children([]),
      ) as never,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).toMatch(/padding-right:\s*12px/)
    expect(html).toMatch(/box-shadow:\s*none/)
    expect(html).not.toMatch(/@media[^{]+\{[^}]*padding:\s*0px/)
  })
})
