import * as fiboui from 'fiboui'
import { loadPlayModule, resolveImportScope, takeImports } from './imports'

export type PlayError = {
  message: string
  hint: string
  lesson: string
}

export type PlayResult =
  | { ok: true; node: unknown }
  | { ok: false; error: PlayError }

const scopeEntries = Object.entries(fiboui).filter(
  ([name, value]) => /^[A-Za-z_$][\w$]*$/.test(name) && value != null,
)

const scopeNames = scopeEntries.map(([name]) => name)
const scopeValues = scopeEntries.map(([, value]) => value)

const buildersByLower = new Map<string, string>()
for (const name of scopeNames) {
  const key = name.toLowerCase()
  const prev = buildersByLower.get(key)
  if (!prev) buildersByLower.set(key, name)
  else if (name[0] === name[0].toLowerCase() && prev[0] !== prev[0].toLowerCase()) buildersByLower.set(key, name)
}

const childrenLesson = `return Form()
  .children([
    TextField()
      .name('name')
      .placeholder('Name'),
    TextField()
      .name('email')
      .placeholder('Email'),
    Button('Enviar')
      .submit(),
  ])`

function prepare(source: string): string {
  const stripped = insertArrayCommas(
    source.replace(/^\s*import\s.+from\s+['"][^'"]+['"];?\s*$/gm, ''),
  ).trim()
  if (hasCodeReturn(stripped)) return stripped
  return `return (\n${stripped}\n)`
}

/**
 * Widgets inside `[...]` are separated by a newline in the editor.
 * JavaScript still needs a comma between them, so the playground inserts it
 * for any component, not only TextField.
 */
function insertArrayCommas(source: string): string {
  let out = ''
  const stack: string[] = []
  let lastCode = ''
  let i = 0

  const emitCode = (text: string) => {
    out += text
    lastCode = text[text.length - 1] ?? lastCode
  }

  while (i < source.length) {
    const char = source[i]
    if (char === "'" || char === '"' || char === '`') {
      const end = skipString(source, i)
      emitCode(source.slice(i, end))
      i = end
      continue
    }
    if (char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      const stop = end < 0 ? source.length : end + 1
      const next = peekCode(source, stop)
      if (stack[stack.length - 1] === '[' && needsComma(lastCode, next)) out += ','
      out += source.slice(i, stop)
      i = stop
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      const stop = end < 0 ? source.length : end + 2
      out += source.slice(i, stop)
      i = stop
      continue
    }
    if (char === '/' && /[(,[=:!&|?{};]/.test(lastCode || '(')) {
      const end = skipRegex(source, i)
      emitCode(source.slice(i, end))
      i = end
      continue
    }
    if (char === '[' || char === '(' || char === '{') {
      stack.push(char)
      emitCode(char)
      i += 1
      continue
    }
    if (char === ']' || char === ')' || char === '}') {
      stack.pop()
      emitCode(char)
      i += 1
      continue
    }
    if (char === '\n' && stack[stack.length - 1] === '[') {
      const next = peekCode(source, i + 1)
      if (needsComma(lastCode, next)) out += ','
      out += char
      i += 1
      continue
    }
    if (/\s/.test(char)) {
      out += char
      i += 1
      continue
    }
    emitCode(char)
    i += 1
  }
  return out
}

function needsComma(prev: string, next: string): boolean {
  if (!prev || !next) return false
  if (prev === ',' || prev === '[' || prev === '(' || prev === '{' || prev === '.') return false
  if (next === ']' || next === ',' || next === ')' || next === '.') return false
  const prevEnds = /[)\]}'"`A-Za-z0-9_$]/.test(prev)
  const nextStarts = next === '...' || /[A-Za-z_$'"`0-9[{(]/.test(next)
  return prevEnds && nextStarts
}

function peekCode(source: string, index: number): string {
  let i = index
  while (i < source.length) {
    if (/\s/.test(source[i])) {
      i += 1
      continue
    }
    if (source[i] === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      if (end < 0) return ''
      i = end + 1
      continue
    }
    if (source[i] === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      if (end < 0) return ''
      i = end + 2
      continue
    }
    if (source.startsWith('...', i)) return '...'
    return source[i]
  }
  return ''
}

function skipString(source: string, start: number): number {
  const quote = source[start]
  let i = start + 1
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2
      continue
    }
    if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
      i += 2
      let depth = 1
      while (i < source.length && depth > 0) {
        if (source[i] === "'" || source[i] === '"' || source[i] === '`') {
          i = skipString(source, i)
          continue
        }
        if (source[i] === '{') depth += 1
        else if (source[i] === '}') depth -= 1
        i += 1
      }
      continue
    }
    if (source[i] === quote) return i + 1
    i += 1
  }
  return source.length
}

function skipRegex(source: string, start: number): number {
  let i = start + 1
  let klass = false
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2
      continue
    }
    if (source[i] === '[') klass = true
    else if (source[i] === ']') klass = false
    else if (source[i] === '/' && !klass) return i + 1
    else if (source[i] === '\n') return i
    i += 1
  }
  return source.length
}

