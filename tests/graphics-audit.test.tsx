import { Children, isValidElement, type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BurgerIcon, Canvas, Circle, LinearGradient, Path, Rect } from '../src/graphics'

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

describe('LinearGradient is a real SVG node', () => {
  it('build() returns a valid React element, not a {element,id} bag', () => {
    const node = LinearGradient().id('warm').colors(['#f00', '#00f']).build()
    expect(isValidElement(node)).toBe(true)
    expect(node).not.toHaveProperty('element')
    const gradient = findType(node, 'linearGradient')
    expect(gradient).toBeTruthy()
    expect(gradient.props.id).toBe('warm')
  })

  it('does not emit Infinity/NaN stop offsets for a single color', () => {
    const node = LinearGradient().id('solo').colors(['#abc']).build() as ReactElement
    const gradient = findType(node, 'linearGradient')
    const stops = childArray(gradient)
    expect(stops.length).toBe(1)
    expect(String(stops[0].props.offset)).not.toMatch(/Infinity|NaN/)
  })

  it('renders as a Canvas child without throwing (SSR + client)', () => {
    const tree = Canvas()
      .size(40, 40)
      .children([
        LinearGradient().id('g').colors(['#f00', '#0f0']),
        Circle().center(20, 20).radius(10).fill('url(#g)'),
      ])
    expect(() => renderToString(tree)).not.toThrow()
    const html = renderToString(tree)
    expect(html).toContain('linearGradient')
    expect(html).toContain('id="g"')
    expect(() => render(tree)).not.toThrow()
  })
})

describe('ShapeBuilder.fill(LinearGradient)', () => {
  it('sets fill to url(#id) instead of stringifying the id() method', () => {
    const el = Circle()
      .fill(LinearGradient().id('paint').colors(['#f00', '#00f']))
      .build() as any
    const circle = el.type === 'circle' ? el : findType(el, 'circle')
    expect(circle.props.fill).toBe('url(#paint)')
    expect(String(circle.props.fill)).not.toContain('function')
  })
})

describe('Canvas SVG host attrs + SSR', () => {
  it('forwards id, role, aria-label, preserveAspectRatio, overflow', () => {
    const html = renderToString(
      Canvas()
        .size(32, 16)
        .id('chart')
        .preserveAspectRatio('xMidYMid meet')
        .props({ role: 'img', 'aria-label': 'spark' })
        .children([Rect().size(32, 16).fill('#111')]) as any
    )
    expect(html).toContain('id="chart"')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="spark"')
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"')
    expect(html).toContain('overflow="visible"')
    expect(html).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('SSRs Circle/Path without window', () => {
    const html = renderToString(
      Canvas()
        .width(10)
        .height(10)
        .children([
          Circle().radius(3).clipPath('url(#c)'),
          Path().moveTo(0, 0).lineTo(10, 10).stroke('#fff'),
        ]) as any
    )
    expect(html).toContain('<circle')
    expect(html).toContain('<path')
    expect(html).toContain('clip-path="url(#c)"')
  })
})

describe('BurgerIcon', () => {
  it('renders to SVG on the server without throwing', () => {
    expect(() => renderToString(BurgerIcon().size(48))).not.toThrow()
    const html = renderToString(BurgerIcon().size(48))
    expect(html).toContain('<svg')
    expect(html).toContain('fibo-canvas')
  })

  it('does not emit invalid drop-shadow(... inset) on SVG filter', () => {
    const html = renderToString(BurgerIcon().size(48))
    expect(html).not.toMatch(/drop-shadow\([^)]*\binset\b/)
    expect(html).toContain('drop-shadow(0px -2px 4px rgba(0,0,0,0.05))')
  })
})

