export type FillKind = 'method' | 'factory' | 'function' | 'import'

export type Fill = {
  text: string
  /** Caret, or selection start, counted from the start of `text`. */
  start: number
  end: number
}

const STR: Fill = { text: "('')", start: 2, end: 2 }
const NUM: Fill = { text: '(0)', start: 1, end: 2 }
const BOOL: Fill = { text: '(true)', start: 1, end: 5 }
const FN: Fill = { text: '(() => )', start: 7, end: 7 }
const LIST: Fill = { text: '([])', start: 2, end: 2 }
const OBJ: Fill = { text: '({})', start: 2, end: 2 }
const EMPTY: Fill = { text: '()', start: 1, end: 1 }
const PROP: Fill = { text: '', start: 0, end: 0 }

const FN_NAMES = new Set([
  'onSubmit', 'onInvalid', 'onChange', 'onCommit', 'onPress', 'onHover', 'onClick', 'onAdd',
  'onToggle', 'onEndReached', 'onPanStart', 'onPanUpdate', 'onPanEnd',
  'beforeSubmit', 'afterSubmit', 'renderItem', 'itemStyle', 'itemHover', 'itemActive', 'itemFocus',
  'hover', 'active', 'press', 'visited', 'focusWithin', 'firstChild', 'lastChild', 'disabledState',
  'groupHover', 'groupFocus', 'groupActive', 'groupFocusWithin',
  'computed', 'signal', 'rule',
])

const LIST_NAMES = new Set(['children', 'items', 'columns'])
const OBJ_NAMES = new Set(['validation', 'style', 'props', 'providers', 'provider', 'sm', 'md', 'lg', 'xl'])
const EMPTY_NAMES = new Set([
  'submit', 'reset', 'resetStyle', 'clean', 'focus', 'build', 'bindSignal',
  'hug', 'grid', 'inlineFlex', 'inlineGrid', 'block', 'inlineBlock',
  'center', 'centerX', 'centerY', 'spaceBetween', 'spaceAround', 'spaceEvenly',
  'fill', 'fillWidth', 'fillHeight', 'circle', 'scrollProgress', 'smoothScroll', 'group',
  'hidden', 'scaledToFill', 'scaledToFit',
])
const BOOL_NAMES = new Set([
  'disabled', 'checked', 'required', 'loading', 'multiple', 'expand', 'controlled',
  'indeterminate', 'readonly', 'readOnly',
])
const LABEL_FACTORIES = new Set(['Text', 'Button', 'Badge', 'Label', 'Image'])
const SIGNAL_EMPTY = new Set(['add', 'clear'])
const SIGNAL_FN = new Set(['filter', 'map'])
const SIGNAL_LIST = new Set(['set'])
const SIGNAL_PROP = new Set(['length', '$length'])
const SIGNAL_INSERT: Fill = { text: '(0, {})', start: 5, end: 5 }
const SIGNAL_MOVE: Fill = { text: '(0, 0)', start: 1, end: 2 }
const STRING_FUNCTIONS = new Set(['required', 'email'])
const NUMBER_FUNCTIONS = new Set(['min', 'max', 'minLength', 'maxLength'])
const NOT_NUMBER = new Set(['scaledToFill', 'scaledToFit', 'sizeHeight', 'columns'])
const REGEX: Fill = { text: '(/./)', start: 2, end: 3 }

function isNumberName(name: string): boolean {
  if (NOT_NUMBER.has(name)) return false
  if (/^(m|p|px|py|mx|my|min|max)$/.test(name)) return true
  return /^(padding|margin|gap|width|height|size|fontSize|fontWeight|opacity|radius|rounded|top|left|right|bottom|rotate|scale|delay|duration|zIndex|blur|lineHeight|letterSpacing|rows|inset|borderWidth|borderRadius)([A-Z][A-Za-z0-9]*)?$/.test(name)
}

/** What to drop inside the parentheses, with the caret on that sample. */
export function fillFor(name: string, kind: FillKind, signal = false): Fill {
  if (signal) {
    if (SIGNAL_PROP.has(name)) return PROP
    if (name === 'insert') return SIGNAL_INSERT
    if (name === 'move') return SIGNAL_MOVE
    if (SIGNAL_EMPTY.has(name)) return EMPTY
    if (SIGNAL_LIST.has(name)) return LIST
    if (SIGNAL_FN.has(name)) return FN
  }
  if (name === 'import' && kind === 'function') return { text: " {  } from 'lucide-react'", start: 3, end: 3 }
  if (kind === 'import') return PROP
  if (name === 'onScroll') return STR
  if (name === 'pattern') return REGEX
  if (name === 'required' && kind === 'function') return STR
  if (LIST_NAMES.has(name)) return LIST
  if (FN_NAMES.has(name) || name.startsWith('on') || name.startsWith('before') || name.startsWith('after')) return FN
  if (EMPTY_NAMES.has(name)) return EMPTY
  if (OBJ_NAMES.has(name)) return OBJ
  if (BOOL_NAMES.has(name)) return BOOL
  if (isNumberName(name)) return NUM
  if (kind === 'factory') return LABEL_FACTORIES.has(name) ? STR : EMPTY
  if (kind === 'function') {
    if (STRING_FUNCTIONS.has(name)) return STR
    if (NUMBER_FUNCTIONS.has(name)) return NUM
    return EMPTY
  }
  return STR
}
