import { Column, Row, Box, Text } from 'fiboui'
import { chalk, lime, muted, pink } from '../../theme'

const line = '1px solid rgba(255,255,255,0.16)'

export function mediaCell(
  cue: string,
  title: string,
  body: string,
  wide: boolean,
  last: boolean,
) {
  return Column()
    .key(title)
    .minWidth(0)
    .minHeight(128)
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('start')
    .gap(12)
    .padding('18px')
    .borderBottom(!wide && !last ? line : 'none')
    .borderRight(wide && !last ? line : 'none')
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Text(cue)
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(lime),
          Box().width(10).height(10).bg(pink),
        ]),
      Column()
        .gap(8)
        .crossAxisAlignment('start')
        .children([
          Text(title)
            .fontSize(18)
            .fontWeight(800)
            .letterSpacing('-0.03em')
            .textTransform('uppercase')
            .color(chalk),
          Text(body)
            .fontSize(12)
            .lineHeight(1.4)
            .letterSpacing('0.02em')
            .color(muted)
            .maxWidth(220),
        ]),
    ])
}
