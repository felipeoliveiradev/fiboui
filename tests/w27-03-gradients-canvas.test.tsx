import { Children, isValidElement, type ReactElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { Canvas, LinearGradient, Rect } from '../src/graphics'
import { MeshGradient } from '../src/graphics/gradients/MeshGradient'

afterEach(cleanup)

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

function gradientCoords(node: ReactElement) {
  const g = findType(node, 'linearGradient')
  expect(g).toBeTruthy()
  return g.props as { x1: string; y1: string; x2: string; y2: string; id: string }
}

describe('W27-03 Canvas leftover — dangerouslySetInnerHTML XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML when children exist', () => {
    expect(() =>
      render(
        Canvas()
          .size(32, 32)
          .children([Rect().size(32, 32).fill('#111')])
          .props({
            dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
          })
          .build(),
      ),
    ).not.toThrow()
    expect(document.querySelector('[data-xss]')).toBeNull()
    expect(document.querySelector('img')).toBeNull()
    expect(document.querySelector('rect')).not.toBeNull()
  })

  it('empty Canvas is not an HTML injection hole', () => {
    const { container } = render(
      Canvas()
        .size(16, 16)
        .props({
          dangerouslySetInnerHTML: {
            __html: '<img data-xss="1" src="x" onerror="window.__w2703=1">',
          },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect((window as { __w2703?: number }).__w2703).toBeUndefined()
    expect(container.querySelector('svg.fibo-canvas')).not.toBeNull()
  })

  it('SSR does not emit injected markup from dangerouslySetInnerHTML', () => {
    const html = renderToString(
      Canvas()
        .size(8, 8)
        .children([Rect().size(8, 8).fill('#000')])
        .props({
          dangerouslySetInnerHTML: { __html: '<script>alert(1)</script>' },
        }) as any,
    )
    expect(html.toLowerCase()).not.toContain('<script')
    expect(html).toContain('<rect')
  })
})

describe('W27-03 MeshGradient leftover — dangerouslySetInnerHTML XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML', () => {
    const { container } = render(
      MeshGradient()
        .colors(['#ff6a2a', '#0b6e99'])
        .width(80)
        .height(40)
        .props({
          dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
        })
        .build(),
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    const node = container.querySelector('.fibo-mesh-gradient')
    expect(node).not.toBeNull()
    expect(node?.tagName).toBe('DIV')
  })
})

describe('W27-03 LinearGradient / Canvas do not stamp NaN/Infinity', () => {
  it('angle(NaN/Infinity) keeps valid SVG percents (default 0deg, like Path skip)', () => {
    const nan = LinearGradient().id('nan-a').angle(NaN).build() as ReactElement
    const inf = LinearGradient().id('inf-a').angle(Infinity).build() as ReactElement
    for (const node of [nan, inf]) {
      const c = gradientCoords(node)
      expect(`${c.x1}${c.y1}${c.x2}${c.y2}`).not.toMatch(/NaN|Infinity|undefined/)
    }
    const zero = gradientCoords(LinearGradient().id('zero-a').angle(0).build() as ReactElement)
    expect(gradientCoords(nan)).toEqual(expect.objectContaining({ x1: zero.x1, y1: zero.y1, x2: zero.x2, y2: zero.y2 }))
  })

  it('Canvas size(NaN, Infinity) stays valid SVG numbers', () => {
    const html = renderToString(Canvas().size(NaN, Infinity) as any)
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
    expect(html).toContain('width="100"')
    expect(html).toContain('height="100"')
    expect(html).toContain('viewBox="0 0 100 100"')
  })

  it('Canvas width/height undefined does not write "undefined" into viewBox', () => {
    const html = renderToString(Canvas().width(undefined as any).height(undefined as any) as any)
    expect(html).not.toMatch(/undefined|NaN|Infinity/)
    expect(html).toContain('viewBox="0 0 100 100"')
  })
})

describe('W27-03 LinearGradient.colors() does not crash / emit invalid stops', () => {
  it('colors(undefined/null/[]) does not throw and still emits finite stop offsets', () => {
    expect(() => LinearGradient().colors(undefined as any).build()).not.toThrow()
    expect(() => LinearGradient().colors(null as any).build()).not.toThrow()
    expect(() => LinearGradient().colors([]).build()).not.toThrow()
    for (const node of [
      LinearGradient().id('u').colors(undefined as any).build(),
      LinearGradient().id('n').colors(null as any).build(),
      LinearGradient().id('e').colors([]).build(),
    ]) {
      expect(isValidElement(node)).toBe(true)
      const gradient = findType(node, 'linearGradient')
      const stops = childArray(gradient)
      expect(stops.length).toBeGreaterThanOrEqual(1)
      for (const stop of stops) {
        expect(String(stop.props.offset)).not.toMatch(/NaN|Infinity|undefined/)
        expect(typeof stop.props.stopColor).toBe('string')
        expect(stop.props.stopColor).toBeTruthy()
      }
    }
  })
})

describe('W27-03 MeshGradient.colors() does not crash', () => {
  it('colors(undefined/null) still paints radial-gradient layers', () => {
    expect(() => MeshGradient().colors(undefined as any).build()).not.toThrow()
    expect(() => MeshGradient().colors(null as any).build()).not.toThrow()
    const { container } = render(MeshGradient().colors(undefined as any).width(40).height(20).build())
    const node = container.querySelector('.fibo-mesh-gradient') as HTMLElement | null
    expect(node).not.toBeNull()
    const image = node!.style.backgroundImage
    expect(image).toContain('radial-gradient')
    expect(image).not.toMatch(/undefined|NaN/)
  })
})
