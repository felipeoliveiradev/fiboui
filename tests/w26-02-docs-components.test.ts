import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Text } from '../src/content/Text'
import { StyleManager } from '../src/core/styleManager'
import { Box } from '../src/structure/Box'

const DOCS = join(process.cwd(), 'docs/components')

function allDocs(): [string, string][] {
  return readdirSync(DOCS)
    .filter((name) => name.endsWith('.md'))
    .map((name) => [name, readFileSync(join(DOCS, name), 'utf8')])
}

function readDoc(name: string): string {
  return readFileSync(join(DOCS, name), 'utf8')
}

/** Tailwind-ish palette tokens (`blue-600`, `red-100`) — not CSS colors. */
const TAILWIND_PALETTE = /\.(?:color|bg|backgroundColor)\(\s*['"][a-z]+-\d{2,3}['"]\s*\)/g

describe('W26-02 component docs vs CSS fluent', () => {
  it('builder stamps palette tokens as raw CSS, not Tailwind utilities', () => {
    StyleManager.resetForTests()
    Text('x').color('blue-600')
    Box().bg('red-100')
    const css = StyleManager.getInstance().getCss()
    expect(css).toMatch(/color:\s*blue-600/)
    expect(css).toMatch(/background-color:\s*red-100/)
    expect(css).not.toMatch(/\.text-blue-600/)
    expect(css).not.toMatch(/\.bg-red-100/)
  })

  it('docs do not pass Tailwind palette tokens to .color/.bg', () => {
    const hits: string[] = []
    for (const [name, md] of allDocs()) {
      const found = md.match(TAILWIND_PALETTE)
      if (found) hits.push(`${name}: ${[...new Set(found)].join(', ')}`)
    }
    expect(hits).toEqual([])
  })

  it('content-text.md does not claim .color() accepts Tailwind palette', () => {
    const md = readDoc('content-text.md')
    expect(md).not.toMatch(/Sets text color \(Tailwind or CSS\)/)
  })

  it('interactive-button.md does not advertise a loading API', () => {
    const md = readDoc('interactive-button.md')
    expect(md).not.toMatch(/loading states/)
    expect(md).not.toMatch(/\.loading\(/)
  })

  it('layout-advanced.md does not call Line an alias for Row', () => {
    const md = readDoc('layout-advanced.md')
    expect(md).not.toMatch(/alias for Row/i)
    expect(md).toMatch(/\.direction\(/)
  })
})
