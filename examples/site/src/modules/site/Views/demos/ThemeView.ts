import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text, Button, extendTheme, noirTheme } from 'fiboui'
import { line } from '../../theme'
import { choices, swatchKeys, toneCopy, tones } from './ThemeConstants'
import { accent, toneName } from './ThemeViewModel'
import { toneChip } from './ThemeChip'

export function ThemeView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(18)
    .bindSignal(accent)
    .children(() => {
      const palette = tones[accent.value]
      const label = toneName(accent.value)
      const cardTheme = extendTheme(noirTheme, {
        name: `tone-${accent.value}`,
        colors: palette,
      })
      return [
        Text('03 · Theme')
          .fontSize(9)
          .letterSpacing('0.16em')
          .textTransform('uppercase')
          .color('#c8ff00'),
        Row()
          .width('100%')
          .gap(0)
          .crossAxisAlignment('stretch')
          .border(line)
          .children(choices.map((choice) => toneChip(choice.label, choice.value))),
        Column()
          .width('100%')
          .crossAxisAlignment('stretch')
          .gap(18)
          .padding('28px')
          .theme(cardTheme)
          .bg('background')
          .color('on-background')
          .border(line)
          .reveal('fadeIn')
          .ease('spring')
          .children([
            Text(label)
              .fontSize('clamp(2rem, 4vw, 2.6rem)')
              .fontWeight(800)
              .letterSpacing('-0.04em')
              .textTransform('uppercase')
              .color('on-background'),
            Text(toneCopy)
              .fontSize(13)
              .lineHeight(1.45)
              .letterSpacing('0.02em')
              .color('on-background')
              .maxWidth(360),
            Row()
              .width('100%')
              .gap(8)
              .flexWrap('wrap')
              .children(
                swatchKeys.map((key) =>
                  Column()
                    .key(key)
                    .gap(6)
                    .children([
                      Box()
                        .width(44)
                        .height(28)
                        .bg(palette[key])
                        .border('1px solid rgba(128,128,128,0.45)'),
                      Text(key)
                        .fontSize(8)
                        .letterSpacing('0.12em')
                        .textTransform('uppercase')
                        .color('on-background'),
                    ]),
                ),
              ),
            Row()
              .gap(8)
              .flexWrap('wrap')
              .children([
                Button('Filled')
                  .variant('filled')
                  .shape('sharp')
                  .height(40)
                  .padding('0 16px')
                  .fontSize(11)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .borderRadius('0')
                  .pressEffect('shrink')
                  .onPress(() => undefined),
                Button('Outlined')
                  .variant('outlined')
                  .shape('sharp')
                  .height(40)
                  .padding('0 16px')
                  .fontSize(11)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .borderRadius('0')
                  .pressEffect('shrink')
                  .hover((state: PseudoStateBuilder) => {
                    state.opacity(0.72)
                  })
                  .onPress(() => undefined),
              ]),
          ]),
      ]
    })
}
