import { describe, expect, it } from 'vitest'
import { TONE_LEVELS, tone, toneScale } from '../src/theme/tone'

describe('tone', () => {
  it('returns the color when no subtone is asked', () => {
    expect(tone('#c8ff00')).toBe('#c8ff00')
    expect(tone('#c8ff00', 0)).toBe('#c8ff00')
  })

  it('walks toward white and black in steps', () => {
    expect(tone('#c8ff00', 1)).toBe('color-mix(in srgb, #c8ff00 88%, #fff)')
    expect(tone('#c8ff00', 2)).toBe('color-mix(in srgb, #c8ff00 76%, #fff)')
    expect(tone('#c8ff00', -3)).toBe('color-mix(in srgb, #c8ff00 64%, #000)')
  })

  it('keeps a CSS variable inside the mix', () => {
    expect(tone('var(--fibo-primary)', 1)).toBe(
      'color-mix(in srgb, var(--fibo-primary) 88%, #fff)',
    )
  })

  it('clamps to eight steps', () => {
    expect(tone('#c8ff00', 20)).toBe(tone('#c8ff00', 8))
    expect(tone('#c8ff00', -20)).toBe(tone('#c8ff00', -8))
  })

  it('scale has every level and the tone at 0', () => {
    const scale = toneScale('#ff2d8a')
    expect(Object.keys(scale).map(Number).sort((a, b) => a - b)).toEqual([...TONE_LEVELS])
    expect(scale[0]).toBe('#ff2d8a')
    expect(scale[4]).toBe(tone('#ff2d8a', 4))
    expect(scale[-4]).toBe(tone('#ff2d8a', -4))
  })

  it('picks ink and builds a sheet without keeping state', () => {
    expect(tone.on('#c8ff00')).toBe('#000000')
    expect(tone.on('#111111')).toBe('#ffffff')
    const sheet = tone.sheet('#c8ff00')
    expect(sheet.color).toBe('#c8ff00')
    expect(sheet.on).toBe('#000000')
    expect(sheet.secondary).toBe('hsl(from #c8ff00 calc(h + 30) s l)')
    expect(sheet.opposite).toBe('hsl(from #c8ff00 calc(h + 180) s l)')
    expect(sheet.near).toHaveLength(2)
    expect(sheet.three).toHaveLength(3)
    expect(sheet.four).toHaveLength(4)
    expect(sheet.sides).toHaveLength(2)
    expect(tone.sheet('#c8ff00')).toBe(sheet)
  })
})
