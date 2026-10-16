import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { chalk, lime, line, muted, pink } from '../../theme'
import { actions, caption, eyebrow, facts, title } from './BuildersConstants'
import { variantButton } from './BuildersButton'

export function BuildersView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(22)
    .padding('22px')
    .border(line)
    .bg('#0a0a0a')
    .children([
      Text(eyebrow)
        .fontSize(9)
        .letterSpacing('0.16em')
        .textTransform('uppercase')
        .color(lime),
      Text(title)
        .fontSize('clamp(2rem, 4vw, 2.8rem)')
        .fontWeight(800)
        .letterSpacing('-0.04em')
        .textTransform('uppercase')
        .color(chalk),
      Text(caption)
        .fontSize(13)
        .lineHeight(1.45)
        .letterSpacing('0.02em')
        .color(muted)
        .maxWidth(420),
      Row()
        .gap(8)
        .flexWrap('wrap')
        .crossAxisAlignment('center')
        .children(actions.map((action) => variantButton(action.label, action.kind))),
      Box().width('100%').height(1).bg('rgba(255,255,255,0.16)'),
      Row()
        .width('100%')
        .gap(0)
        .children(
          facts.map((fact, index) =>
            Column()
              .key(fact.label)
              .flex('1')
              .gap(6)
              .padding('0 14px')
              .css({
                borderLeft: index === 0 ? 'none' : line,
              })
              .children([
                Text(fact.label)
                  .fontSize(9)
                  .letterSpacing('0.14em')
                  .textTransform('uppercase')
                  .color(muted),
                Text(fact.value)
                  .fontSize(14)
                  .fontWeight(800)
                  .letterSpacing('0.06em')
                  .textTransform('uppercase')
                  .color(index === 0 ? pink : chalk),
              ]),
          ),
        ),
    ])
}
