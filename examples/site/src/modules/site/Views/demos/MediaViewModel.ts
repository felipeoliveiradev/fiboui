import { signal } from 'fiboui/core'

export type Width = 'small' | 'medium' | 'large'

export const width = signal<Width>('large')

export function selectWidth(next: Width) {
  width.value = next
}
