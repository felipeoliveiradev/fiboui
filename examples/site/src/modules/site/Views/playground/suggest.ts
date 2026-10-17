import { Box, type FiboChild } from 'fiboui'
import * as fiboui from 'fiboui'
import { editText } from './edit'
import { FACTORY_NAMES } from './labels'
import { CHAIN_METHODS } from './methods'
import { fillFor } from './fill'
import { ensureLucideNames, lucideNames } from './imports'
import { scheme } from './scheme'
import { suggest, type PlaySuggest } from './state'

export const SIGNAL_METHODS = [
  'add', 'clear', 'delete', 'filter', 'find', 'insert', 'length', '$length', 'map', 'move', 'remove', 'replace', 'search', 'set', 'update', 'view',
] as const
const ROW = 22
const VISIBLE = 12
const OVERSCAN = 4

/** Selection and scroll stay outside React. The signal only opens or filters the list. */
let activeIndex = 0
let replaceTo = 0
let windowStart = 0

/** One menu island, same list the extension shows in VS Code. */
export function codeSuggest(): FiboChild {
  const layer = Box()
    .position('absolute')
    .top(0)
    .left(0)
    .right(0)
    .bottom(0)
    .zIndex(3)
    .pointerEvents('none')
    .bindSignal(suggest)

  layer.children(() => {
    const menu = suggest.value
    if (!menu || menu.items.length === 0) return []
    windowStart = 0
    const html = shellHtml(menu)
    // Box drops dangerouslySetInnerHTML. Paint the rows after commit, same as the highlight layer.
    queueMicrotask(() => paintSuggestHtml(menu, html))
    return [
      Box()
        .className('play-suggest')
        .position('absolute')
        .top(menu.top)
        .left(menu.left)
        .width('420px')
        .height(`${Math.min(menu.items.length, VISIBLE) * ROW}px`)
        .maxHeight(`${ROW * VISIBLE}px`)
        .overflow('auto')
        .bg(scheme.surfaceContainerHighest)
        .border(`1px solid ${scheme.guide}`)
        .pointerEvents('auto')
        .props({
          id: 'play-suggest-list',
          role: 'listbox',
          onMouseDown: (event: Event) => event.preventDefault(),
          onClick: (event: MouseEvent) => {
            const row = (event.target as HTMLElement | null)?.closest('[data-name]') as HTMLElement | null
            if (row?.dataset.name) acceptName(row.dataset.name)
          },
          onMouseMove: (event: MouseEvent) => {
            const row = (event.target as HTMLElement | null)?.closest('[data-i]') as HTMLElement | null
            if (!row?.dataset.i) return
            const index = Number(row.dataset.i)
            if (index === activeIndex) return
            setActive(index)
          },
          onScroll: onSuggestScroll,
        }),
    ]
  })

  return layer
}

export function moveSuggest(direction: 1 | -1): boolean {
  const menu = suggest.value
  if (!menu || menu.items.length === 0) return false
  setActive(activeIndex + direction)
  return true
}

export function acceptActive(el: HTMLTextAreaElement): boolean {
  const menu = suggest.value
  if (!menu || menu.items.length === 0) return false
  writeInsert(el, menu, menu.items[activeIndex] ?? menu.items[0])
  return true
}

export function closeSuggest() {
  suggest.value = null
  document.querySelector('.play-code textarea')?.setAttribute('aria-expanded', 'false')
}

export function refreshSuggest(el: HTMLTextAreaElement) {
  const pos = el.selectionStart ?? 0
  const end = el.selectionEnd ?? pos
  if (pos !== end) {
    suggest.value = null
    el.setAttribute('aria-expanded', 'false')
    return
  }
  const found = queryAt(el.value, pos)
  if (found?.kind === 'import' && !lucideNames()) {
    void ensureLucideNames().then(() => refreshSuggest(el)).catch(() => undefined)
  }
  if (!found) {
    suggest.value = null
    el.setAttribute('aria-expanded', 'false')
    return
  }
  const pool = poolFor(found.kind, found.partial, found.signal)
  if (pool.length === 0) {
    suggest.value = null
    el.setAttribute('aria-expanded', 'false')
    return
  }
  const point = caretPoint(el, pos)
  replaceTo = pos
  const current = suggest.value
  if (
    current &&
    current.kind === found.kind &&
    current.partial === found.partial &&
    current.from === found.from &&
    current.signal === found.signal
  ) {
    const node = document.querySelector('.play-suggest') as HTMLElement | null
    if (node) {
      node.style.top = `${point.top}px`
      node.style.left = `${point.left}px`
    }
    return
  }
  el.setAttribute('aria-expanded', 'true')
  activeIndex = 0
  windowStart = 0
  suggest.value = {
    items: pool,
    partial: found.partial,
    kind: found.kind,
    signal: found.signal,
    from: found.from,
    to: pos,
    top: point.top,
    left: point.left,
  }
}

