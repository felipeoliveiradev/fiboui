import { Row, Box, Text, Button } from 'fiboui'
import { chalk, muted, pink } from '../../theme'
import { tones, type Tone } from './ThemeConstants'
import { accent, selectTone } from './ThemeViewModel'
import { point } from '../ui'

export function toneChip(label: string, value: Tone) {
  const selected = accent.value === value
  return point(
    Button('')
      .key(label)
      .variant('raw')
      .flex('1')
      .minWidth(0)
      .height(48)
      .padding('0 10px')
      .justifyContent('flex-start')
      .alignItems('center')
      .bg(selected ? 'rgba(255,45,138,0.18)' : 'transparent')
      .borderBottom(selected ? `2px solid ${pink}` : '2px solid transparent')
      .props({ 'aria-pressed': selected })
      .onPress(() => selectTone(value)),
  ).children([
    Row()
      .hug()
      .gap(8)
      .crossAxisAlignment('center')
      .children([
        Box()
          .width(14)
          .height(14)
          .flexShrink('0')
          .bg(tones[value].background)
          .border('1px solid rgba(255,255,255,0.45)'),
        Text(label)
          .fontSize(11)
          .fontWeight(800)
          .letterSpacing('0.12em')
          .textTransform('uppercase')
          .color(selected ? chalk : muted),
      ]),
  ])
}
