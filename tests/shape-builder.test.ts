import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { Circle, Path, Rect } from '../src/graphics'

describe('ShapeBuilder CSS-like unknown methods', () => {
  it('does not throw; merges CSS-like calls into style via normalizeCssValue', () => {
    let node: ReturnType<typeof Circle>
    expect(() => {
      node = (Circle() as any).cursor('pointer').pointerEvents('none').letterSpacing(2)
    }).not.toThrow()
    const el = node!.build() as any
    expect(el.props.style).toMatchObject({
      cursor: 'pointer',
      pointerEvents: 'none',
      letterSpacing: '2px',
    })
  })

  it('maps boxShadow(0) to none on style, not SVG filter', () => {
    const el = (Circle() as any).boxShadow(0).build() as any
    expect(el.props.style.boxShadow).toBe('none')
    expect(el.props.filter).toBeUndefined()
  })

  it('keeps SVG shadow() 4-arg drop-shadow filter', () => {
    const el = Circle().shadow(2, 4, 8, 'black').build() as any
    expect(el.props.filter).toBe('drop-shadow(2px 4px 8px black)')
    expect(el.props.style?.boxShadow).toBeUndefined()
  })

  it('chains shadow() with CSS-like methods', () => {
    const el = (Circle().shadow(1, 1, 2, '#000') as any).cursor('pointer').build() as any
    expect(el.props.filter).toBe('drop-shadow(1px 1px 2px #000)')
    expect(el.props.style.cursor).toBe('pointer')
  })

  it('expands logical CSS (paddingHorizontal) into style longhands', () => {
    const el = (Rect() as any).paddingHorizontal(12).build() as any
    expect(el.props.style.paddingLeft).toBe('12px')
    expect(el.props.style.paddingRight).toBe('12px')
  })

  it('still chains native shape methods', () => {
    const el = Circle().fill('#f00').stroke('#000').strokeWidth(2).build() as any
    expect(el.props.fill).toBe('#f00')
    expect(el.props.stroke).toBe('#000')
    expect(el.props.strokeWidth).toBe(2)
  })

  it('stays a valid React element after CSS-like calls', () => {
    const node = (Circle() as any).cursor('crosshair')
    expect(isValidElement(node)).toBe(true)
  })

  it('applies CSS-like methods on Path too', () => {
    const el = (Path().moveTo(0, 0).lineTo(1, 1) as any).vectorEffect('non-scaling-stroke').build() as any
    expect(el.props.style.vectorEffect).toBe('non-scaling-stroke')
    expect(el.props.d).toBe('M 0 0 L 1 1')
  })
})

describe('ShapeBuilder clipPath', () => {
  it('passes clipPath through to Circle, Rect, and Path SVG nodes', () => {
    const clip = 'url(#hole)'
    expect((Circle().clipPath(clip).build() as any).props.clipPath).toBe(clip)
    expect((Rect().clipPath(clip).build() as any).props.clipPath).toBe(clip)
    expect((Path().moveTo(0, 0).lineTo(1, 1).clipPath(clip).build() as any).props.clipPath).toBe(clip)
  })
})

describe('ShapeBuilder.style merge', () => {
  it('merges .style() on top of prior CSS-like methods (does not wipe cursor/fill-in-style)', () => {
    const el = (Circle() as any).cursor('pointer').pointerEvents('none').style({ opacity: 0.5 }).build() as any
    expect(el.props.style).toMatchObject({
      cursor: 'pointer',
      pointerEvents: 'none',
      opacity: 0.5,
    })
  })

  it('merges successive .style() objects instead of replacing', () => {
    const el = Circle().style({ cursor: 'pointer' }).style({ opacity: 0.4 }).build() as any
    expect(el.props.style).toMatchObject({
      cursor: 'pointer',
      opacity: 0.4,
    })
  })

  it('lets CSS-like methods after .style() still merge', () => {
    const el = (Circle().style({ opacity: 0.2 }) as any).cursor('crosshair').build() as any
    expect(el.props.style).toMatchObject({
      opacity: 0.2,
      cursor: 'crosshair',
    })
  })
})

describe('ShapeBuilder.shadow() SVG drop-shadow', () => {
  it('strips inset from the color so drop-shadow() stays a valid SVG filter', () => {
    const el = Circle().shadow(0, -2, 4, 'rgba(0,0,0,0.05) inset').build() as any
    expect(el.props.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
    expect(el.props.filter).not.toMatch(/inset/)
  })

  it('strips a leading inset keyword as well', () => {
    const el = Circle().shadow(1, 2, 3, 'inset rgba(0,0,0,0.2)').build() as any
    expect(el.props.filter).toBe('drop-shadow(1px 2px 3px rgba(0,0,0,0.2))')
    expect(el.props.filter).not.toMatch(/inset/)
  })

  it('dropShadow() also strips inset (same CSS filter)', () => {
    const el = Rect().dropShadow(0, 2, 4, '#000 inset').build() as any
    expect(el.props.filter).toBe('drop-shadow(0px 2px 4px #000)')
    expect(el.props.filter).not.toMatch(/inset/)
  })
})
