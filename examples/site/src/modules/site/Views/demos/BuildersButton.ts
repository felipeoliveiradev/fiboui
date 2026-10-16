import type { PseudoStateBuilder } from 'fiboui/core'
import { Button } from 'fiboui/interactive'
import { chalk, pink } from '../../theme'
import type { ButtonKind } from './BuildersConstants'

export function variantButton(label: string, kind: ButtonKind) {
  const button = Button(label)
    .key(label)
    .variant(kind === 'text' ? 'raw' : kind)
    .shape('sharp')
    .height(44)
    .padding('0 16px')
    .fontSize(12)
    .fontWeight(800)
    .letterSpacing('0.12em')
    .textTransform('uppercase')
    .borderRadius('0')
    .pressEffect('shrink')
    .onPress(() => undefined)

  if (kind === 'filled') {
    return button
      .bg(pink)
      .color(chalk)
      .hover((state: PseudoStateBuilder) => {
        state.bg('#ffffff').color('#000000')
      })
  }
  if (kind === 'outlined') {
    return button
      .bg('transparent')
      .color(chalk)
      .border('1px solid rgba(255,255,255,0.35)')
      .hover((state: PseudoStateBuilder) => {
        state.borderColor(pink).color(pink)
      })
  }
  return button
    .bg('transparent')
    .color(pink)
    .hover((state: PseudoStateBuilder) => {
      state.color(chalk)
    })
}
