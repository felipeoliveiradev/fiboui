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
})
