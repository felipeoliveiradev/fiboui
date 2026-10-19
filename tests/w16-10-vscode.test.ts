import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ext = join(root, 'extensions/vscode-fiboui')
const methods: string[] = JSON.parse(
  readFileSync(join(ext, 'src/methods.json'), 'utf8')
)

describe('W16-10 vscode completions catalog', () => {
  it('includes shipped List.empty / TextField.clear / itemStyle insets+boxShadow', () => {
    expect(methods).toContain('empty')
    expect(methods).toContain('clear')
    expect(methods).toContain('insets')
    expect(methods).toContain('boxShadow')
  })

  it('completes token members for chain arguments', () => {
    const catalog = JSON.parse(readFileSync(join(ext, 'src/tokens.json'), 'utf8')) as {
      tokens: Record<string, Record<string, string>>
      methods: Record<string, string[]>
    }
    expect(catalog.methods.align).toContain('Align')
    expect(catalog.tokens.Align.center).toBe('center')
    expect(catalog.tokens.Effect.sweepToRight).toBe('sweepToRight')
    expect(catalog.tokens.When.hover).toBe('hover')
    const src = readFileSync(join(ext, 'src/completions.js'), 'utf8')
    expect(src).toContain('tokens.json')
    expect(src).toContain('argumentCompletions')
  })
})
