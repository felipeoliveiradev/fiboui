import { Children, isValidElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Canvas, Circle, LinearGradient, Path } from '../src/graphics'

function childArray(node: any): any[] {
  if (!node) return []
  return Children.toArray(node.props?.children ?? [])
}

function findType(node: any, type: string): any | undefined {
  if (!node) return undefined
  if (node.type === type) return node
  for (const child of childArray(node)) {
    const hit = findType(child, type)
    if (hit) return hit
  }
  return undefined
}

describe('LinearGradient auto ids do not collide', () => {
  it('two same-paint gradients without .id() get distinct SVG ids', () => {
    const a = LinearGradient().colors(['#f00', '#00f']).build() as ReactElement
    const b = LinearGradient().colors(['#f00', '#00f']).build() as ReactElement
    const idA = findType(a, 'linearGradient')?.props?.id
    const idB = findType(b, 'linearGradient')?.props?.id
    expect(idA).toEqual(expect.any(String))
    expect(idB).toEqual(expect.any(String))
    expect(idA).toBeTruthy()
    expect(idB).toBeTruthy()
    expect(idA).not.toBe(idB)
  })

  it('explicit .id() still wins', () => {
    const node = LinearGradient().id('warm').colors(['#f00', '#00f']).build()
    expect(findType(node, 'linearGradient').props.id).toBe('warm')
  })

  it('fill() urls match embedded defs and stay unique in one Canvas', () => {
    const tree = Canvas()
      .size(40, 40)
      .children([
        Circle().center(10, 10).radius(8).fill(LinearGradient().colors(['#f00', '#00f'])),
        Circle().center(30, 30).radius(8).fill(LinearGradient().colors(['#f00', '#00f'])),
      ])
    const html = renderToString(tree as ReactElement)
    const ids = [...html.matchAll(/<linearGradient[^>]*\sid="([^"]+)"/g)].map((m) => m[1])
    expect(ids.length).toBe(2)
    expect(new Set(ids).size).toBe(2)
    for (const id of ids) {
      expect(html).toContain(`fill="url(#${id})"`)
    }
  })
})

describe('Path d does not crash / emit invalid SVG', () => {
  it('build() with no commands does not throw', () => {
    expect(() => Path().build()).not.toThrow()
    const el = Path().build() as any
    expect(isValidElement(el)).toBe(true)
    expect(el.props.d == null || el.props.d === '').toBe(true)
  })

  it('d(undefined/null/non-string) does not throw on trim', () => {
    expect(() => Path().d(undefined as any).build()).not.toThrow()
    expect(() => Path().d(null as any).build()).not.toThrow()
    expect(() => Path().d(0 as any).build()).not.toThrow()
    const el = Path().d(undefined as any).build() as any
    expect(el.props.d == null || el.props.d === '').toBe(true)
    expect(String(el.props.d ?? '')).not.toMatch(/undefined|null/)
  })

  it('NaN/Infinity coordinates are not written into d', () => {
    const el = Path().moveTo(NaN, 0).lineTo(1, Infinity).lineTo(2, 3).build() as any
    expect(String(el.props.d ?? '')).not.toMatch(/NaN|Infinity|undefined/)
    expect(el.props.d).toContain('L 2 3')
  })

  it('d(undefined) then moveTo still builds a valid path', () => {
    const el = Path().d(undefined as any).moveTo(0, 0).lineTo(4, 4).build() as any
    expect(el.props.d).toBe('M 0 0 L 4 4')
    expect(el.props.d).not.toMatch(/undefined/)
  })
})

describe('Canvas SSR', () => {
  it('SSRs empty canvas, empty Path, and two auto gradients without window', () => {
    expect(() => renderToString(Canvas().size(8, 8) as any)).not.toThrow()
    expect(() => renderToString(Canvas().children(Path()) as any)).not.toThrow()
    const html = renderToString(
      Canvas()
        .size(20, 20)
        .children([
          Path().d(null as any),
          LinearGradient().colors(['#000', '#fff']),
          LinearGradient().colors(['#000', '#fff']),
        ]) as any,
    )
    expect(html).toContain('<svg')
    expect(html).toContain('xmlns="http://www.w3.org/2000/svg"')
    const ids = [...html.matchAll(/<linearGradient[^>]*\sid="([^"]+)"/g)].map((m) => m[1])
    expect(ids.length).toBe(2)
    expect(new Set(ids).size).toBe(2)
  })

  it('SSRs fill(LinearGradient) without explicit id', () => {
    const html = renderToString(
      Canvas()
        .size(16, 16)
        .children([Circle().radius(6).fill(LinearGradient().colors(['#111', '#eee']))]) as any,
    )
    expect(html).toContain('linearGradient')
    expect(html).toMatch(/fill="url\(#/)
    expect(html).not.toContain('function')
  })
})

describe('drop-shadow inset stays stripped', () => {
  it('Circle.shadow() never emits inset in the SVG filter', () => {
    const el = Circle().shadow(0, -2, 4, 'rgba(0,0,0,0.05) inset').build() as any
    const circle = el.type === 'circle' ? el : findType(el, 'circle')
    expect(circle.props.filter).toBe('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
    expect(circle.props.filter).not.toMatch(/inset/)
  })
})
