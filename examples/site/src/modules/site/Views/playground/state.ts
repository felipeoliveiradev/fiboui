import { signal } from 'fiboui'
import { helloExample } from './examples'
import { runPlay, type PlayError } from './run'

/** Source the editor writes. Only the highlight layer reads it. */
export const source = signal(helloExample)

/** Compiled preview. Only the preview pane reads it. */
export const output = signal<unknown>(null)

/** Compile error. Only the status line reads it. */
export const status = signal<PlayError | null>(null)

/** Suggestion menu. Only the menu reads it. */
export type PlaySuggest = {
  items: readonly string[]
  partial: string
  kind: 'method' | 'factory' | 'function'
  /** Completion is on a lowercase receiver (`todos.view`), not a widget chain. */
  signal: boolean
  from: number
  to: number
  top: number
  left: number
}

export const suggest = signal<PlaySuggest | null>(null)

function publish() {
  const result = runPlay(source.value)
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
