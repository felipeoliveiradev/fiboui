import type { Width } from './MediaViewModel'

export const columns = '1fr 1fr 1fr'

export const widths: { label: string; value: Width; frame: number | string }[] = [
  { label: 'Small', value: 'small', frame: 240 },
  { label: 'Medium', value: 'medium', frame: 400 },
  { label: 'Large', value: 'large', frame: '100%' },
]

export const cells = [
  {
    cue: '01',
    title: 'Builders',
    body: 'Return the tree. mount() takes the view.',
  },
  {
    cue: '02',
    title: 'Signals',
    body: 'One value. Only that node patches.',
  },
  {
    cue: '03',
    title: 'Theme',
    body: 'Keys on the palette. Type and buttons read them.',
  },
] as const
