export type Tone = 'ink' | 'pink' | 'lime' | 'paper'

export const toneCopy =
  'extendTheme() swaps the keys. Type, surface, and buttons read the same palette.'

export const choices: { label: string; value: Tone }[] = [
  { label: 'Ink', value: 'ink' },
  { label: 'Pink', value: 'pink' },
  { label: 'Lime', value: 'lime' },
  { label: 'Paper', value: 'paper' },
]

export const tones: Record<Tone, Record<string, string>> = {
  ink: {
    primary: '#ff2d8a',
    onPrimary: '#000000',
    secondary: '#c8ff00',
    onSecondary: '#000000',
    background: '#000000',
    onBackground: '#ffffff',
    surface: '#141414',
    onSurface: '#ffffff',
    error: '#ff2d8a',
  },
  pink: {
    primary: '#000000',
    onPrimary: '#ffffff',
    secondary: '#c8ff00',
    onSecondary: '#000000',
    background: '#ff2d8a',
    onBackground: '#000000',
    surface: '#ff2d8a',
    onSurface: '#000000',
    error: '#000000',
  },
  lime: {
    primary: '#000000',
    onPrimary: '#c8ff00',
    secondary: '#ff2d8a',
    onSecondary: '#000000',
    background: '#c8ff00',
    onBackground: '#000000',
    surface: '#c8ff00',
    onSurface: '#000000',
    error: '#000000',
  },
  paper: {
    primary: '#ff2d8a',
    onPrimary: '#ffffff',
    secondary: '#c8ff00',
    onSecondary: '#000000',
    background: '#ffffff',
    onBackground: '#000000',
    surface: '#f4f4f4',
    onSurface: '#000000',
    error: '#ff2d8a',
  },
}

export const swatchKeys = ['primary', 'secondary', 'background', 'surface'] as const
