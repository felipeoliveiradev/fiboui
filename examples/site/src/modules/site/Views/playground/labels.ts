/** Closing labels, same rules as the FiboUI VS Code extension. */

/** Public fiboui factories. Suggesting a name Run cannot see is a dead completion. */
export const FACTORY_NAMES = [
  'Alert', 'AssetCard', 'Avatar', 'Badge', 'Banner', 'Box', 'BurgerIcon',
  'Button', 'Canvas', 'Card', 'Center', 'Checkbox', 'Collapse', 'CollectionCard',
  'Column', 'Combobox', 'Container', 'ContentCard', 'DashboardLayout', 'Grid', 'GridItem',
  'Header', 'Icon', 'Image', 'Integration', 'Label', 'Line',
  'LinearGradient', 'List', 'ListTile', 'MapView', 'ProfileCard', 'Progress', 'RadioGroup',
  'Row', 'Scaffold', 'ScrollView', 'Select', 'Sidebar', 'Skeleton', 'Spacer', 'Spinner',
  'Switch', 'Table', 'Tags', 'Text', 'TextField', 'Textarea', 'VirtualColumn', 'ZStack',
  'FiboApp', 'Form', 'Presence', 'Reveal',
  'AsyncImage', 'Calendar', 'Carousel', 'Chart', 'CodeScanner', 'ContentUnavailable',
  'DateRangePicker', 'Dismissible', 'FilePicker', 'Hero', 'Inspector', 'Markdown',
  'MeshGradient', 'NumericText', 'OtpField', 'PdfView', 'PhotosPicker', 'RefreshIndicator',
  'ReorderableList', 'RichEditor', 'Searchable', 'SensoryFeedback', 'Shake', 'ShareLink',
  'Shortcuts', 'SwipeRow', 'WebView', 'WheelPicker', 'Wizard',
]

const FACTORIES = new Set(FACTORY_NAMES)

export interface ClosingLabel {
  offset: number
  label: string
}

/**
 * Same rules as the VS Code extension: the `//` sits after the last `)` of a
 * multi-line chain, not beside the factory on its opening line.
 */
