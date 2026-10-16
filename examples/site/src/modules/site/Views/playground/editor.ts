import { Box, Column, Text, Textarea, type FiboChild } from 'fiboui'
import { editText } from './edit'
import { INDENT, planEnter } from './indent'
import { computeLabels } from './labels'
import { runPreview, source, status } from './state'
import { acceptActive, closeSuggest, moveSuggest, refreshSuggest } from './suggest'
import { scheme, typeScale } from './scheme'

const ink = scheme.onSurface
const comment = scheme.comment
const string = scheme.string
const number = scheme.number
const keyword = scheme.keyword
const factory = scheme.widget
const method = scheme.onSurface
const punct = scheme.punctuation
const gutter = scheme.onSurfaceVariant
const gutterActive = scheme.onSurface
const guide = scheme.guide
const guideActive = scheme.guideActive

const KEYWORDS = new Set([
  'return', 'const', 'let', 'var', 'function', 'if', 'else', 'true', 'false', 'null', 'new', 'import', 'from', 'export',
])

/**
 * One island for the colors. A keystroke updates this box only —
 * not a Text per token, and not the preview.
 */
export function codeHighlight(): FiboChild {
  const layer = Box()
    .className('play-highlight')
    .position('absolute')
    .top(0)
    .left(0)
    .right(0)
    .bottom(0)
    .overflow('hidden')
    .pointerEvents('none')
    .zIndex(0)

  layer.children(() => {
    layer.props({ dangerouslySetInnerHTML: { __html: highlightHtml(source.value) } })
    return []
  })

  return layer
}

/**
 * The field owns the text. Keystrokes paint the colors in the DOM and do not
 * notify a signal, so the preview stays still until Run.
 */
export function codeField(): FiboChild {
  return Textarea(source.value)
    .resize('none')
    .width('100%')
    .height('100%')
    .bg('transparent')
    .border('none')
    .className('play-code')
    .props({
      spellCheck: false,
      'aria-label': 'Playground code',
      'aria-autocomplete': 'list',
      'aria-controls': 'play-suggest-list',
      'aria-expanded': 'false',
      onKeyDown: onEditorKey,
      onInput: (event: Event) => {
        const field = event.target as HTMLTextAreaElement
        schedulePaint(field.value, field)
      },
      onClick: (event: MouseEvent) => {
        const field = event.target as HTMLTextAreaElement
        refreshSuggest(field)
        schedulePaint(field.value, field)
      },
      onKeyUp: (event: KeyboardEvent) => {
        const field = event.target as HTMLTextAreaElement
        if (event.key !== 'Escape') refreshSuggest(field)
        schedulePaint(field.value, field)
      },
      onScroll: syncScroll,
    })
}

/** Replace the editor text and run the preview once. Used by the sample chips. */
export function showCode(code: string) {
  const field = document.querySelector('.play-code textarea') as HTMLTextAreaElement | null
  if (field) {
    field.focus()
    field.value = code
    field.setSelectionRange(code.length, code.length)
  }
  closeSuggest()
  caretLine = code.split('\n').length - 1
  paintHighlight(code)
  runPreview()
}

/** Status line. Subscribes to `status` only. */
export function codeStatus(): FiboChild {
  return Box()
    .width('100%')
    .bindSignal(status)
    .children(() => {
      const error = status.value
      const bar = Box()
        .width('100%')
        .minHeight('36px')
        .padding('8px 12px')
        .bg(error ? scheme.errorContainer : scheme.surfaceContainerHigh)
        .borderTop(`1px solid ${scheme.outlineVariant}`)
        .props({ role: 'status' })
      if (!error) {
        return [
          bar.children(
            Text('Ready')
              .color(scheme.onSurfaceVariant)
              .fontSize(typeScale.bodySmall.fontSize)
              .fontWeight(typeScale.bodySmall.fontWeight),
          ),
        ]
      }
      return [
        bar.children(
          Column().gap('2px').children([
            Text(error.message)
              .color(scheme.onErrorContainer)
              .fontSize(typeScale.bodySmall.fontSize)
              .fontFamily('ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'),
            error.hint
              ? Text(error.hint).color(scheme.onErrorContainer).fontSize(typeScale.bodySmall.fontSize).lineHeight('18px')
              : Text(' '),
            error.lesson
              ? Text(error.lesson)
                  .color(scheme.onErrorContainer)
                  .fontSize(typeScale.bodySmall.fontSize)
                  .fontFamily('ui-monospace, SFMono-Regular, Menlo, Consolas, monospace')
                  .css({ whiteSpace: 'pre-wrap' })
              : Text(''),
          ]),
        ),
      ]
    })
}

