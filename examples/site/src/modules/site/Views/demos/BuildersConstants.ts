export type ButtonKind = 'filled' | 'outlined' | 'text'

export const eyebrow = '01 · Builders'
export const title = 'Hello'
export const caption = 'A caption under the same type scale. No JSX — the return is the view.'

type Action = { label: string; kind: ButtonKind }

export const actions: Action[] = [
  { label: 'Filled', kind: 'filled' },
  { label: 'Outlined', kind: 'outlined' },
  { label: 'Text', kind: 'text' },
]

export const facts = [
  { label: 'API', value: 'Fluent' },
  { label: 'Tree', value: 'Return' },
  { label: 'Mount', value: 'Once' },
] as const
