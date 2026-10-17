import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import {
  camelToKebab,
  kebabToCamel,
  normalizeCssProperties,
  normalizeCssValue,
  createCssFluentProxy,
  CssStyleStore,
} from '../src/core/cssFluent'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { withFiboStyles } from '../src/index'
import type { PseudoStateBuilder } from '../src/core/PseudoStateBuilder'

describe('kebabToCamel / camelToKebab — CSS custom properties', () => {
  it('does not camelCase --fibo-* (React stamps the literal name)', () => {
    expect(kebabToCamel('--fibo-primary')).toBe('--fibo-primary')
    expect(kebabToCamel('--fibo-elevation-1')).toBe('--fibo-elevation-1')
    expect(kebabToCamel('--fibo-dur')).toBe('--fibo-dur')
    expect(kebabToCamel('background-color')).toBe('backgroundColor')
  })

  it('does not hyphenate or lowercase --* names (custom props are case-sensitive)', () => {
    expect(camelToKebab('--fibo-primary')).toBe('--fibo-primary')
    expect(camelToKebab('--headerHeight')).toBe('--headerHeight')
    expect(camelToKebab('backgroundColor')).toBe('background-color')
  })
})

describe('normalizeCssValue — custom properties are untyped', () => {
  it('does not append px to --* numbers (React / --fibo-i stay unitless)', () => {
    expect(normalizeCssValue('--fibo-i', 2)).toBe('2')
    expect(normalizeCssValue('--fibo-dur', 420)).toBe('420')
    expect(normalizeCssValue('--headerHeight', 64)).toBe('64')
    expect(normalizeCssValue('padding', 8)).toBe('8px')
  })

  it('keeps --fibo-* keys and unitless numbers in style objects', () => {
    const style = normalizeCssProperties({
      '--fibo-i': 2,
      '--headerHeight': 64,
      'background-color': 'red',
    }) as Record<string, string>
    expect(style['--fibo-i']).toBe('2')
    expect(style['--headerHeight']).toBe('64')
    expect(style.backgroundColor).toBe('red')
    expect(style['-FiboI']).toBeUndefined()
    expect(style['--header-height']).toBeUndefined()
  })
})

describe('CssStyleStore toCSSString — custom props', () => {
  it('emits literal --* names, unitless numbers, kebab CSS properties', () => {
    const s = createCssFluentProxy(new CssStyleStore())
    s.css('--fibo-i', 2).css('--headerHeight', 64).css('background-color', 'red')
    const css = s.toCSSString()
    expect(css).toContain('--fibo-i: 2;')
    expect(css).toContain('--headerHeight: 64;')
    expect(css).toContain('background-color: red;')
    expect(css).not.toContain('--header-height')
    expect(css).not.toMatch(/--fibo-i:\s*2px/)
    expect(css).not.toContain('backgroundColor')
  })
})

describe('PseudoStateBuilder group:hover + css string', () => {
  it('groupHover emits .group:hover descendant rules, not camelCase properties', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        Box()
          .group()
          .children([
            Box()
              .groupHover((h: PseudoStateBuilder) =>
                h.bg('#f00').css('backgroundColor', '#0f0').css('--fibo-i', 2).css('--headerHeight', 64),
              )
              .children([]),
          ]),
      ) as never,
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/\.group:hover \.fibo-ps-\w+ \{/)
    expect(css).toMatch(/background-color:\s*#f00/)
    expect(css).toMatch(/background-color:\s*#0f0/)
    expect(css).not.toMatch(/backgroundColor\s*:/)
    expect(css).toMatch(/--fibo-i:\s*2\s*!important/)
    expect(css).not.toMatch(/--fibo-i:\s*2px/)
    expect(css).toMatch(/--headerHeight:\s*64\s*!important/)
    expect(css).not.toMatch(/--header-height:/)
  })
})
