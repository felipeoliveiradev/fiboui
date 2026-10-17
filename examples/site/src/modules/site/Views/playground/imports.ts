export type ImportBinding = { local: string; imported: string }

export type ImportSpec = {
  module: string
  bindings: ImportBinding[]
}

const ALLOWED = new Set(['lucide-react', 'leaflet'])

export function takeImports(source: string): { body: string; specs: ImportSpec[]; error: string | null } {
  const specs: ImportSpec[] = []
  let body = ''
  let i = 0
  while (i < source.length) {
    const char = source[i]
    if (char === "'" || char === '"' || char === '`') {
      const end = skipString(source, i)
      body += source.slice(i, end)
      i = end
      continue
    }
    if (char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      const stop = end < 0 ? source.length : end
      body += source.slice(i, stop)
      i = stop
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      const stop = end < 0 ? source.length : end + 2
      body += source.slice(i, stop)
      i = stop
      continue
    }
    if (startsImport(source, i)) {
      const parsed = readImport(source, i)
      if (parsed.error) return { body: source, specs: [], error: parsed.error }
      if (parsed.spec) specs.push(parsed.spec)
      body += '\n'
      i = parsed.end
      continue
    }
    body += char
    i += 1
  }
  return { body, specs, error: null }
}

export type ModuleLoader = (moduleName: string) => Promise<Record<string, unknown>>

export async function resolveImportScope(
  specs: ImportSpec[],
  load: ModuleLoader,
): Promise<{ ok: true; scope: Record<string, unknown> } | { ok: false; message: string }> {
  const scope: Record<string, unknown> = {}
  const cache = new Map<string, Record<string, unknown>>()
  for (const spec of specs) {
    let mod = cache.get(spec.module)
    if (!mod) {
      try {
        mod = await load(spec.module)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { ok: false, message }
      }
      cache.set(spec.module, mod)
    }
    for (const binding of spec.bindings) {
      if (binding.imported === '*') {
        scope[binding.local] = mod
        continue
      }
      const value = binding.imported === 'default' ? mod.default : mod[binding.imported]
      if (value == null) {
        return { ok: false, message: `${binding.imported} não existe em ${spec.module}.` }
      }
      scope[binding.local] = value
    }
  }
  return { ok: true, scope }
}

export function loadPlayModule(moduleName: string): Promise<Record<string, unknown>> {
  if (moduleName === 'lucide-react') return import('lucide-react') as Promise<Record<string, unknown>>
  if (moduleName === 'leaflet') return import('leaflet') as Promise<Record<string, unknown>>
  return Promise.reject(new Error('O playground só importa de lucide-react ou leaflet.'))
}

let lucideNameCache: readonly string[] | null = null
let lucideNameLoad: Promise<readonly string[]> | null = null

export function lucideNames(): readonly string[] | null {
  return lucideNameCache
}

export function ensureLucideNames(): Promise<readonly string[]> {
  if (lucideNameCache) return Promise.resolve(lucideNameCache)
  if (!lucideNameLoad) {
    lucideNameLoad = loadPlayModule('lucide-react')
      .then((mod) => {
        lucideNameCache = Object.keys(mod).filter((key) => /^[A-Z]/.test(key)).sort()
        return lucideNameCache
      })
      .catch((error: unknown) => {
        lucideNameLoad = null
        throw error
      })
  }
  return lucideNameLoad
}

function startsImport(source: string, index: number): boolean {
  if (!source.startsWith('import', index)) return false
  if (index > 0 && /[\w$]/.test(source[index - 1])) return false
  const lineStart = source.lastIndexOf('\n', index - 1) + 1
  return source.slice(lineStart, index).trim() === ''
}

