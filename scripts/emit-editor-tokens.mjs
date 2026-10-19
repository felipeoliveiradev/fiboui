import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function consts(source) {
  const out = {}
  const re = /export const (\w+) = \{([\s\S]*?)\} as const/g
  for (const match of source.matchAll(re)) {
    const body = {}
    for (const line of match[2].split('\n')) {
      const pair = line.match(/^\s*(\w+)\s*:\s*'([^']*)'/)
      if (pair) body[pair[1]] = pair[2]
    }
    if (Object.keys(body).length > 0) out[match[1]] = body
  }
  return out
}

function arrayCatalog(source, name) {
  const match = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))
  if (!match) return {}
  const body = {}
  for (const item of match[1].matchAll(/'([^']+)'/g)) body[item[1]] = item[1]
  return body
}

const tokens = {
  ...consts(readFileSync(join(root, 'src/core/tokens.ts'), 'utf8')),
  ...consts(readFileSync(join(root, 'src/core/when.ts'), 'utf8')),
  Motion: arrayCatalog(readFileSync(join(root, 'src/core/motionCss.ts'), 'utf8'), 'MOTION_PRESETS'),
  Effect: arrayCatalog(readFileSync(join(root, 'src/core/interactionEffects.ts'), 'utf8'), 'INTERACTION_EFFECTS'),
}
tokens.Density = tokens.Scale

const methods = {
  align: ['Align'],
  alignX: ['Align'],
  alignY: ['Align'],
  alignItems: ['Align'],
  alignSelf: ['Align'],
  justifyContent: ['Align'],
  mainAxisAlignment: ['Align'],
  crossAxisAlignment: ['Align'],
  alignment: ['StackAlign', 'Align'],
  width: ['Size', 'Space'],
  height: ['Size', 'Space'],
  padding: ['Space'],
  margin: ['Space'],
  gap: ['Space'],
  spacing: ['Space'],
  borderRadius: ['Radius'],
  radius: ['Radius'],
  bg: ['Color'],
  color: ['Color'],
  text: ['Color'],
  backgroundColor: ['Color'],
  borderColor: ['Color'],
  scrollbar: ['Bar'],
  direction: ['Axis'],
  flexDirection: ['FlexDirection'],
  textDirection: ['TextDirection'],
  flexWrap: ['Wrap'],
  mainAxisSize: ['AxisSize'],
  clip: ['Clip'],
  textBaseline: ['Baseline'],
  theme: ['Theme'],
  colorScheme: ['Scheme'],
  variant: ['ButtonVariant', 'ListVariant', 'GridVariant', 'TableVariant', 'BadgeVariant', 'FieldVariant', 'Progress', 'Spinner', 'TextRole'],
  size: ['ButtonSize', 'Scale', 'Size'],
  shape: ['ButtonShape'],
  tone: ['ButtonTone'],
  type: ['ButtonType', 'FieldType'],
  htmlType: ['ButtonType'],
  resize: ['Resize'],
  intent: ['Intent'],
  fit: ['Fit'],
  objectFit: ['Fit'],
  easing: ['Ease'],
  curve: ['Curve'],
  scrollSnapAlign: ['Snap'],
  scrollSnap: ['SnapAxis'],
  scrollTimeline: ['Timeline'],
  reducedMotion: ['ReducedMotion'],
  shadow: ['Shadow'],
  position: ['Position'],
  mode: ['Mode'],
  behavior: ['Behavior'],
  fabAt: ['Side'],
  method: ['FormMethod'],
  trend: ['Trend'],
  strokeLinecap: ['Stroke'],
  strokeLinejoin: ['Join'],
  animate: ['Motion'],
  effect: ['Effect'],
  hoverEffect: ['Effect'],
  pressEffect: ['Effect'],
  focusEffect: ['Effect'],
  when: ['When'],
  fontWeight: ['Weight'],
  textAlign: ['TextAlign'],
}

const out = { tokens, methods }
writeFileSync(
  join(root, 'extensions/vscode-fiboui/src/tokens.json'),
  JSON.stringify(out, null, 2) + '\n',
)
console.log(`tokens ${Object.keys(tokens).length} methods ${Object.keys(methods).length} effects ${Object.keys(tokens.Effect).length}`)
