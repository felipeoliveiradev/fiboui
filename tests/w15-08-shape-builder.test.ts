import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { Circle, Path, Rect } from '../src/graphics'

describe('W15-08 ShapeBuilder.css(object) does not crash', () => {
  it('accepts a style object like FiboBuilder.css() instead of throwing on .includes', () => {
    let node: ReturnType<typeof Circle>
    expect(() => {
      node = Circle().css({ cursor: 'pointer', pointerEvents: 'none' } as any)
    }).not.toThrow()
    const el = node!.build() as any
    expect(el.props.style).toMatchObject({
      cursor: 'pointer',
      pointerEvents: 'none',
    })
  })

  it('css({ boxShadow: 0 }) maps to none, not 0px', () => {
    const el = Circle().css({ boxShadow: 0 } as any).build() as any
    expect(el.props.style.boxShadow).toBe('none')
    expect(el.props.filter).toBeUndefined()
  })

  it('still supports css(prop, value)', () => {
    const el = Circle().css('cursor', 'crosshair').build() as any
    expect(el.props.style.cursor).toBe('crosshair')
  })
})

describe('W15-08 ShapeBuilder.style() uses CSS normalizer', () => {
  it('style({ boxShadow: 0 }) is none, not a numeric 0px shadow', () => {
    const el = Circle().style({ boxShadow: 0 as any }).build() as any
    expect(el.props.style.boxShadow).toBe('none')
    expect(el.props.filter).toBeUndefined()
  })

  it('style({ paddingHorizontal: 12 }) expands to paddingLeft/Right longhands', () => {
    const el = Rect().style({ paddingHorizontal: 12 } as any).build() as any
    expect(el.props.style.paddingLeft).toBe('12px')
    expect(el.props.style.paddingRight).toBe('12px')
    expect(el.props.style.paddingHorizontal).toBeUndefined()
  })

  it('keeps prior CSS-like methods when style() merges (opacity stays a number)', () => {
    const el = (Circle() as any).cursor('pointer').style({ opacity: 0.5 }).build() as any
    expect(el.props.style).toMatchObject({
      cursor: 'pointer',
      opacity: 0.5,
    })
  })
})

describe('W15-08 SVG filter() strips drop-shadow inset', () => {
  it('filter("drop-shadow(... inset)") never emits inset (browser would drop the filter)', () => {
    const el = Circle()
      .filter('drop-shadow(0px -2px 4px rgba(0,0,0,0.05) inset)')
      .build() as any
    expect(el.props.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
    expect(el.props.filter).not.toMatch(/inset/)
  })

  it('keeps url(#inset) while stripping inset only from drop-shadow()', () => {
    const el = Path()
      .moveTo(0, 0)
      .lineTo(1, 1)
      .filter('url(#inset) drop-shadow(0px 1px 2px #000 inset)')
      .build() as any
    expect(el.props.filter).toContain('url(#inset)')
    expect(el.props.filter).toMatch(/drop-shadow\(0px 1px 2px #000\)/)
    expect(el.props.filter).not.toMatch(/drop-shadow\([^)]*\binset\b/)
  })

  it('4-arg shadow() still strips inset from the color arg', () => {
    const el = Circle().shadow(0, -2, 4, 'rgba(0,0,0,0.05) inset').build() as any
    expect(el.props.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
  })
})

describe('W15-08 CSS 3D transform is style.transform, not SVG transform attr', () => {
  it('rotateX writes CSS transform (SVG transform attr has no rotateX)', () => {
    const el = Circle().rotateX(45).build() as any
    expect(el.props.style?.transform).toBe('rotateX(45deg)')
    expect(el.props.transform).toBeUndefined()
    expect(String(el.props.transform ?? '')).not.toMatch(/rotateX/)
  })

  it('perspective/rotate3d also land on CSS, and 2D rotate still uses the SVG attr', () => {
    const cssEl = Rect().perspective(200).build() as any
    expect(cssEl.props.style?.transform).toBe('perspective(200px)')
    expect(cssEl.props.transform).toBeUndefined()

    const svgEl = Circle().rotate(15, 10, 10).build() as any
    expect(svgEl.props.transform).toBe('rotate(15 10 10)')
    expect(svgEl.props.style?.transform).toBeUndefined()
  })

  it('later 2D rotate() clears a prior CSS 3D transform (last write wins)', () => {
    const el = Circle().rotateX(45).rotate(10).build() as any
    expect(el.props.transform).toBe('rotate(10)')
    expect(el.props.style?.transform).toBeUndefined()
  })
})

describe('W15-08 CSS proxy + React element still hold', () => {
  it('unknown CSS methods still merge via normalizeCssValue', () => {
    const el = (Circle() as any).cursor('pointer').boxShadow(0).build() as any
    expect(el.props.style.cursor).toBe('pointer')
    expect(el.props.style.boxShadow).toBe('none')
    expect(isValidElement((Circle() as any).cursor('pointer'))).toBe(true)
  })
})
