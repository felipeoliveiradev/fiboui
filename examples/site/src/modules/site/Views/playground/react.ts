/**
 * Turns a playground snippet into the JSX a React file would use
 * for the same tree. Chain methods become props. `.children([...])`
 * become nested elements. The first argument of `Text()` / `Button()`
 * (any widget called with one value) becomes the element's children.
 */

interface Call {
  name: string
  args: string[]
}

export function toReact(source: string): string {
  return rewrite(source).replace(/[ \t]+\n/g, '\n').trim()
}

function rewrite(src: string): string {
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === "'" || c === '"' || c === '`') {
      const end = scanString(src, i)
      out += src.slice(i, end)
      i = end
      continue
    }
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      const to = end < 0 ? src.length : end
      i = to
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      i = end < 0 ? src.length : end + 2
      continue
    }
    if (isIdentStart(c) && (i === 0 || !isIdentPart(src[i - 1]))) {
      const chain = readChain(src, i)
      if (chain && /^[A-Z]/.test(chain.calls[0].name)) {
        let jsx = emit(chain.calls)
        if (/\breturn\s*$/.test(out) && jsx.includes('\n')) {
          jsx = `(\n  ${indentTail(jsx, '  ')}\n)`
        }
        out += jsx
        i = chain.end
        continue
      }
    }
    out += c
    i += 1
  }
  return out
}

function emit(calls: Call[]): string {
  const name = calls[0].name
  const methods = calls.slice(1)
  const childCall = methods.find((call) => call.name === 'children' || (call.name === 'items' && isElementArray(call.args[0] ?? '')))
  const props = methods.filter((call) => call !== childCall).map((call) => formatProp(call.name, call.args))
  const children: string[] = []
  for (const arg of calls[0].args) {
    if (arg.trim()) children.push(formatChild(arg))
  }
  if (childCall) children.push(...childList(childCall.args[0] ?? ''))
  return layout(name, props, children)
}

function layout(name: string, props: string[], children: string[]): string {
  const rich = props.length > 0 || children.some((child) => child.startsWith('<') || child.startsWith('{'))
  if (!rich && children.length === 0) return `<${name} />`
  if (!rich && children.length === 1) return `<${name}>${children[0]}</${name}>`
  const propBlock = props.map((prop) => `\n  ${indentTail(prop, '  ')}`).join('')
  if (children.length === 0) return `<${name}${propBlock}\n/>`
  const body = children.map((child) => `\n  ${indentTail(child, '  ')}`).join('')
  return `<${name}${propBlock}\n>${body}\n</${name}>`
}

function formatProp(name: string, args: string[]): string {
  if (args.length === 0) return name
  if (args.length === 1) {
    const value = rewrite(args[0]).trim()
    if (isStringLiteral(value)) return `${name}=${toJsxString(value)}`
    return `${name}={${value}}`
  }
  const values = args.map((arg) => rewrite(arg).trim()).join(', ')
  return `${name}={[${values}]}`
}

function formatChild(raw: string): string {
  const value = rewrite(raw).trim()
  if (value.startsWith('<')) return value
  if (isStringLiteral(value)) return unquote(value)
  return `{${value}}`
}

function childList(raw: string): string[] {
  const body = raw.trim()
  if (body.startsWith('[')) {
    const close = body.lastIndexOf(']')
    const inner = body.slice(1, close < 0 ? body.length : close)
    return splitArgs(inner).filter((part) => part.trim()).map(formatChild)
  }
  return [formatChild(body)]
}

