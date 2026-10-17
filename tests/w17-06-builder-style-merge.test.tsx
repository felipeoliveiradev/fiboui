import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Box } from '../src/structure/Box'

function hostStyle(node: unknown): Record<string, unknown> {
  const el = node as { props?: { style?: Record<string, unknown> } }
  return { ...(el.props?.style ?? {}) }
}

describe('W17-06 sequential FiboBuilder .style() merge', () => {
  it('later .style({ padding }) does not clobber earlier paddingHorizontal', () => {
    const style = hostStyle(
      Box()
        .style({ paddingHorizontal: 12 } as never)
        .style({ padding: 0 })
        .children([])
        .build(),
    )
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
  })

  it('later .style({ padding }) does not clobber earlier paddingLeft', () => {
    const style = hostStyle(
      Box().style({ paddingLeft: 12 }).style({ padding: 0 }).children([]).build(),
    )
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingRight).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
  })

  it('later .style({ paddingHorizontal }) expands earlier padding shorthand', () => {
    const style = hostStyle(
      Box()
        .style({ padding: 16 })
        .style({ paddingHorizontal: 8 } as never)
        .children([])
        .build(),
    )
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('8px')
    expect(style.paddingRight).toBe('8px')
    expect(style.paddingTop).toBe('16px')
    expect(style.paddingBottom).toBe('16px')
  })

  it('sequential .css() objects merge the same way', () => {
    const style = hostStyle(
      Box()
        .css({ paddingHorizontal: 12 } as never)
        .css({ padding: 0 })
        .children([])
        .build(),
    )
    expect(style.padding).toBeUndefined()
    expect(style.paddingLeft).toBe('12px')
    expect(style.paddingRight).toBe('12px')
    expect(style.paddingTop).toBe('0px')
    expect(style.paddingBottom).toBe('0px')
  })

  it('SSR does not emit a later padding shorthand that resets axes', () => {
    const html = renderToString(
      Box()
        .style({ paddingHorizontal: 12 } as never)
        .style({ padding: 0 })
        .children([])
        .build() as never,
    )
    expect(html).toMatch(/padding-left:\s*12px/)
    expect(html).toMatch(/padding-right:\s*12px/)
    expect(html).not.toMatch(/padding:\s*0px/)
  })

  it('single .style({ boxShadow: 0, padding: 16 }) still normalizes (W10-01)', () => {
    const html = renderToString(
      Box().style({ boxShadow: 0 as never, padding: 16 }).children([]).build() as never,
    )
    expect(html).toMatch(/box-shadow:\s*none/)
    expect(html).not.toMatch(/box-shadow:\s*0px/)
    expect(html).toMatch(/padding:\s*16px/)
  })
})
