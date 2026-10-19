/** Same Enter rules as the FiboUI VS Code extension, plus the cases that rule missed. */

const CHILDREN_OPEN = /\.(children|items)\s*\(\s*\[\s*$/
const CHILDREN_EMPTY = /\.(children|items)(?:\s*\(\s*(?:\[\s*\])?\s*\))?\s*$/
const STYLE_CALLBACK = /\.(itemStyle|when)\s*\(\s*\([^)]*\)\s*=>\s*(\{\s*)?$/
const CHAIN_LINE = /^\s*\.[A-Za-z_$]/
const OPEN_CALL = /(?:\.\w+|[A-Z][A-Za-z0-9]*)\s*\(\s*$/

export const INDENT = '  '

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}' }

/**
 * What Enter inserts at the caret. `eat` is how much of the text after the caret
 * is replaced (spaces sitting between the caret and a closing bracket).
 * The caret is an offset into `insert`.
 */
export function planEnter(before: string, after: string): { insert: string; caret: number; eat: number } {
  const base = /^\s*/.exec(before)?.[0] ?? ''
  const eat = /^[ \t]*/.exec(after)?.[0].length ?? 0
  const rest = after.slice(eat)
  const pair = pairBreak(before, rest, base)
  if (pair) return { ...pair, eat }
  const indent = suggestIndent(before, rest, base) ?? base
  const insert = `\n${indent}`
  return { insert, caret: insert.length, eat }
}

/** Enter between `([|])`, `(|)` or `{|}` opens a blank indented line and keeps the closer. */
function pairBreak(before: string, rest: string, base: string): { insert: string; caret: number } | null {
  const left = before.replace(/[ \t]+$/, '')
  const opener = left[left.length - 1]
  const closer = opener ? PAIRS[opener] : undefined
  if (!closer || !rest.startsWith(closer)) return null
  const inner = base + INDENT
  const insert = `\n${inner}\n${base}`
  return { insert, caret: 1 + inner.length }
}

/**
 * Leading whitespace for the new line. Null means "copy the previous indent".
 */
export function suggestIndent(prevLine: string, nextLine: string, baseIndent: string): string | null {
  const trimmed = stripLineComment(prevLine).replace(/\s+$/, '')
  const nextTrim = (nextLine || '').replace(/^\s+/, '')
  const nextIsChainOrEmpty = !nextTrim || nextTrim.startsWith('.')

  if (CHILDREN_OPEN.test(trimmed)) return baseIndent + INDENT
  if (CHILDREN_EMPTY.test(trimmed) && !nextTrim) return baseIndent + INDENT
  if (STYLE_CALLBACK.test(trimmed)) return baseIndent + INDENT
  if (/\.(itemStyle|when)\b.*=>\s*\{\s*$/.test(trimmed)) return baseIndent + INDENT
  if (/=>\s*(\{\s*)?$/.test(trimmed) || /\{\s*$/.test(trimmed)) return baseIndent + INDENT
  if (OPEN_CALL.test(trimmed)) return baseIndent + INDENT
  if (isFactoryEmptyLine(trimmed) && nextIsChainOrEmpty) return baseIndent + INDENT
  if (isFactoryChainLine(trimmed) && nextIsChainOrEmpty) return baseIndent + INDENT
  if (endsWithFactory(trimmed) && nextIsChainOrEmpty) return baseIndent + INDENT
  if (CHAIN_LINE.test(stripLineComment(prevLine)) && nextIsChainOrEmpty) return baseIndent
  return null
}

function isFactoryEmptyLine(trimmed: string): boolean {
  const text = trimmed.trim().replace(/,+\s*$/, '')
  if (/^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(text)) return true
  if (/[=:,(]\s*[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(text)) return true
  return false
}

type BracketFrame = { indent: string }

/**
 * Reindent a playground snippet. Chain lines share a column, bodies inside
 * `=>`, `([` and `{` step in, and a closing `])` / `})` returns to the line that opened it.
 */
export function reindent(text: string): string {
  const lines = text.replace(/\t/g, INDENT).split('\n')
  const out: string[] = []
  const stack: BracketFrame[] = []
  let prev = ''
  for (const raw of lines) {
    const content = raw.trim()
    if (content === '') {
      out.push('')
      continue
    }
    const indent = out.length === 0 ? '' : chooseIndent(prev, content, stack)
    out.push(indent + content)
    walkBrackets(content, indent, stack)
    prev = indent + content
  }
  return out.join('\n')
}

/** Keep the caret on the same token after leading spaces change. */
export function mapReindentCaret(before: string, after: string, pos: number): number {
  const at = Math.max(0, Math.min(pos, before.length))
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  let line = 0
  let col = at
  while (line < beforeLines.length - 1 && col > beforeLines[line].length) {
    col -= beforeLines[line].length + 1
    line += 1
  }
  const oldLine = beforeLines[line] ?? ''
  const newLine = afterLines[Math.min(line, Math.max(0, afterLines.length - 1))] ?? ''
  const oldIndent = /^\s*/.exec(oldLine)?.[0].length ?? 0
  const newIndent = /^\s*/.exec(newLine)?.[0].length ?? 0
  const contentCol = Math.max(0, col - oldIndent)
  const newCol = Math.min(newIndent + contentCol, newLine.length)
  let offset = 0
  const last = Math.min(line, afterLines.length - 1)
  for (let i = 0; i < last; i += 1) offset += afterLines[i].length + 1
  return offset + newCol
}

function chooseIndent(prev: string, content: string, stack: BracketFrame[]): string {
  const closers = leadingCloserCount(content)
  if (closers > 0 && stack.length > 0) {
    return stack[Math.max(0, stack.length - closers)].indent
  }
  const base = /^\s*/.exec(prev)?.[0] ?? ''
  // `.onSubmit` after `})` stays on the chain. A new Form/Button falls back into the open bracket.
  if (leadingCloserCount(prev.trim()) > 0 && content.startsWith('.')) return base
  const suggested = suggestIndent(prev, content, base)
  if (suggested !== null) return suggested
  const top = stack[stack.length - 1]
  return top ? top.indent + INDENT : base
}

function leadingCloserCount(content: string): number {
  let count = 0
  for (const char of content) {
    if (char === ')' || char === ']' || char === '}') count += 1
    else if (char === ' ' || char === '\t') continue
    else break
  }
  return count
}

function walkBrackets(content: string, indent: string, stack: BracketFrame[]) {
  let quote = ''
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quote) {
      if (char === '\\') {
        i += 1
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === '/' && content[i + 1] === '/') break
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }
    if (char === '(' || char === '[' || char === '{') stack.push({ indent })
    else if (char === ')' || char === ']' || char === '}') stack.pop()
  }
}

/** `.renderItem((item) => Row()` — the next `.children` belongs to Row, not to List. */
function endsWithFactory(trimmed: string): boolean {
  let text = trimmed.trim().replace(/,+\s*$/, '')
  while (text) {
    const call = lastCompleteCall(text)
    if (!call) return false
    if (!call.dotted) return /^[A-Z]/.test(call.name)
    text = text.slice(0, call.start).trimEnd()
  }
  return false
}

/** Last `ident(...)` at the end of `text`, with nested parens (`Row(Box())`). */
function lastCompleteCall(text: string): { name: string; dotted: boolean; start: number } | null {
  let i = text.length - 1
  while (i >= 0 && /\s/.test(text[i])) i -= 1
  if (i < 0 || text[i] !== ')') return null
  let depth = 0
  let quote = ''
  for (; i >= 0; i -= 1) {
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
      if (depth !== 0) continue
      let j = i - 1
      while (j >= 0 && /\s/.test(text[j])) j -= 1
      const nameEnd = j + 1
      while (j >= 0 && /[A-Za-z0-9_$]/.test(text[j])) j -= 1
      const name = text.slice(j + 1, nameEnd)
      if (!name) return null
      const dotted = text[j] === '.'
      return { name, dotted, start: dotted ? j : j + 1 }
    }
  }
  return null
}

/** `Column().gap(12)` — the factory already continued on this line. */
function isFactoryChainLine(trimmed: string): boolean {
  return /^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\([^)]*\)(?:\s*\.[A-Za-z_$][\w$]*\s*\([^)]*\))*\s*$/.test(trimmed.trim().replace(/,+\s*$/, ''))
}

function stripLineComment(line: string): string {
  let out = ''
  let quote = ''
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (quote) {
      out += char
      if (char === '\\') {
        out += line[i + 1] ?? ''
        i += 1
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      out += char
      continue
    }
    if (char === '/' && line[i + 1] === '/') break
    out += char
  }
  return out
}