let paintFrame = 0
let caretLine = 0

function schedulePaint(text: string, field?: HTMLTextAreaElement) {
  if (field) caretLine = lineOf(text, caretOffset(field))
  window.cancelAnimationFrame(paintFrame)
  paintFrame = window.requestAnimationFrame(() => paintHighlight(text))
}

function caretOffset(field: HTMLTextAreaElement): number {
  if (field.selectionDirection === 'backward') return field.selectionStart ?? 0
  return field.selectionEnd ?? field.selectionStart ?? 0
}

function lineOf(text: string, pos: number): number {
  return text.slice(0, pos).split('\n').length - 1
}

function paintHighlight(text: string) {
  const node = document.querySelector('.play-highlight') as HTMLElement | null
  const field = document.querySelector('.play-code textarea') as HTMLTextAreaElement | null
  if (!node) return
  node.innerHTML = highlightHtml(text)
  if (field) {
    node.scrollTop = field.scrollTop
    node.scrollLeft = field.scrollLeft
  }
}

function highlightHtml(text: string): string {
  const labels = labelsByLine(text, computeLabels(text))
  return text.split('\n').map((row, index) => {
    const active = index === caretLine
    const body = tokens(row).map((token) => `<span style="color:${token.color}">${escapeHtml(token.text)}</span>`).join('')
    const close = labels.has(index)
      ? `<span style="color:${comment};font-style:italic">  // ${escapeHtml(labels.get(index) ?? '')}</span>`
      : ''
    const num = active ? gutterActive : gutter
    return `<div style="position:relative;height:22px;line-height:22px;font:13px/22px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;background:${active ? scheme.surfaceContainer : 'transparent'}">${indentGuides(row, active)}<span style="display:inline-block;width:48px;padding-right:12px;text-align:right;color:${num};font-size:12px">${index + 1}</span>${body}${close}</div>`
  }).join('')
}

