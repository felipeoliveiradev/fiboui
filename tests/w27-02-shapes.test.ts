import { describe, expect, it } from 'vitest'
import { Circle, Path, Rect } from '../src/graphics'

describe('W27-02 rotateSelf/rotateAround last-write vs CSS 3D', () => {
  it('Circle.rotateSelf after rotateX clears style.transform (SVG attr wins)', () => {
    const el = Circle().center(10, 20).rotateX(45).rotateSelf(15).build() as any
    expect(el.props.transform).toBe('rotate(15 10 20)')
    expect(el.props.style?.transform).toBeUndefined()
  })

  it('Circle.rotateAround after rotateX also last-writes', () => {
    const el = Circle().rotateX(45).rotateAround(10, 3, 4).build() as any
    expect(el.props.transform).toBe('rotate(10 3 4)')
    expect(el.props.style?.transform).toBeUndefined()
  })

  it('Rect.rotateSelf after rotateX rotates about the rect center', () => {
    const el = Rect().position(10, 20).size(40, 30).rotateX(45).rotateSelf(15).build() as any
    expect(el.props.transform).toBe('rotate(15 30 35)')
    expect(el.props.style?.transform).toBeUndefined()
  })
})

describe('W27-02 Rect individual corners inherit uniform radius', () => {
  it('cornerRadius then cornerRadiusTopLeft keeps the other three corners', () => {
    const el = Rect()
      .position(0, 0)
      .size(100, 80)
      .cornerRadius(10)
      .cornerRadiusTopLeft(20)
      .build() as any
    expect(el.type).toBe('path')
    const d = String(el.props.d ?? '')
    // TL=20 → start at x+tl; TR inherits 10 → top edge ends at width-tr
    expect(d).toContain('M 20 0')
    expect(d).toContain('L 90 0')
    expect(d).not.toContain('L 100 0')
    // BR/BL inherit 10, not collapse to 0
    expect(d).toContain('L 100 70')
    expect(d).toContain('L 10 80')
  })

  it('explicit cornerRadiusTopLeft(0) after cornerRadius stays square on that corner', () => {
    const el = Rect()
      .size(100, 80)
      .cornerRadius(10)
      .cornerRadiusTopLeft(0)
      .build() as any
    const d = String(el.props.d ?? '')
    expect(d).toContain('M 0 0')
    expect(d).toContain('L 90 0')
  })

  it('cornerRadii after a per-corner radius wins (native rect, like cornerRadius)', () => {
    const el = Rect().size(40, 20).cornerRadiusTopLeft(8).cornerRadii(4, 2).build() as any
    expect(el.type).toBe('rect')
    expect(el.props.rx).toBe(4)
    expect(el.props.ry).toBe(2)
    expect(el.props.d).toBeUndefined()
  })
})

describe('W27-02 Circle/Rect geometry does not stamp NaN/Infinity', () => {
  it('Circle center/radius NaN stay valid SVG numbers (defaults, like Path skip)', () => {
    const el = Circle().center(NaN, 10).radius(Infinity).build() as any
    expect(String(el.props.cx)).not.toMatch(/NaN|Infinity/)
    expect(String(el.props.cy)).not.toMatch(/NaN|Infinity/)
    expect(String(el.props.r)).not.toMatch(/NaN|Infinity/)
    expect(el.props.cx).toBe(0)
    expect(el.props.cy).toBe(0)
    expect(el.props.r).toBe(10)
  })

  it('Rect x/width NaN stay valid SVG numbers', () => {
    const el = Rect().x(NaN).y(5).width(Infinity).height(20).build() as any
    expect(String(el.props.x)).not.toMatch(/NaN|Infinity/)
    expect(String(el.props.width)).not.toMatch(/NaN|Infinity/)
    expect(el.props.x).toBe(0)
    expect(el.props.y).toBe(5)
    expect(el.props.width).toBe(100)
    expect(el.props.height).toBe(20)
  })

  it('Path still skips non-finite commands (no regression)', () => {
    const el = Path().moveTo(NaN, 0).lineTo(2, 3).build() as any
    expect(String(el.props.d ?? '')).not.toMatch(/NaN|Infinity/)
    expect(el.props.d).toContain('L 2 3')
  })
})
