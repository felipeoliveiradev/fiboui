import { signal } from 'fiboui/core'
import type { Tone } from './ThemeConstants'

export const accent = signal<Tone>('pink')

export function selectTone(next: Tone) {
  accent.value = next
}

export function toneName(value: Tone) {
  const head = value[0].toUpperCase()
  return head + value.slice(1)
}
