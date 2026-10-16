/**
 * Flutter ColorScheme for the playground editor only.
 * Each step is a different surface, so bars, code, preview and menus separate.
 */
export const scheme = {
  background: '#09090B',
  onBackground: '#F4F4F5',

  surfaceContainerLowest: '#0C0C0E',
  surfaceContainerLow: '#141416',
  surfaceContainer: '#1C1C1F',
  surfaceContainerHigh: '#242428',
  surfaceContainerHighest: '#2E2E33',

  onSurface: '#F4F4F5',
  onSurfaceVariant: '#A1A1AA',

  primary: '#4EC9B0',
  onPrimary: '#06241F',
  primaryContainer: '#14332E',
  onPrimaryContainer: '#B7F0E4',

  secondary: '#C4B5FD',
  onSecondary: '#1E1633',

  error: '#F87171',
  onError: '#2A0B0B',
  errorContainer: '#3F1518',
  onErrorContainer: '#FECDD3',

  outline: '#3F3F46',
  outlineVariant: '#2A2A2E',

  widget: '#4EC9B0',
  keyword: '#C4B5FD',
  string: '#CE9178',
  number: '#B5CEA8',
  comment: '#A1A1AA',
  punctuation: '#8A8A93',
  guide: '#6E6E78',
  guideActive: '#4EC9B0',
  selection: '#3D7A6C',
  listActive: '#3A4F4A',
} as const

export const typeScale = {
  labelSmall: { fontSize: '11px', letterSpacing: '0.14em', fontWeight: 500 },
  labelMedium: { fontSize: '12px', letterSpacing: '0.04em', fontWeight: 600 },
  bodySmall: { fontSize: '12px', letterSpacing: '0', fontWeight: 400 },
  bodyMedium: { fontSize: '13px', letterSpacing: '0', fontWeight: 400 },
} as const
