import { describe, it, expect } from 'vitest'
import { normalizeCssValue, createCssFluentProxy, CssStyleStore } from '../src/core/cssFluent'

describe('normalizeCssValue', () => {
  it('adds px to lengths', () => {
    expect(normalizeCssValue('padding', 16)).toBe('16px')
  })

  it('keeps opacity unitless', () => {
    expect(normalizeCssValue('opacity', 0.5)).toBe('0.5')
  })

  it('maps boxShadow(0) to none', () => {
    expect(normalizeCssValue('boxShadow', 0)).toBe('none')
  })
})

describe('createCssFluentProxy', () => {
  it('maps paddingHorizontal after padding shorthand', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.padding(0).paddingHorizontal(12).marginVertical(8).marginLeft(4)
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.marginTop).toBe('8px')
    expect(style.marginBottom).toBe('8px')
    expect(style.marginLeft).toBe('4px')
  })

  it('accepts arbitrary CSS properties', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.boxShadow('0 4px 12px rgba(0,0,0,.15)').backdropFilter('blur(8px)').padding(12)
    const style = s.toStyle()
    expect(style.boxShadow).toBe('0 4px 12px rgba(0,0,0,.15)')
    expect(style.backdropFilter).toBe('blur(8px)')
    expect(style.padding).toBe('12px')
  })

  it('keeps paddingHorizontal longhands when padding shorthand comes later', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.paddingHorizontal(12).padding(0)
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
  })

  it('normalizes object style() values (boxShadow: 0 → none)', () => {
    const store = new CssStyleStore()
    const s = createCssFluentProxy(store)
    s.style({ boxShadow: 0 as any })
    expect(s.toStyle().boxShadow).toBe('none')
  })
})
