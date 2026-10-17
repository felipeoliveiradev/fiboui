import { isValidElement, type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Icons } from '../src/core/icons'
import { Icon } from '../src/content/Icon'

afterEach(cleanup)

function svgOf(node: ReactElement): SVGSVGElement {
  const { container } = render(node)
  const svg = container.querySelector('svg')
  expect(svg).toBeTruthy()
  return svg as SVGSVGElement
}

describe('W15-07 Icons.Verify stays named through Icon()', () => {
  it('direct Verify is a named image, not aria-hidden', () => {
    expect(isValidElement(Icons.Verify)).toBe(true)
    const svg = svgOf(Icons.Verify as ReactElement)
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'Verified')
    expect(svg.getAttribute('aria-hidden')).not.toBe('true')
    expect(screen.getByRole('img', { name: 'Verified' })).toBe(svg)
  })

  it('Icon(Icons.Verify) does not hide the verified badge from AT', () => {
    const svg = svgOf(Icon(Icons.Verify).build())
    expect(svg.getAttribute('aria-hidden')).not.toBe('true')
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg).toHaveAttribute('aria-label', 'Verified')
    expect(screen.getByRole('img', { name: 'Verified' })).toBe(svg)
  })

  it('Icon(Icons.Heart) stays decorative', () => {
    const svg = svgOf(Icon(Icons.Heart).build())
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg.getAttribute('role')).not.toBe('img')
  })
})
