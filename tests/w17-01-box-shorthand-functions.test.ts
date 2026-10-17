import { describe, expect, it } from 'vitest'
import {
  CssStyleStore,
  createCssFluentProxy,
  normalizeCssProperties,
  parseBoxShorthand,
} from '../src/core/cssFluent'

describe('parseBoxShorthand — CSS functions with spaces', () => {
  it('keeps calc() as one 2-value slot (not 4 tokens)', () => {
    expect(parseBoxShorthand('8px calc(50% - 10px)')).toEqual([
      '8px',
      'calc(50% - 10px)',
      '8px',
      'calc(50% - 10px)',
    ])
  })

  it('keeps var() fallback and clamp() as single tokens', () => {
    expect(parseBoxShorthand('8px var(--g, 16px)')).toEqual([
      '8px',
      'var(--g, 16px)',
      '8px',
      'var(--g, 16px)',
    ])
    expect(parseBoxShorthand('clamp(8px, 2vw, 24px)')).toEqual([
      'clamp(8px, 2vw, 24px)',
      'clamp(8px, 2vw, 24px)',
      'clamp(8px, 2vw, 24px)',
      'clamp(8px, 2vw, 24px)',
    ])
  })
})

describe('expandBoxShorthand — sequential fluent vs axes', () => {
  it('padding() with calc after paddingHorizontal fills only missing sides', () => {
    const s = createCssFluentProxy(new CssStyleStore())
    s.paddingHorizontal(12).padding('8px calc(50% - 10px)')
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingBottom).toBe('8px')
  })

  it('paddingHorizontal after calc padding expands without padding-bottom: -', () => {
    const s = createCssFluentProxy(new CssStyleStore())
    s.padding('8px calc(50% - 10px)').paddingHorizontal(12)
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingBottom).toBe('8px')
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
  })

  it('style() object padding with calc does not clobber paddingHorizontal', () => {
    const s = createCssFluentProxy(new CssStyleStore())
    s.paddingHorizontal(12).style({ padding: '8px calc(50% - 10px)' })
    const style = s.toStyle()
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingBottom).toBe('8px')
  })

  it('marginVertical then margin with clamp fills left/right only', () => {
    const s = createCssFluentProxy(new CssStyleStore())
    s.marginVertical(4).margin('clamp(8px, 2vw, 24px)')
    const style = s.toStyle()
    expect(style.margin).toBeUndefined()
    expect(style.marginTop).toBe('4px')
    expect(style.marginBottom).toBe('4px')
    expect(style.marginLeft).toBe('clamp(8px, 2vw, 24px)')
    expect(style.marginRight).toBe('clamp(8px, 2vw, 24px)')
  })
})

describe('normalizeCssProperties — object padding vs axes with calc', () => {
  it('same-object paddingHorizontal + calc padding keeps axis longhands', () => {
    const later = normalizeCssProperties({
      paddingHorizontal: 12,
      padding: '8px calc(50% - 10px)',
    })
    expect(later.padding).toBeUndefined()
    expect(later.paddingLeft).toBe('12px')
    expect(later.paddingRight).toBe('12px')
    expect(later.paddingTop).toBe('8px')
    expect(later.paddingBottom).toBe('8px')

    const earlier = normalizeCssProperties({
      padding: '8px calc(50% - 10px)',
      paddingHorizontal: 12,
    })
    expect(earlier.padding).toBeUndefined()
    expect(earlier.paddingLeft).toBe('12px')
    expect(earlier.paddingRight).toBe('12px')
    expect(earlier.paddingTop).toBe('8px')
    expect(earlier.paddingBottom).toBe('8px')
  })
})

describe('normalizeCssProperties — CSS custom properties', () => {
  it('keeps --fibo-* keys so React stamps them as CSS variables', () => {
    const style = normalizeCssProperties({
      '--fibo-dur': '420ms',
      '--fibo-ease': 'ease-in',
      '--fibo-stagger': '80ms',
      'background-color': 'red',
    }) as Record<string, string>
    expect(style['--fibo-dur']).toBe('420ms')
    expect(style['--fibo-ease']).toBe('ease-in')
    expect(style['--fibo-stagger']).toBe('80ms')
    expect(style.backgroundColor).toBe('red')
    expect(style['-FiboDur']).toBeUndefined()
  })
})