function acceptName(name: string) {
  const el = document.querySelector('.play-code textarea') as HTMLTextAreaElement | null
  const menu = suggest.value
  if (!el || !menu) return
  writeInsert(el, menu, name)
  el.focus()
}

function writeInsert(el: HTMLTextAreaElement, menu: PlaySuggest, name: string) {
  const end = completionEnd(el.value, menu.from, replaceTo)
  const nextStart = menu.from
  const fill = fillFor(name, menu.kind, menu.signal)
  const insert = `${name}${fill.text}`
  const caret = nextStart + name.length
  editText(el, menu.from, end, insert, caret + fill.start, caret + fill.end)
  el.setAttribute('aria-expanded', 'false')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  suggest.value = null
}

function completionEnd(value: string, from: number, caret: number): number {
  let identEnd = from
  while (identEnd < value.length && /[\w$]/.test(value[identEnd])) identEnd += 1
  const end = Math.max(identEnd, caret)
  if (value[identEnd] !== '(') return end
  let depth = 0
  for (let i = identEnd; i < value.length; i += 1) {
    if (value[i] === '(') depth += 1
    else if (value[i] === ')') {
      depth -= 1
      if (depth === 0) return Math.max(end, i + 1)
    }
  }
  return end
}

function inNoise(value: string, pos: number): boolean {
  let quote = ''
  for (let i = 0; i < pos; i += 1) {
    const char = value[i]
    if (quote) {
      if (char === '\\') { i += 1; continue }
      if (char === quote) quote = ''
      else if (quote !== '`' && char === '\n') quote = ''
      continue
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue }
    if (char === '/' && value[i + 1] === '/') {
      const nl = value.indexOf('\n', i)
      if (nl < 0 || nl >= pos) return true
      i = nl
      continue
    }
    if (char === '/' && value[i + 1] === '*') {
      const end = value.indexOf('*/', i + 2)
      if (end < 0 || end + 1 >= pos) return true
      i = end + 1
    }
  }
  return quote !== ''
}

export function queryAt(value: string, pos: number): { kind: PlaySuggest['kind']; partial: string; from: number; signal: boolean } | null {
  if (inNoise(value, pos)) return null
  const imported = importAt(value, pos)
  if (imported) return { kind: 'import', partial: imported.partial, from: imported.from, signal: false }
  const prefix = value.slice(0, pos)
  const method = prefix.match(/\.([A-Za-z0-9_$]*)$/)
  if (method) {
    const partial = method[1] ?? ''
    const dot = pos - partial.length - 1
    const receiver = /([A-Za-z_$][\w$]*)$/.exec(prefix.slice(0, dot))
    const signal = !!receiver && /^[a-z_]/.test(receiver[1])
    return { kind: 'method', partial, from: pos - partial.length, signal }
  }
  const ident = prefix.match(/(?:^|[^\w$])([A-Za-z_$][\w$]*)$/)
  if (!ident?.[1]) return null
  const partial = ident[1]
  const kind: PlaySuggest['kind'] = /^[A-Z]/.test(partial) ? 'factory' : 'function'
  return { kind, partial, from: pos - partial.length, signal: false }
}

const FACTORY_SET = new Set<string>(FACTORY_NAMES)
const FUNCTIONS = Object.keys(fiboui)
  .filter((name) => /^[a-z_$]/.test(name) && typeof (fiboui as Record<string, unknown>)[name] === 'function' && !FACTORY_SET.has(name))
  .sort()

