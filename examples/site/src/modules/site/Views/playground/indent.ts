/** Same Enter rules as the FiboUI VS Code extension, plus the cases that rule missed. */

const CHILDREN_OPEN = /\.(children|items)\s*\(\s*\[\s*$/
const STYLE_CALLBACK = /\.(itemStyle|itemHover)\s*\(\s*\([^)]*\)\s*=>\s*(\{\s*)?$/
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
  if (STYLE_CALLBACK.test(trimmed)) return baseIndent + INDENT
  if (/\.(itemStyle|itemHover)\b.*=>\s*\{\s*$/.test(trimmed)) return baseIndent + INDENT
  if (/=>\s*\{\s*$/.test(trimmed) || /\{\s*$/.test(trimmed)) return baseIndent + INDENT
  if (OPEN_CALL.test(trimmed)) return baseIndent + INDENT
  if (isFactoryEmptyLine(trimmed) && nextIsChainOrEmpty) return baseIndent + INDENT
  if (isFactoryChainLine(trimmed) && nextIsChainOrEmpty) return baseIndent + INDENT
  if (CHAIN_LINE.test(stripLineComment(prevLine)) && nextIsChainOrEmpty) return baseIndent
  return null
}

function isFactoryEmptyLine(trimmed: string): boolean {
  const text = trimmed.trim()
  if (/^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(text)) return true
  if (/[=:,(]\s*[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(trimmed)) return true
  return false
}

/** `Column().gap(12)` — the factory already continued on this line. */
function isFactoryChainLine(trimmed: string): boolean {
  return /^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\([^)]*\)(?:\s*\.[A-Za-z_$][\w$]*\s*\([^)]*\))*\s*$/.test(trimmed.trim())
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
