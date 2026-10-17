import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { computed, signal } from '../src/core/state'
import { withFiboStyles } from '../src/index'
import { Text } from '../src/content/Text'

afterEach(() => {
  cleanup()
  StyleManager.resetForTests()
})

describe('W10-01 builder CSS proxy kebab', () => {
  it('gridTemplateColumns registers grid-template-columns (not template-columns)', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        (Box() as any).gridTemplateColumns('1fr 1fr').id('g').children([])
      ) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/grid-template-columns:\s*1fr 1fr/)
    expect(css).not.toMatch(/(?<!grid-)template-columns:\s*1fr 1fr/)
    expect(html).toContain('grid-template-columns')
  })

  it('templateColumns alias registers grid-template-columns (invalid template-columns)', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        (Box() as any).templateColumns('200px 1fr').id('tc').children([])
      ) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/grid-template-columns:\s*200px 1fr/)
    expect(css).not.toMatch(/(?<!grid-)template-columns:/)
    expect(html).toContain('grid-template-columns')
  })

  it('msOverflowStyle registers -ms-overflow-style (leading dash)', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        (Box() as any).msOverflowStyle('none').id('ms').children([])
      ) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/-ms-overflow-style:\s*none/)
    expect(css).not.toMatch(/(?<![\w-])ms-overflow-style:/)
  })

  it('cssFloat registers float, not css-float', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles((Box() as any).cssFloat('left').id('fl').children([])) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/(?<![a-z-])float:\s*left/)
    expect(css).not.toMatch(/css-float:/)
  })

  it('custom property methods keep --camelCase (do not kebab)', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        (Box() as any)['--headerHeight'](48).id('var').children([])
      ) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/--headerHeight:\s*48/)
    expect(css).not.toMatch(/--header-height:/)
  })

  it('media() object keys hyphenate ms* with a leading dash', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        Box().media('md', { msOverflowStyle: 'none' } as any).children([])
      ) as any
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/-ms-overflow-style:\s*none/)
    expect(css).not.toMatch(/(?<![\w-])ms-overflow-style:/)
  })
})

describe('W10-01 .style() uses the CSS normalizer', () => {
  it('style({ boxShadow: 0, padding: 16 }) → none + 16px', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      Box().style({ boxShadow: 0 as any, padding: 16 }).children([]).build() as any
    )
    expect(html).toMatch(/box-shadow:\s*none/)
    expect(html).not.toMatch(/box-shadow:\s*0px/)
    expect(html).toMatch(/padding:\s*16px/)
  })
})

describe('W10-01 bindSignal', () => {
  it('rebuilds function children when a computed signal changes', () => {
    const count = signal(1)
    const doubled = computed(() => count.value * 2)

    render(
      Box()
        .bindSignal(doubled)
        .children(() => Text(`D:${doubled.value}`))
        .build() as any
    )

    expect(screen.getByText('D:2')).toBeInTheDocument()

    act(() => {
      count.value = 3
    })

    expect(screen.getByText('D:6')).toBeInTheDocument()
  })
})
