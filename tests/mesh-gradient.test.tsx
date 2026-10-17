import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MeshGradient } from '../src/graphics/gradients/MeshGradient'

afterEach(() => {
  cleanup()
})

describe('MeshGradient', () => {
  it('paints a div with at least two radial-gradients', () => {
    const { container } = render(
      MeshGradient()
        .colors(['#ff6a2a', '#0b6e99', '#f0b429', '#1a0b08'])
        .width(200)
        .height(120) as never,
    )

    const node = container.querySelector('[role="img"]')
    expect(node).not.toBeNull()
    expect(node).toHaveAttribute('aria-label', 'Mesh gradient')
    expect(node?.tagName).toBe('DIV')

    const background = (node as HTMLElement).style.background
    const matches = background.match(/radial-gradient/g) ?? []
    expect(background).toContain('radial-gradient')
    expect(matches.length).toBeGreaterThanOrEqual(2)
    expect(background).toContain('#ff6a2a')
    expect(background).toContain('#0b6e99')
    expect(background).toContain('#f0b429')
    expect(background).toContain('#1a0b08')
  })
})
