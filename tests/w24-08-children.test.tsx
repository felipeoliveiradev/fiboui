import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildChild,
  isBuildable,
  normalizeFiboChildren,
} from '../src/core/children'
import { mergeStyles, processChildren } from '../src/core/component'
import type { Buildable, FiboChild } from '../src/core/types'
import { Box } from '../src'

afterEach(() => {
  cleanup()
})

function widget(node: FiboChild | readonly FiboChild[]): Buildable {
  return { build: () => node as ReactNode }
}

describe('W24-08 Buildable.build() ReactNode + normalizeFiboChildren', () => {
  it('flattens an array returned from Buildable.build() into dense keyed leaves', () => {
    const a = createElement('span', null, 'a')
    const b = createElement('span', null, 'b')
    const nodes = normalizeFiboChildren(widget([a, [b, null, false]]))

    expect(nodes).toHaveLength(2)
    expect(nodes.every((n) => !Array.isArray(n))).toBe(true)
    expect(nodes.every((n) => isValidElement(n))).toBe(true)
    const keys = nodes.map((n) => (isValidElement(n) ? n.key : null))
    expect(keys[0]).toBeTruthy()
    expect(keys[1]).toBeTruthy()
    expect(String(keys[0])).not.toBe(String(keys[1]))
    expect(() => createElement('div', null, ...nodes)).not.toThrow()
  })

  it('omits null / boolean from Buildable.build() so lists do not keep empty slots', () => {
    expect(normalizeFiboChildren(widget(null))).toEqual([])
    expect(normalizeFiboChildren(widget(false))).toEqual([])
    expect(normalizeFiboChildren(widget(true))).toEqual([])
    expect(normalizeFiboChildren([widget(null), 'keep'])).toEqual(['keep'])
  })

  it('keeps a string / number ReactNode from Buildable.build() as a single leaf', () => {
    expect(normalizeFiboChildren(widget('hello'))).toEqual(['hello'])
    expect(normalizeFiboChildren(widget(0))).toEqual([0])
    expect(isBuildable(widget('hello'))).toBe(true)
    expect(buildChild(widget('hello'))).toBe('hello')
  })

  it('assembles a nested Buildable returned from build()', () => {
    const inner = widget(createElement('span', null, 'nested-leaf'))
    const nodes = normalizeFiboChildren(widget(inner))
    expect(nodes).toHaveLength(1)
    expect(isValidElement(nodes[0])).toBe(true)
    expect((nodes[0] as ReactElement).props.children).toBe('nested-leaf')
  })

  it('paints every leaf from a plain Buildable array (not stamped Fibo builders)', () => {
    render(
      Box()
        .children(() =>
          widget([
            widget(createElement('span', null, 'w24-leaf-a')),
            widget(createElement('span', null, 'w24-leaf-b')),
          ]),
        )
        .build() as ReactElement,
    )
    expect(screen.getByText('w24-leaf-a')).toBeInTheDocument()
    expect(screen.getByText('w24-leaf-b')).toBeInTheDocument()
  })

  it('processChildren is the same flatten for FiboChildren factories', () => {
    const nodes = processChildren(() => widget([createElement('i', null, 'x'), null]))
    expect(nodes).toHaveLength(1)
    expect(isValidElement(nodes[0])).toBe(true)
  })
})

describe('W24-08 mergeStyles', () => {
  it('later overlay wins, skips holes, and does not mutate inputs', () => {
    const base = { color: 'red', fontSize: 12 }
    const overlay = { color: 'blue' }
    const merged = mergeStyles(base, undefined, overlay)

    expect(merged).toEqual({ color: 'blue', fontSize: 12 })
    expect(base.color).toBe('red')
    expect(mergeStyles(undefined, overlay).color).toBe('blue')
    expect(mergeStyles()).toEqual({})
  })
})
