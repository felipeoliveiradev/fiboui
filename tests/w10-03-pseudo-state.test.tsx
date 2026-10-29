import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Box } from '../src/structure/Box'
import { StyleManager } from '../src/core/styleManager'
import { withFiboStyles } from '../src/index'
import type { PseudoStateBuilder } from '../src/core/PseudoStateBuilder'

describe('PseudoStateBuilder backgroundColor', () => {
  it('hover.backgroundColor emits kebab background-color and prepares a smooth transition', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        Box()
          .hover((h: PseudoStateBuilder) => h.backgroundColor('#f00'))
          .children([]),
      ) as never,
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/background-color:\s*#f00/)
    expect(css).not.toMatch(/backgroundColor/)
    expect(css).toMatch(/transition:[^;]*background-color/)
    expect(html).toMatch(/fibo-ps-/)
  })

  it('when(hover) is hover paint', () => {
    StyleManager.resetForTests()
    const html = renderToString(
      withFiboStyles(
        Box().when('hover', (h) => h.bg('#c8ff00')).children([]),
      ) as never,
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/\.fibo-ps-[a-z0-9]+:hover\s*\{[^}]*background-color:\s*#c8ff00/i)
    expect(html).toMatch(/fibo-ps-/)
  })

  it('hover color also paints descendants so a child Text color yields', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(Box().when('hover', (h) => h.color('#000')).children([])) as never,
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/\.fibo-ps-[a-z0-9]+:hover \* \{[^}]*color:\s*#000 !important/i)
  })

  it('press.css({ boxShadow }) accepts an object like Box().css({})', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        Box()
          .press((s: PseudoStateBuilder) =>
            s.scale(0.97).css({ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }),
          )
          .children([]),
      ) as never,
    )
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/box-shadow:\s*0 4px 10px rgba\(0,0,0,0\.2\)/)
    expect(css).toMatch(/transform:[^;]*scale\(0\.97\)/)
  })

  it('hover.bg and hover.backgroundColor are the same longhand', () => {
    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(Box().hover((h) => h.bg('#0f0')).children([])) as never,
    )
    const viaBg = StyleManager.getInstance().getCss()

    StyleManager.resetForTests()
    renderToString(
      withFiboStyles(
        Box().hover((h: PseudoStateBuilder) => h.backgroundColor('#0f0')).children([]),
      ) as never,
    )
    const viaColor = StyleManager.getInstance().getCss()
    expect(viaBg).toMatch(/background-color:\s*#0f0/)
    expect(viaColor).toMatch(/background-color:\s*#0f0/)
  })
})
