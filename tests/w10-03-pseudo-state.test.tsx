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
