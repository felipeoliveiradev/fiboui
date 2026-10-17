import { signal } from 'fiboui'
import { helloExample } from './examples'
import { toReact } from './react'
import { runPlayAsync, type PlayError } from './run'

/** Source the editor writes. Only the highlight layer reads it. */
export const source = signal(helloExample)

/** Compiled preview. Only the preview pane reads it. */
export const output = signal<unknown>(null)

/** Compile error. Only the status line reads it. */
export const status = signal<PlayError | null>(null)

/** JSX equivalent. Only the React panel reads it. Typing does not update it. */
export const reactCode = signal<string | null>(null)

/** Suggestion menu. Only the menu reads it. */
export type PlaySuggest = {
  items: readonly string[]
  partial: string
  kind: 'method' | 'factory' | 'function' | 'import'
  /** Completion is on a lowercase receiver (`todos.view`), not a widget chain. */
  signal: boolean
  from: number
  to: number
  top: number
  left: number
}

export const suggest = signal<PlaySuggest | null>(null)

let previewTicket = 0

async function publish() {
  const ticket = ++previewTicket
  const result = await runPlayAsync(source.value)
  if (ticket !== previewTicket) return
  if (!result.ok) {
    status.value = result.error
    return
  }
  output.value = result.node
  status.value = null
}

publish()

/** Compile the editor once. Typing does not call this. */
export function runPreview() {
  const field = document.querySelector('.play-code textarea') as HTMLTextAreaElement | null
  if (field) source.value = field.value
  publish()
}

/** Read the editor once and show the JSX equivalent. */
export function showReact() {
  const field = document.querySelector('.play-code textarea') as HTMLTextAreaElement | null
  const text = field ? field.value : source.value
  try {
    reactCode.value = toReact(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    reactCode.value = `// Could not translate this snippet.\n// ${message}`
  }
}
