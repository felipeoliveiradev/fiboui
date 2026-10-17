import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ext = join(root, 'extensions/vscode-fiboui')

const { computeLabels } = require(join(ext, 'src/computeLabels.js'))
const { FACTORIES, sliceLooksLikeBuilder } = require(join(ext, 'src/factories.js'))
const { collectLineageRanges } = require(join(ext, 'src/lineageRanges.js'))
const methods: string[] = JSON.parse(
  readFileSync(join(ext, 'src/methods.json'), 'utf8')
)
const indexSrc = readFileSync(join(root, 'src/index.ts'), 'utf8')

const publicNames = new Set<string>()
for (const block of indexSrc.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
  for (const part of block[1].split(',')) {
    const name = part.trim().split(/\s+as\s+/)[0].trim()
    if (/^[A-Z][A-Za-z0-9]*$/.test(name)) publicNames.add(name)
  }
}

function labelNames(text: string): string[] {
  return computeLabels(text, 1).map((item: { label: string }) => item.label)
}

const SHIPPED_FACTORIES = [
  'Anchor',
  'AspectRatio',
  'AsyncImage',
  'BottomSheet',
  'Chart',
  'DatePicker',
  'Dialog',
  'Dismissible',
  'FullScreenCover',
  'Gauge',
  'MapView',
  'SafeArea',
  'Section',
  'SecureField',
  'Sheet',
  'Slider',
  'SnackBar',
  'TabView',
  'Toolbar',
  'Tooltip',
  'Wrap',
]

const SHIPPED_METHODS = [
  'enterKeyHint',
  'inputMode',
  'message',
  'min',
  'onClose',
  'onTap',
  'open',
  'step',
  'tabs',
]

describe('W26-06 vscode factory catalog', () => {
  it('completes shipped fluent factories missing from the original list', () => {
    for (const name of SHIPPED_FACTORIES) {
      expect(FACTORIES, name).toContain(name)
      expect(publicNames.has(name), name).toBe(true)
    }
  })

  it('does not resurrect removed factories', () => {
    expect(FACTORIES).not.toContain('Chip')
    expect(FACTORIES).not.toContain('IconButton')
  })
})

describe('W26-06 vscode chain-method catalog', () => {
  it('includes overlay/list/field methods used by shipped widgets', () => {
    for (const name of SHIPPED_METHODS) {
      expect(methods, name).toContain(name)
    }
  })
})

describe('W26-06 vscode closing labels for new factories', () => {
  it('labels a multi-line Dialog() chain', () => {
    const text = "Dialog()\n  .title('Delete')\n  .message('Sure?')\n  .open(true)"
    expect(labelNames(text)).toContain('Dialog')
  })

  it('labels a multi-line SnackBar() chain', () => {
    const text = "SnackBar()\n  .message('Saved')\n  .open(true)"
    expect(labelNames(text)).toContain('SnackBar')
  })
})

describe('W26-06 vscode chain-completion context', () => {
  it('does not treat function App() as a FiboUI factory', () => {
    expect(sliceLooksLikeBuilder('function App() {\n  obj.')).toBe(false)
  })

  it('does not treat new Error( as a FiboUI factory', () => {
    expect(sliceLooksLikeBuilder('throw new Error(\n  reason.')).toBe(false)
  })

  it('treats a real shipped factory call as builder context', () => {
    expect(sliceLooksLikeBuilder('Dialog()\n  .')).toBe(true)
  })

  it('treats .children( / .items( as builder context', () => {
    expect(sliceLooksLikeBuilder('  .children([\n    x.')).toBe(true)
    expect(sliceLooksLikeBuilder('  .items([\n    x.')).toBe(true)
  })
})

describe('W26-06 vscode lineage guides', () => {
  it('marks multi-line .items([ ]) the same as .children([ ])', () => {
    const text = 'List()\n  .items([\n    1,\n    2,\n  ])\n'
    const ranges = collectLineageRanges(text)
    expect(ranges.length).toBeGreaterThan(0)
    const inner = ranges.map((r: { start: number; end: number }) =>
      text.slice(r.start, r.end)
    )
    expect(inner.some((s: string) => s.includes('1,'))).toBe(true)
  })

  it('does not mark .children([ inside a string', () => {
    const text = 'const s = ".children([\\n  x\\n])"\n'
    expect(collectLineageRanges(text)).toEqual([])
  })
})
