/**
 * One color in, the colors you paint with.
 *
 * No theory names. Pass the color. Ask for a step, or take the whole sheet.
 * Steps and mixes are CSS (`color-mix`, `hsl(from …)`), so a `var(--token)`
 * works. The ink (`on`) is JavaScript when the color is hex or rgb, and
 * `contrast-color()` otherwise. Nothing here keeps state.
 *
 * ```ts
 * tone('#c8ff00')          // the color
 * tone('#c8ff00', 2)       // two steps toward white
 * tone('#c8ff00', -3)      // three steps toward black
 * tone.sheet('#c8ff00')    // roles, neighbors, the full scale
 * ```
 *
 * Levels run from -8 to 8. Each step is 12%.
 */
export const TONE_LEVELS = [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8] as const

export type ToneLevel = (typeof TONE_LEVELS)[number]

const STEP = 12
const MAX = 8

export type ToneSheet = {
  /** The color you passed. */
  color: string
  /** Ink that reads on `color`. */
  on: string
  /** A lighter fill of the same color. */
  container: string
  /** Ink that reads on `container`. */
  onContainer: string
  /** One step around the wheel. */
  secondary: string
  /** The other step around the wheel. */
  tertiary: string
  /** Across the wheel. */
  opposite: string
  /** The two colors sitting next to this one. */
  near: readonly [string, string]
  /** The two colors sitting next to the opposite. */
  sides: readonly [string, string]
  /** This color plus two evenly spaced. */
  three: readonly [string, string, string]
  /** This color plus three at right angles. */
  four: readonly [string, string, string, string]
  /** The color pulled toward gray. */
  mute: string
  /** Every step. `0` is the color. */
  scale: Record<ToneLevel, string>
}

function clamp(level: number): number {
  return Math.max(-MAX, Math.min(MAX, Math.round(level)))
}

/** The color, or a step toward white (positive) or black (negative). */
function toneAt(color: string, level = 0): string {
  const step = clamp(level)
  if (step === 0 || !color) return color
  const keep = 100 - Math.abs(step) * STEP
  const toward = step > 0 ? '#fff' : '#000'
  return `color-mix(in srgb, ${color} ${keep}%, ${toward})`
}

export function toneScale(color: string): Record<ToneLevel, string> {
  const scale = {} as Record<ToneLevel, string>
  for (const level of TONE_LEVELS) scale[level] = toneAt(color, level)
  return scale
}

function turn(color: string, degrees: number): string {
  const d = ((degrees % 360) + 360) % 360
  return `hsl(from ${color} calc(h + ${d}) s l)`
}

function parse(input: string): [number, number, number] | null {
  const s = input.trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(s)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return null
}

function channel(c: number): number {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

/** Black or white, whichever reads on `color`. */
function on(color: string): string {
  const rgb = parse(color)
  if (!rgb) return `contrast-color(${color})`
  const y = 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
  return y > 0.45 ? '#000000' : '#ffffff'
}

/** 0 is invisible, 1 is the color. */
function fade(color: string, amount = 1): string {
  const keep = Math.max(0, Math.min(1, amount))
  if (keep === 1) return color
  return `color-mix(in srgb, ${color} ${Math.round(keep * 100)}%, transparent)`
}

/** Pull the color toward gray. `amount` 0 stays, 1 is gray. */
function mute(color: string, amount = 0.45): string {
  const gray = Math.max(0, Math.min(1, amount))
  if (gray === 0) return color
  return `color-mix(in srgb, ${color} ${Math.round((1 - gray) * 100)}%, #8a8a8a)`
}

function lifted(color: string, level: number): string {
  const rgb = parse(color)
  const step = clamp(level)
  if (!rgb || step === 0) return toneAt(color, level)
  const t = (Math.abs(step) * STEP) / 100
  const toward = step > 0 ? 255 : 0
  const mix = (c: number) => Math.round(c + (toward - c) * t)
  const hex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${hex(mix(rgb[0]))}${hex(mix(rgb[1]))}${hex(mix(rgb[2]))}`
}

const sheets = new Map<string, ToneSheet>()
const SHEET_CAP = 32

function sheet(color: string): ToneSheet {
  const hit = sheets.get(color)
  if (hit) return hit
  const container = toneAt(color, 5)
  const made: ToneSheet = {
    color,
    on: on(color),
    container,
    onContainer: on(lifted(color, 5)),
    secondary: turn(color, 30),
    tertiary: turn(color, 330),
    opposite: turn(color, 180),
    near: [turn(color, 30), turn(color, 330)],
    sides: [turn(color, 150), turn(color, 210)],
    three: [color, turn(color, 120), turn(color, 240)],
    four: [color, turn(color, 90), turn(color, 180), turn(color, 270)],
    mute: mute(color),
    scale: toneScale(color),
  }
  if (sheets.size >= SHEET_CAP) {
    const oldest = sheets.keys().next().value
    if (oldest !== undefined) sheets.delete(oldest)
  }
  sheets.set(color, made)
  return made
}

export interface ToneFn {
  (color: string, level?: number): string
  sheet(color: string): ToneSheet
  on(color: string): string
  fade(color: string, amount?: number): string
  mute(color: string, amount?: number): string
  scale(color: string): Record<ToneLevel, string>
  near(color: string): readonly [string, string]
  opposite(color: string): string
  sides(color: string): readonly [string, string]
  three(color: string): readonly [string, string, string]
  four(color: string): readonly [string, string, string, string]
}

export const tone: ToneFn = Object.assign(toneAt, {
  sheet,
  on,
  fade,
  mute,
  scale: toneScale,
  near: (color: string) => sheet(color).near,
  opposite: (color: string) => sheet(color).opposite,
  sides: (color: string) => sheet(color).sides,
  three: (color: string) => sheet(color).three,
  four: (color: string) => sheet(color).four,
})
