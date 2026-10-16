export const staggerMs = 90

export type MotionPreset = 'fadeIn' | 'slideUp' | 'pop' | 'blurIn' | 'bounce'

export type MotionTileSpec = {
  label: string
  preset: MotionPreset
  accent: string
  cue: string
  hint: string
}

export const tiles: readonly MotionTileSpec[] = [
  {
    label: 'Fade',
    preset: 'fadeIn',
    accent: '#ffffff',
    cue: '01',
    hint: 'Opacity',
  },
  {
    label: 'Rise',
    preset: 'slideUp',
    accent: '#c8ff00',
    cue: '02',
    hint: 'Translate Y',
  },
  {
    label: 'Pop',
    preset: 'pop',
    accent: '#ff2d8a',
    cue: '03',
    hint: 'Scale',
  },
  {
    label: 'Blur',
    preset: 'blurIn',
    accent: '#9a9a9a',
    cue: '04',
    hint: 'Filter',
  },
  {
    label: 'Bounce',
    preset: 'bounce',
    accent: '#ff2d8a',
    cue: '05',
    hint: 'Spring',
  },
]
