import { describe, expect, it } from 'vitest'
import { Circle, Rect } from '../src/graphics'

describe('W27-01 ShapeBuilder.shadow(0) matches FiboBuilder none (no crash)', () => {
  it('1-arg shadow(0) does not throw and clears the SVG filter', () => {
    expect(() => Circle().shadow(0 as any).build()).not.toThrow()
    const el = Circle().shadow(0 as any).build() as any
    expect(el.props.filter == null || el.props.filter === 'none').toBe(true)
    expect(String(el.props.filter ?? '')).not.toMatch(/undefined|NaN/)
  })

  it('1-arg dropShadow(0) is the same none, not drop-shadow(0px undefined…)', () => {
    const el = Rect().dropShadow(0 as any).build() as any
    expect(el.props.filter == null || el.props.filter === 'none').toBe(true)
    expect(String(el.props.filter ?? '')).not.toMatch(/undefined/)
  })

  it('4-arg shadow(0, dy, blur, color) still paints an outer drop-shadow', () => {
    const el = Circle().shadow(0, -2, 4, 'rgba(0,0,0,0.05)').build() as any
    expect(el.props.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
  })
})

describe('W27-01 css()/style() last-write vs SVG presentation attrs', () => {
  it('css("transform") after SVG rotate() clears the transform attribute (last write)', () => {
    const el = Circle().rotate(15, 10, 10).css('transform', 'rotateX(45deg)').build() as any
    expect(el.props.style?.transform).toBe('rotateX(45deg)')
    expect(el.props.transform).toBeUndefined()
  })

  it('style({ transform }) after SVG rotate() also last-writes', () => {
    const el = Circle().rotate(10).style({ transform: 'perspective(200px)' }).build() as any
    expect(el.props.style?.transform).toBe('perspective(200px)')
    expect(el.props.transform).toBeUndefined()
  })

  it('css("filter", drop-shadow inset) strips inset (CSS filter rejects it too)', () => {
    const el = Circle()
      .css('filter', 'drop-shadow(0px -2px 4px rgba(0,0,0,0.05) inset)')
      .build() as any
    expect(el.props.style.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
    expect(el.props.style.filter).not.toMatch(/inset/)
    expect(el.props.filter).toBeUndefined()
  })

  it('style({ filter: drop-shadow inset }) strips inset and last-writes over SVG filter()', () => {
    const el = Circle()
      .filter('blur(2px)')
      .style({ filter: 'drop-shadow(0px 1px 2px #000 inset)' })
      .build() as any
    expect(el.props.style.filter).toBe('drop-shadow(0px 1px 2px #000)')
    expect(el.props.style.filter).not.toMatch(/inset/)
    expect(el.props.filter).toBeUndefined()
  })
})
