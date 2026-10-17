import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ext = join(root, 'extensions/vscode-fiboui')

const { computeLabels } = require(join(ext, 'src/computeLabels.js'))
const { suggestIndent } = require(join(ext, 'src/suggestIndent.js'))

const theme = JSON.parse(
  readFileSync(join(ext, 'themes/fiboui-noir-color-theme.json'), 'utf8')
)
const pkg = JSON.parse(readFileSync(join(ext, 'package.json'), 'utf8'))
const snippets = JSON.parse(readFileSync(join(ext, 'snippets/fiboui.json'), 'utf8'))
const methods: string[] = JSON.parse(
  readFileSync(join(ext, 'src/methods.json'), 'utf8')
)

const VSCODE_LANG_IDS = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
]

function labelNames(text: string): string[] {
  return computeLabels(text, 1).map((item: { label: string }) => item.label)
}

function labelLine(text: string, name: string): number | undefined {
  const hit = computeLabels(text, 1).find((item: { label: string }) => item.label === name)
  if (!hit) return undefined
  return text.slice(0, hit.offset).split('\n').length
}

describe('W8-08 vscode closing labels', () => {
  it('does not label a factory inside a template string', () => {
    const text = 'const s = `\nColumn()\n  .gap(1)\n`'
    expect(labelNames(text)).not.toContain('Column')
  })

  it('does not label a factory inside a line comment', () => {
    const text = '// Column()\n  .gap(12)'
    expect(labelNames(text)).not.toContain('Column')
  })

  it('skips a line comment between fluent methods', () => {
    const text = "Column()\n  .padding(8) // tight\n  .children([\n    Text('a'),\n  ])"
    expect(labelLine(text, 'Column')).toBe(5)
  })

  it('does not end the chain on a parenthesis inside a block comment', () => {
    const text = "Column().children([\n  /* ) */\n  Text('a'),\n])"
    expect(labelLine(text, 'Column')).toBe(4)
  })
})

describe('W8-08 vscode theme tokens', () => {
  const scopes = theme.tokenColors.flatMap((rule: { scope?: string | string[] }) =>
    Array.isArray(rule.scope) ? rule.scope : rule.scope ? [rule.scope] : []
  )

  it('styles entity.name.function without a language suffix (semantic fallback)', () => {
    expect(scopes).toContain('entity.name.function')
  })

  it('styles JS/JSX function scopes, not only ts/tsx', () => {
    expect(scopes).toContain('entity.name.function.js')
    expect(scopes).toContain('entity.name.function.jsx')
  })

  it('sets semanticTokenColors so TS factories stay teal and chain methods stay white', () => {
    expect(theme.semanticHighlighting).toBe(true)
    expect(theme.semanticTokenColors?.function).toBe('#4EC9B0')
    expect(theme.semanticTokenColors?.method).toBe('#F4F4F5')
  })

  it('sets unnumbered indent-guide tokens as fallback for editorIndentGuide.background', () => {
    expect(theme.colors['editorIndentGuide.background']).toBe('#3F3F46')
    expect(theme.colors['editorIndentGuide.activeBackground']).toBe('#4EC9B0')
  })
})

describe('W8-08 vscode language ids', () => {
  it('contributes snippets under VS Code language ids, not ts/tsx/js/jsx aliases', () => {
    const langs = pkg.contributes.snippets.map((s: { language: string }) => s.language)
    expect([...langs].sort()).toEqual([...VSCODE_LANG_IDS].sort())
    expect(langs.some((id: string) => ['ts', 'tsx', 'js', 'jsx'].includes(id))).toBe(false)
  })

  it('activates on the same four language ids', () => {
    const events: string[] = pkg.activationEvents
    for (const id of VSCODE_LANG_IDS) {
      expect(events).toContain(`onLanguage:${id}`)
    }
  })
})

describe('W8-08 vscode snippets', () => {
  it('bodies use 2-space indent and never call .build()', () => {
    for (const [name, snip] of Object.entries(snippets) as [string, { body: string | string[] }][]) {
      const text = Array.isArray(snip.body) ? snip.body.join('\n') : String(snip.body)
      expect(text, name).not.toContain('\t')
      expect(text, name).not.toMatch(/\.build\s*\(/)
    }
  })
})

describe('W8-08 vscode Enter indent (no regress)', () => {
  const unit = '  '
  it('deepens after .children([', () => {
    expect(suggestIndent('  .children([', '', '  ', 2, unit)).toBe('    ')
  })
  it('deepens after a factory then a continuation dot', () => {
    expect(suggestIndent('Column()', '', '', 2, unit)).toBe('  ')
  })
  it('keeps chain indent on .gap(12)', () => {
    expect(suggestIndent('  .gap(12)', '', '  ', 2, unit)).toBe('  ')
  })
  it('ignores a comment that looks like children open', () => {
    expect(suggestIndent('  // .children([', '', '  ', 2, unit)).toBeNull()
  })
  it('indents .children under renderItem factory on the same line', () => {
    expect(
      suggestIndent('      .renderItem((item) => Row()', '.children([', '      ', 2, unit)
    ).toBe('        ')
  })
})

describe('W8-08 vscode completions catalog', () => {
  it('includes shipped helper / grid template methods', () => {
    expect(methods).toContain('helper')
    expect(methods).toContain('clearable')
    expect(methods).toContain('templateColumns')
    expect(methods).toContain('templateRows')
    expect(methods).toContain('autoFlow')
  })
})