const methodCache = new Map<string, readonly string[]>()
const factoryCache = new Map<string, readonly string[]>()
const functionCache = new Map<string, readonly string[]>()

function importAt(value: string, pos: number): { partial: string; from: number } | null {
  const prefix = value.slice(0, pos)
  const open = prefix.match(/(?:^|\n)\s*import\s*\{([^}]*)$/)
  if (!open) return null
  const from = /\}[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/.exec(value.slice(pos))
  if (from && from[1] !== 'lucide-react') return null
  const named = /([A-Za-z_$][\w$]*)$/.exec(open[1] ?? '')
  const partial = named?.[1] ?? ''
  return { partial, from: pos - partial.length }
}

function poolFor(kind: PlaySuggest['kind'], partial: string, signal: boolean): readonly string[] {
  if (kind === 'import') return iconNamesFor(partial)
  if (kind === 'method') return signal ? signalMethodsFor(partial) : methodsFor(partial)
  if (kind === 'factory') return factoriesFor(partial)
  return functionsFor(partial)
}

function iconNamesFor(partial: string): readonly string[] {
  const names = lucideNames() ?? []
  return partial ? names.filter((name) => name.startsWith(partial)) : names
}

function signalMethodsFor(partial: string): readonly string[] {
  return partial ? SIGNAL_METHODS.filter((name) => name.startsWith(partial)) : SIGNAL_METHODS
}

function methodsFor(partial: string): readonly string[] {
  const hit = methodCache.get(partial)
  if (hit) return hit
  const list = partial ? CHAIN_METHODS.filter((name) => name.startsWith(partial)) : CHAIN_METHODS
  methodCache.set(partial, list)
  return list
}

function factoriesFor(partial: string): readonly string[] {
  const hit = factoryCache.get(partial)
  if (hit) return hit
  const list = FACTORY_NAMES.filter((name) => name.startsWith(partial))
  factoryCache.set(partial, list)
  return list
}

function functionsFor(partial: string): readonly string[] {
  const hit = functionCache.get(partial)
  if (hit) return hit
  const list = FUNCTIONS.filter((name) => name.startsWith(partial))
  const withImport = partial && 'import'.startsWith(partial) ? ['import', ...list] : list
  functionCache.set(partial, withImport)
  return withImport
}

function paintSuggestHtml(menu: PlaySuggest, html: string) {
  const write = () => {
    if (suggest.value !== menu) return true
    const node = document.querySelector('.play-suggest') as HTMLElement | null
    if (!node) return false
    node.innerHTML = html
    return true
  }
  if (!write()) requestAnimationFrame(write)
}

function shellHtml(menu: PlaySuggest): string {
  const end = Math.min(menu.items.length, VISIBLE + OVERSCAN * 2)
  return `<div style="height:${menu.items.length * ROW}px;position:relative"><div class="play-suggest-rows" style="position:absolute;left:0;right:0;top:0">${rowsHtml(menu, 0, end)}</div></div>`
}

function rowsHtml(menu: PlaySuggest, start: number, end: number): string {
  const detail = menu.signal ? 'fiboui list' : menu.kind === 'import' ? 'lucide-react' : menu.kind === 'factory' ? 'fiboui factory' : menu.kind === 'function' ? 'fiboui function' : 'fiboui chain'
  const idle = idleColor(menu.kind)
  let html = ''
  for (let index = start; index < end; index += 1) {
    const name = menu.items[index]
    const selected = index === activeIndex
    html += `<div role="option" aria-selected="${selected ? 'true' : 'false'}" data-i="${index}" data-name="${escapeHtml(name)}" style="display:flex;align-items:center;height:${ROW}px;padding:0 8px;gap:6px;background:${selected ? scheme.listActive : 'transparent'};color:${selected ? scheme.onSurface : scheme.onSurface};cursor:pointer;white-space:nowrap">${glyph(menu.kind, selected ? scheme.primary : idle)}<span style="flex:1;overflow:hidden;text-overflow:ellipsis">${labelHtml(name, menu.partial)}</span><span style="margin-left:16px;color:${scheme.onSurfaceVariant};font-size:12px">${detail}</span></div>`
  }
  return html
}