function isElementArray(raw: string): boolean {
  return /\[[\s\S]*[A-Z][\w$]*\s*\(/.test(raw)
}

function isStringLiteral(value: string): boolean {
  return value.length >= 2 && (value[0] === "'" || value[0] === '"' || value[0] === '`') && value.endsWith(value[0])
}

function unquote(literal: string): string {
  const body = literal.slice(1, -1)
  return body.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function toJsxString(literal: string): string {
  const body = unquote(literal).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${body}"`
}

function indentTail(block: string, pad: string): string {
  const lines = block.split('\n')
  return lines.map((line, index) => (index === 0 ? line : pad + line)).join('\n')
}

function readChain(src: string, start: number): { end: number; calls: Call[] } | null {
  const name = readIdent(src, start)
  if (!name || !/^[A-Z]/.test(name)) return null
  let i = skip(src, start + name.length)
  if (src[i] !== '(') return null
  const calls: Call[] = []
  const first = readArgList(src, i)
  calls.push({ name, args: first.args })
  i = first.end
  while (true) {
    const dot = skip(src, i)
    if (src[dot] !== '.') break
    const nameAt = skip(src, dot + 1)
    const method = readIdent(src, nameAt)
    if (!method) break
    const open = skip(src, nameAt + method.length)
    if (src[open] !== '(') break
    const next = readArgList(src, open)
    calls.push({ name: method, args: next.args })
    i = next.end
  }
  return { end: i, calls }
}

function readArgList(src: string, open: number): { args: string[]; end: number } {
  let i = open + 1
  let part = i
  let paren = 1
  let bracket = 0
  let brace = 0
  const args: string[] = []
  while (i < src.length && paren > 0) {
    const c = src[i]
    if (c === "'" || c === '"' || c === '`') {
      i = scanString(src, i)
      continue
    }
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      i = end < 0 ? src.length : end
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      i = end < 0 ? src.length : end + 2
      continue
    }
    if (c === '(') paren += 1
    else if (c === ')') {
      paren -= 1
      if (paren === 0) break
    } else if (c === '[') bracket += 1
    else if (c === ']') bracket -= 1
    else if (c === '{') brace += 1
    else if (c === '}') brace -= 1
    else if (c === ',' && paren === 1 && bracket === 0 && brace === 0) {
      args.push(src.slice(part, i))
      part = i + 1
    }
    i += 1
  }
  const tail = src.slice(part, i)
  if (tail.trim()) args.push(tail)
  return { args: args.map((arg) => arg.trim()), end: i + 1 }
}

function splitArgs(src: string): string[] {
  return readArgList(`(${src})`, 0).args
}

function readIdent(src: string, start: number): string {
  if (!isIdentStart(src[start] ?? '')) return ''
  let i = start + 1
  while (i < src.length && isIdentPart(src[i])) i += 1
  return src.slice(start, i)
}

function skip(src: string, start: number): number {
  let i = start
  while (i < src.length) {
    const c = src[i]
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r') {
      i += 1
      continue
    }
    if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i)
      i = end < 0 ? src.length : end
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2)
      i = end < 0 ? src.length : end + 2
      continue
    }
    break
  }
  return i
}

function scanString(src: string, start: number): number {
  const quote = src[start]
  let i = start + 1
  if (quote === '`') {
    while (i < src.length) {
      if (src[i] === '\\') {
        i += 2
        continue
      }
      if (src[i] === '$' && src[i + 1] === '{') {
        i += 2
        let depth = 1
        while (i < src.length && depth > 0) {
          if (src[i] === "'" || src[i] === '"' || src[i] === '`') {
            i = scanString(src, i)
            continue
          }
          if (src[i] === '{') depth += 1
          else if (src[i] === '}') depth -= 1
          if (depth > 0) i += 1
        }
        if (src[i] === '}') i += 1
        continue
      }
      if (src[i] === '`') return i + 1
      i += 1
    }
    return i
  }
  while (i < src.length) {
    if (src[i] === '\\') {
      i += 2
      continue
    }
    if (src[i] === quote) return i + 1
    i += 1
  }
  return i
}

function isIdentStart(char: string): boolean {
  return /[A-Za-z_$]/.test(char)
}

function isIdentPart(char: string): boolean {
  return /[\w$]/.test(char)
}