function hasCodeReturn(source: string): boolean {
  let i = 0
  let paren = 0
  let bracket = 0
  let brace = 0
  let lastCode = ''
  while (i < source.length) {
    const char = source[i]
    if (char === "'" || char === '"' || char === '`') {
      i = skipString(source, i)
      lastCode = '"'
      continue
    }
    if (char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      i = end < 0 ? source.length : end + 1
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      i = end < 0 ? source.length : end + 2
      continue
    }
    if (char === '/' && /[(,[=:!&|?{};]/.test(lastCode || '(')) {
      i = skipRegex(source, i)
      lastCode = '/'
      continue
    }
    if (char === '(') paren += 1
    else if (char === ')') paren = Math.max(0, paren - 1)
    else if (char === '[') bracket += 1
    else if (char === ']') bracket = Math.max(0, bracket - 1)
    else if (char === '{') brace += 1
    else if (char === '}') brace = Math.max(0, brace - 1)
    else if (
      paren === 0 &&
      bracket === 0 &&
      brace === 0 &&
      source.startsWith('return', i) &&
      !/[\w$]/.test(source[i - 1] ?? '') &&
      !/[\w$]/.test(source[i + 6] ?? '')
    ) {
      return true
    }
    if (!/\s/.test(char)) lastCode = char
    i += 1
  }
  return false
}

export function explain(message: string): { hint: string; lesson: string } {
  const missing = message.match(/([A-Za-z_$][\w$]*) is not defined/)
  if (missing) {
    const wanted = missing[1]
    const hit = buildersByLower.get(wanted.toLowerCase())
    if (hit && hit !== wanted) {
      return {
        hint: `${wanted}() não existe. O nome é ${hit}().`,
        lesson: '',
      }
    }
    return {
      hint: `${wanted}() não está no playground. Os nomes mais usados são Column, Row, Text, TextField, Form, List, signal e listSignal.`,
      lesson: '',
    }
  }
  if (/Missing initializer|Unexpected reserved word|Unexpected token ':'|Unexpected identifier 'as'|Unexpected identifier 'type'/.test(message)) {
    return {
      hint: 'Este editor corre JavaScript. Tira anotações de tipo, enum e type.',
      lesson: '',
    }
  }
  if (/Unexpected identifier/.test(message)) {
    return {
      hint: 'Falta uma vírgula entre os widgets. Dentro de .children([ … ]), um widget por linha e vírgula no fim.',
      lesson: childrenLesson,
    }
  }
  if (/Unexpected token|Unexpected end|Invalid or unexpected/.test(message)) {
    return {
      hint: 'O código não fechou. Confere parênteses, colchetes e aspas.',
      lesson: childrenLesson,
    }
  }
  if (/Objects are not valid as a React child/.test(message) && /signal/.test(message)) {
    return {
      hint: 'Um signal não se pinta direto. Escreve Text(`${interp(count)}`).',
      lesson: '',
    }
  }
  if (/type annotations|':' expected|Type aliases/.test(message)) {
    return {
      hint: 'Este editor corre JavaScript. Tira as anotações de tipo.',
      lesson: '',
    }
  }
  return {
    hint: 'O preview parou neste erro. Corrige a linha e carrega em Run outra vez.',
    lesson: '',
  }
}

/**
 * Compile the editor snippet with `new Function`. Same-origin, not a sandbox:
 * the author clicks Run (no URL-fed source). Do not auto-run query/hash payloads.
 */
export function runPlay(source: string, extra: Record<string, unknown> = {}): PlayResult {
  const body = prepare(source)
  const names = scopeNames.slice()
  const values: unknown[] = scopeValues.slice()
  for (const [name, value] of Object.entries(extra)) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue
    const index = names.indexOf(name)
    if (index >= 0) values[index] = value
    else {
      names.push(name)
      values.push(value)
    }
  }
  try {
    const fn = new Function(...names, `"use strict";\n${body}`) as (
      ...args: unknown[]
    ) => unknown
    const node = fn(...values)
    if (node == null || (typeof node !== 'object' && typeof node !== 'function')) {
      return {
        ok: false,
        error: {
          message: 'The code did not return a view.',
          hint: 'Termina com um builder, por exemplo return Column()…',
          lesson: childrenLesson,
        },
      }
    }
    return { ok: true, node }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const taught = explain(message)
    return { ok: false, error: { message, hint: taught.hint, lesson: taught.lesson } }
  }
}

/** Resolve `import { Search } from 'lucide-react'` and then compile. */
export async function runPlayAsync(source: string): Promise<PlayResult> {
  const taken = takeImports(source)
  if (taken.error) {
    return { ok: false, error: { message: taken.error, hint: taken.error, lesson: '' } }
  }
  const resolved = await resolveImportScope(taken.specs, loadPlayModule)
  if (!resolved.ok) {
    return {
      ok: false,
      error: {
        message: resolved.message,
        hint: "Confere o nome do ícone. Exemplo: import { Search } from 'lucide-react'.",
        lesson: '',
      },
    }
  }
  return runPlay(taken.body, resolved.scope)
}
