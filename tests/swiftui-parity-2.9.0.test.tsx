import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  Box,
  GeometryReader,
  matchedGeometryKeys,
  matchedGeometryRect,
  Text,
} from '../src'

afterEach(cleanup)

describe('alignmentGuide', () => {
  it('wraps with data-fibo-align-guide and CSS var', () => {
    const { container } = render(
      Text('g').alignmentGuide('leading', 12).build()
    )
    const host = container.querySelector('.fibo-alignment-guide') as HTMLElement
    expect(host).toBeTruthy()
    expect(host.getAttribute('data-fibo-align-guide')).toBe('leading')
    expect(host.style.getPropertyValue('--fibo-align-leading')).toBe('12px')
  })

  it('accepts compute from dimensions', () => {
    const { container } = render(
      Text('c').alignmentGuide('centerX', (d) => d.width / 2).build()
    )
    expect(container.querySelector('[data-fibo-align-guide="centerX"]')).toBeTruthy()
  })
})

describe('matchedGeometryEffect', () => {
  it('registers id and view-transition-name', () => {
    const { container } = render(
      Box()
        .matchedGeometryEffect('hero', { namespace: 'gallery', isSource: true })
        .children(Text('src'))
        .build()
    )
    const host = container.querySelector('.fibo-matched-geometry') as HTMLElement
    expect(host.getAttribute('data-fibo-matched-id')).toBe('hero')
    expect(host.getAttribute('data-fibo-matched-ns')).toBe('gallery')
    expect(host.getAttribute('data-fibo-matched-source')).toBe('1')
    expect(matchedGeometryKeys()).toContain('gallery::hero')
    expect(matchedGeometryRect('hero', 'gallery')).toBeTruthy()
  })
})

describe('containerRelativeFrame', () => {
  it('marks axis / count / span', () => {
    const { container } = render(
      Box()
        .frame({ width: 200, height: 100 })
        .children(
          Text('half').containerRelativeFrame({ axis: 'horizontal', count: 2, span: 1 })
        )
        .build()
    )
    const host = container.querySelector('.fibo-container-relative-frame') as HTMLElement
    expect(host.getAttribute('data-fibo-crf-axis')).toBe('horizontal')
    expect(host.getAttribute('data-fibo-crf-count')).toBe('2')
    expect(host.getAttribute('data-fibo-crf-span')).toBe('1')
  })
})

describe('GeometryProxy.safeAreaInsets', () => {
  it('exposes numeric inset fields on the proxy', () => {
    let seen: { top: number; bottom: number; leading: number; trailing: number } | null =
      null
    render(
      GeometryReader()
        .builder((proxy) => {
          seen = proxy.safeAreaInsets
          return Text(`${proxy.width}`)
        })
        .build()
    )
    expect(seen).toEqual(
      expect.objectContaining({
        top: expect.any(Number),
        bottom: expect.any(Number),
        leading: expect.any(Number),
        trailing: expect.any(Number),
      })
    )
  })
})
