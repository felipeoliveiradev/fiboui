import { extendTheme, noirTheme } from 'fiboui'

export const ink = '#0a0a0a'
export const paper = '#ffffff'
export const red = '#ff3b30'
export const pink = '#ff2d8a'
export const lime = '#c8ff00'
export const chalk = '#ffffff'
export const ash = '#9a9a9a'
export const muted = ash
export const line = '1px solid rgba(255,255,255,0.16)'
export const face = 'Geist, Helvetica, sans-serif'
export const serif = '"Instrument Serif", "Times New Roman", serif'

export const siteColors = {
  primary: lime,
  onPrimary: '#000000',
  secondary: pink,
  onSecondary: chalk,
  background: ink,
  onBackground: chalk,
  surface: '#141414',
  onSurface: chalk,
  error: red,
} as const

/** Full 2.4 theme — partial `{ colors }` alone drops spacing and crashes. */
export const siteTheme = extendTheme(noirTheme, {
  name: 'fiboui-site',
  colors: siteColors,
  fontFamily: face,
})