export function computeLabels(text: string): ClosingLabel[] {
  const out: { offset: number; label: string; depth: number }[] = []
  const source = maskNoise(text)
  const callRe = /\.(children|items)\s*\(/g
  let match: RegExpExecArray | null
  while ((match = callRe.exec(source))) {
    const openParen = match.index + match[0].length - 1
    const closeParen = findMatchingParen(text, openParen)
    if (closeParen < 0) continue
    if (!text.slice(openParen, closeParen).includes('\n')) continue
    const root = findChainRoot(text, match.index)
    if (!root) continue
    const nest = countEnclosingChildren(text, openParen) + 1
    out.push({ offset: closeParen + 1, label: root, depth: nest })
  }

  const factoryRe = /\b([A-Z][A-Za-z0-9]*)\s*\(/g
  while ((match = factoryRe.exec(source))) {
    const name = match[1]
    if (!FACTORIES.has(name)) continue
    const openParen = match.index + match[0].length - 1
    const factoryClose = findMatchingParen(text, openParen)
    if (factoryClose < 0) continue
    const { chainEnd, methods } = walkFluentChain(text, factoryClose)
    const nest = countEnclosingChildren(text, openParen) + 1
    if (text.slice(match.index, chainEnd + 1).includes('\n')) {
      out.push({ offset: chainEnd + 1, label: name, depth: nest })
    }
    for (const method of methods) {
      if (method.close === chainEnd) continue
      if (!text.slice(method.open, method.close).includes('\n')) continue
      out.push({
        offset: method.close + 1,
        label: method.name,
        depth: countEnclosingChildren(text, method.open) + 1,
      })
    }
  }

  const byOffset = new Map<number, { offset: number; label: string; depth: number }>()
  for (const item of out) {
    const prev = byOffset.get(item.offset)
    if (!prev || item.depth > prev.depth || (item.depth === prev.depth && /^[A-Z]/.test(item.label) && !/^[A-Z]/.test(prev.label))) {
      byOffset.set(item.offset, item)
    }
  }
  return [...byOffset.values()].map(({ offset, label }) => ({ offset, label }))
}

function walkFluentChain(text: string, factoryClose: number) {
  let chainEnd = factoryClose
  let i = factoryClose + 1
  const methods: { name: string; open: number; close: number }[] = []
  while (i < text.length) {
    i = skipGap(text, i)
    if (text[i] !== '.') break
    i += 1
    const methodStart = i
    while (i < text.length && isIdentPart(text[i])) i += 1
    if (i === methodStart) break
    const name = text.slice(methodStart, i)
    i = skipGap(text, i)
    if (text[i] !== '(') break
    const open = i
    const close = findMatchingParen(text, open)
    if (close < 0) break
    methods.push({ name, open, close })
    chainEnd = close
    i = close + 1
  }
  return { chainEnd, methods }
}

function findChainRoot(text: string, dotIndex: number): string | null {
  let i = dotIndex - 1
  while (i >= 0 && /\s/.test(text[i])) i -= 1
  while (i >= 0) {
    if (text[i] === ')') {
      const open = findMatchingOpen(text, i)
      if (open < 0) return null
      let j = open - 1
      while (j >= 0 && /\s/.test(text[j])) j -= 1
      if (j >= 0 && isIdentPart(text[j])) {
        let start = j
        while (start >= 0 && isIdentPart(text[start])) start -= 1
        const name = text.slice(start + 1, j + 1)
        let k = start
        while (k >= 0 && /\s/.test(text[k])) k -= 1
        if (text[k] === '.') {
          i = k - 1
          while (i >= 0 && /\s/.test(text[i])) i -= 1
          continue
        }
        if (FACTORIES.has(name) || /^[A-Z][A-Za-z0-9]*$/.test(name)) return name
        return null
      }
      i = open - 1
      continue
    }
    if (isIdentPart(text[i])) {
      let start = i
      while (start >= 0 && isIdentPart(text[start])) start -= 1
      const name = text.slice(start + 1, i + 1)
      if (FACTORIES.has(name) || /^[A-Z][A-Za-z0-9]*$/.test(name)) return name
      return null
    }
    break
  }
  return null
}

function countEnclosingChildren(text: string, pos: number): number {
  let count = 0
  const re = /\.(children|items)\s*\(/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    const open = match.index + match[0].length - 1
    if (open >= pos) break
    const close = findMatchingParen(text, open)
    if (close > pos) count += 1
  }
  return count
}

function findMatchingParen(text: string, open: number): number {
  let depth = 0
  for (let i = open; i < text.length; i += 1) {
    const char = text[i]
    if (char === "'" || char === '"' || char === '`') {
      i = skipString(text, i) - 1
      continue
    }
    if (char === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i)
      if (nl < 0) return -1
      i = nl
      continue
    }
    if (char === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      if (end < 0) return -1
      i = end + 1
      continue
    }
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function findMatchingOpen(text: string, close: number): number {
  let depth = 0
  let quote = ''
  for (let i = close; i >= 0; i -= 1) {
    const char = text[i]
    if (quote) {
      if (char === quote && text[i - 1] !== '\\') quote = ''
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }
    if (char === ')') depth += 1
    else if (char === '(') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function skipString(text: string, start: number): number {
  const quote = text[start]
  let i = start + 1
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (quote === '`' && text[i] === '$' && text[i + 1] === '{') {
      const close = findMatchingBrace(text, i + 1)
      i = close < 0 ? text.length : close + 1
      continue
    }
    if (text[i] === quote) return i + 1
    if (quote !== '`' && text[i] === '\n') return i
    i += 1
  }
  return text.length
}

function findMatchingBrace(text: string, open: number): number {
  let depth = 0
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1
    else if (text[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function isIdentPart(char: string | undefined): boolean {
  return !!char && /[A-Za-z0-9_$]/.test(char)
}

function skipGap(text: string, index: number): number {
  let i = index
  while (i < text.length) {
    if (/\s/.test(text[i])) {
      i += 1
      continue
    }
    if (text[i] === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i)
      i = nl < 0 ? text.length : nl + 1
      continue
    }
    if (text[i] === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 2
      continue
    }
    break
  }
  return i
}

/** Strings and comments become spaces so a factory inside them is not a label. */
function maskNoise(text: string): string {
  const chars = text.split('')
  let i = 0
  while (i < chars.length) {
    const char = chars[i]
    if (char === '"' || char === "'" || char === '`') {
      const end = skipString(text, i)
      for (let k = i; k < end && k < chars.length; k += 1) {
        if (chars[k] !== '\n') chars[k] = ' '
      }
      i = end
      continue
    }
    if (char === '/' && chars[i + 1] === '/') {
      while (i < chars.length && chars[i] !== '\n') {
        chars[i] = ' '
        i += 1
      }
      continue
    }
    if (char === '/' && chars[i + 1] === '*') {
      chars[i] = ' '
      chars[i + 1] = ' '
      i += 2
      while (i < chars.length && !(chars[i] === '*' && chars[i + 1] === '/')) {
        if (chars[i] !== '\n') chars[i] = ' '
        i += 1
      }
      if (chars[i] === '*') {
        chars[i] = ' '
        chars[i + 1] = ' '
        i += 2
      }
      continue
    }
    i += 1
  }
  return chars.join('')
}