function indentGuides(row: string, active: boolean): string {
  const spaces = /^ */.exec(row)?.[0].length ?? 0
  const depth = Math.floor(spaces / 2)
  let html = ''
  for (let level = 1; level <= depth; level += 1) {
    const left = 48 + level * 15.6
    const color = active && level === depth ? guideActive : guide
    html += `<span style="position:absolute;left:${left}px;top:0;bottom:0;width:1px;background:${color}"></span>`
  }
  return html
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function labelsByLine(text: string, items: { offset: number; label: string }[]) {
  const best = new Map<number, { offset: number; label: string }>()
  for (const item of items) {
    const line = text.slice(0, item.offset).split('\n').length - 1
    const prev = best.get(line)
    if (!prev || item.offset > prev.offset) best.set(line, item)
  }
  const map = new Map<number, string>()
  for (const [line, item] of best) map.set(line, item.label)
  return map
}

interface Token {
  text: string
  color: string
}

function tokens(line: string): Token[] {
  const out: Token[] = []
  const pattern =
    /(\/\/.*$|[\uD800-\uDBFF][\uDC00-\uDFFF]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\.[A-Za-z_$][\w$]*\b|\b[A-Z][A-Za-z0-9_$]*(?=\s*\()|\b(?:return|const|let|var|function|if|else|true|false|null|new|import|from|export)\b|[()[\]{},.;]|[A-Za-z_$][\w$]*|\s+|\S)/g
  let open = ''
  for (const match of line.matchAll(pattern)) {
    const text = match[0]
    if (open) {
      out.push({ text, color: string })
      if (text === open || (text.startsWith(open) && text.endsWith(open) && text.length > 1)) open = ''
      continue
    }
    if ((text === '"' || text === "'" || text === '`') || ((text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) && !text.endsWith(text[0]))) {
      open = text[0]
      out.push({ text, color: string })
      continue
    }
    out.push({ text, color: colorOf(text) })
  }
  if (out.length === 0) out.push({ text: ' ', color: ink })
  return out
}

function colorOf(text: string): string {
  if (text.startsWith('//')) return comment
  if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) return string
  if (/^\d/.test(text)) return number
  if (text.startsWith('.')) return method
  if (/^[A-Z]/.test(text)) return factory
  if (KEYWORDS.has(text)) return keyword
  if (/^[()[\]{},.;]$/.test(text)) return punct
  return ink
}

function onEditorKey(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  const el = event.target as HTMLTextAreaElement
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    closeSuggest()
    runPreview()
    return
  }
  if (event.key === 'Tab') {
    event.preventDefault()
    if (!event.shiftKey && acceptActive(el)) return
    insertTab(el, event.shiftKey)
    return
  }
  if (event.key === 'ArrowDown' && moveSuggest(1)) {
    event.preventDefault()
    return
  }
  if (event.key === 'ArrowUp' && moveSuggest(-1)) {
    event.preventDefault()
    return
  }
  if (event.key === 'Enter' && !event.shiftKey && acceptActive(el)) {
    event.preventDefault()
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    closeSuggest()
    return
  }
  keepIndent(event)
}

/** Tab stays in the editor: two spaces, or Shift+Tab removes them. */
function insertTab(el: HTMLTextAreaElement, shift: boolean) {
  const value = el.value
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? start
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const inclusiveEnd = end > start && value[end - 1] === '\n' ? end - 1 : end
  const blockBreak = value.indexOf('\n', inclusiveEnd)
  const blockEnd = blockBreak < 0 ? value.length : blockBreak
  const spansLines = value.slice(start, end).includes('\n')

  if (shift || spansLines || start !== end) {
    const lines = value.slice(lineStart, blockEnd).split('\n')
    const nextLines = lines.map((line) => (shift ? outdent(line) : INDENT + line))
    const block = nextLines.join('\n')
    const caret = lineStart + block.length
    editText(el, lineStart, blockEnd, block, lineStart, caret)
    schedulePaint(el.value, el)
    return
  }

  const caret = start + INDENT.length
  editText(el, start, end, INDENT, caret, caret)
  schedulePaint(el.value, el)
}

function outdent(line: string): string {
  if (line.startsWith(INDENT)) return line.slice(INDENT.length)
  if (line.startsWith(' ')) return line.slice(1)
  return line
}

function keepIndent(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey) return
  const el = event.target as HTMLTextAreaElement
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? start
  const lineStart = el.value.lastIndexOf('\n', start - 1) + 1
  const prevLine = el.value.slice(lineStart, start)
  const lineBreak = el.value.indexOf('\n', end)
  const lineEnd = lineBreak < 0 ? el.value.length : lineBreak
  const restOfLine = el.value.slice(end, lineEnd)
  const plan = planEnter(prevLine, restOfLine)
  event.preventDefault()
  const caret = start + plan.caret
  editText(el, start, end + plan.eat, plan.insert, caret, caret)
  schedulePaint(el.value, el)
}

function syncScroll(event: Event) {
  const el = event.target as HTMLTextAreaElement
  const highlight = el.closest('.play-stage')?.querySelector('.play-highlight') as HTMLElement | null
  if (highlight) {
    highlight.scrollTop = el.scrollTop
    highlight.scrollLeft = el.scrollLeft
  }
  refreshSuggest(el)
}