function onSuggestScroll(event: Event) {
  const scroller = event.currentTarget as HTMLElement
  const menu = suggest.value
  const start = Math.max(0, Math.floor(scroller.scrollTop / ROW) - OVERSCAN)
  if (menu && menu.items.length > 0) {
    activeIndex = Math.min(menu.items.length - 1, Math.max(0, Math.floor(scroller.scrollTop / ROW)))
  }
  if (start === windowStart) {
    paintSelection(scroller)
    return
  }
  windowStart = start
  paintWindow()
}

function paintWindow() {
  const menu = suggest.value
  const host = document.querySelector('.play-suggest-rows') as HTMLElement | null
  if (!menu || !host) return
  const end = Math.min(menu.items.length, windowStart + VISIBLE + OVERSCAN * 2)
  host.style.top = `${windowStart * ROW}px`
  host.innerHTML = rowsHtml(menu, windowStart, end)
}

function setActive(index: number) {
  const menu = suggest.value
  if (!menu || menu.items.length === 0) return
  const count = menu.items.length
  activeIndex = (index + count) % count
  const scroller = document.querySelector('.play-suggest') as HTMLElement | null
  if (!scroller) return
  const rowTop = activeIndex * ROW
  const viewBottom = scroller.scrollTop + scroller.clientHeight
  if (rowTop < scroller.scrollTop) scroller.scrollTop = rowTop
  else if (rowTop + ROW > viewBottom) scroller.scrollTop = rowTop + ROW - scroller.clientHeight
  const row = scroller.querySelector(`[data-i="${activeIndex}"]`)
  if (!row) paintWindow()
  paintSelection(scroller)
}

function paintSelection(scroller: ParentNode) {
  const idle = idleColor(suggest.value?.kind ?? 'method')
  const rows = scroller.querySelectorAll<HTMLElement>('[data-i]')
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const on = Number(row.dataset.i) === activeIndex
    row.style.background = on ? scheme.listActive : 'transparent'
    row.style.color = scheme.onSurface
    const mark = row.querySelector('path, text')
    if (mark) mark.setAttribute('fill', on ? scheme.primary : idle)
  }
}

function idleColor(kind: PlaySuggest['kind']): string {
  if (kind === 'factory' || kind === 'import') return scheme.widget
  if (kind === 'function') return scheme.keyword
  return scheme.onSurface
}

function glyph(kind: PlaySuggest['kind'], fill: string): string {
  if (kind === 'function') {
    return `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><text x="4" y="13" fill="${fill}" font-size="13" font-family="-apple-system,Segoe UI,sans-serif">f</text></svg>`
  }
  return cube(fill)
}

function labelHtml(name: string, partial: string): string {
  if (partial && name.startsWith(partial)) {
    return `<span style="font-weight:600">${escapeHtml(partial)}</span>${escapeHtml(name.slice(partial.length))}`
  }
  return escapeHtml(name)
}

function cube(fill: string): string {
  return `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="${fill}" d="M8 1.1 14.4 4.5 8 7.9 1.6 4.5 8 1.1zM2 5.7l5.2 2.8v6.1L2 11.8V5.7zM8.8 14.6V8.5L14 5.7v6.1l-5.2 2.8z"/></svg>`
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

let charWidth = 7.8

function caretPoint(el: HTMLTextAreaElement, pos: number): { top: number; left: number } {
  if (charWidth === 7.8) charWidth = measureChar()
  const before = el.value.slice(0, pos)
  const line = before.split('\n').length - 1
  const col = before.length - before.lastIndexOf('\n') - 1
  let top = line * 22 - el.scrollTop + 22
  let left = 44 + col * charWidth - el.scrollLeft
  if (top > el.clientHeight - ROW * VISIBLE) top = Math.max(8, line * 22 - el.scrollTop - ROW * VISIBLE)
  left = Math.min(Math.max(8, left), Math.max(8, el.clientWidth - 428))
  return { top, left }
}

function measureChar(): number {
  const probe = document.createElement('span')
  probe.style.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.textContent = '0000000000'
  document.body.appendChild(probe)
  const width = probe.getBoundingClientRect().width / 10
  probe.remove()
  return width > 0 ? width : 7.8
}