function readImport(source: string, start: number): { end: number; spec: ImportSpec | null; error: string | null } {
  let index = skipSpace(source, start + 'import'.length)
  if (source.startsWith('type', index) && !/[\w$]/.test(source[index + 4] ?? '')) {
    const end = endOfStatement(source, index)
    return { end, spec: null, error: null }
  }
  if (source[index] === "'" || source[index] === '"') {
    const text = readQuoted(source, index)
    if (!text) return { end: source.length, spec: null, error: 'O import não fechou.' }
    return { end: skipSemicolon(source, text.end), spec: null, error: null }
  }
  const fromAt = findFrom(source, index)
  if (fromAt < 0) return { end: source.length, spec: null, error: 'O import precisa de from.' }
  const clause = source.slice(index, fromAt).trim()
  index = skipSpace(source, fromAt + 4)
  const quoted = readQuoted(source, index)
  if (!quoted) return { end: source.length, spec: null, error: 'O import precisa de um módulo entre aspas.' }
  const end = skipSemicolon(source, quoted.end)
  if (!ALLOWED.has(quoted.value)) {
    return { end, spec: null, error: `O playground só importa de lucide-react ou leaflet. ${quoted.value} não está disponível.` }
  }
  const bindings = parseClause(clause)
  if (!bindings) return { end, spec: null, error: 'Não consegui ler este import.' }
  return { end, spec: { module: quoted.value, bindings }, error: null }
}

function parseClause(clause: string): ImportBinding[] | null {
  const bindings: ImportBinding[] = []
  let rest = clause.trim()
  if (!rest) return null
  if (rest.startsWith('*')) {
    const namespace = rest.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/)
    if (!namespace) return null
    return [{ local: namespace[1], imported: '*' }]
  }
  if (!rest.startsWith('{')) {
    const match = rest.match(/^([A-Za-z_$][\w$]*)\s*(?:,\s*([\s\S]*))?$/)
    if (!match) return null
    bindings.push({ local: match[1], imported: 'default' })
    rest = (match[2] ?? '').trim()
    if (!rest) return bindings
  }
  if (!rest.startsWith('{') || !rest.endsWith('}')) return null
  const inner = rest.slice(1, -1)
  if (!inner.trim()) return bindings
  for (const part of inner.split(',')) {
    const bit = part.trim()
    if (!bit) continue
    const alias = bit.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/)
    if (!alias) return null
    bindings.push({ local: alias[2] ?? alias[1], imported: alias[1] })
  }
  return bindings
}

function findFrom(source: string, start: number): number {
  let depth = 0
  let quote = ''
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]
    if (quote) {
      if (char === '\\') {
        i += 1
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    else if (char === '}') depth = Math.max(0, depth - 1)
    else if (char === ';' && depth === 0) return -1
    else if (depth === 0 && source.startsWith('from', i) && !/[\w$]/.test(source[i - 1] ?? '') && !/[\w$]/.test(source[i + 4] ?? '')) {
      return i
    }
  }
  return -1
}

function endOfStatement(source: string, start: number): number {
  const fromAt = findFrom(source, start)
  if (fromAt < 0) return source.length
  const quoted = readQuoted(source, skipSpace(source, fromAt + 4))
  if (!quoted) return source.length
  return skipSemicolon(source, quoted.end)
}

function readQuoted(source: string, index: number): { value: string; end: number } | null {
  const quote = source[index]
  if (quote !== "'" && quote !== '"') return null
  let value = ''
  for (let i = index + 1; i < source.length; i += 1) {
    const char = source[i]
    if (char === '\\') {
      value += source[i + 1] ?? ''
      i += 1
      continue
    }
    if (char === quote) return { value, end: i + 1 }
    value += char
  }
  return null
}

function skipSemicolon(source: string, index: number): number {
  const next = skipSpace(source, index)
  return source[next] === ';' ? next + 1 : next
}

function skipSpace(source: string, index: number): number {
  let i = index
  while (i < source.length && /[\s]/.test(source[i])) i += 1
  return i
}

function skipString(source: string, index: number): number {
  const quote = source[index]
  for (let i = index + 1; i < source.length; i += 1) {
    if (source[i] === '\\') {
      i += 1
      continue
    }
    if (source[i] === quote) return i + 1
  }
  return source.length
}
