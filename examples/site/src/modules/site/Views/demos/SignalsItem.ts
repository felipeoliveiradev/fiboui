import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { chalk, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { removeTodo, toggleTodo, type Todo } from './SignalsViewModel'

export function todoRow(item: Todo, last: boolean) {
  return Row()
    .key(item.id)
    .width('100%')
    .gap(12)
    .padding('12px 0')
    .crossAxisAlignment('center')
    .css({
      borderBottom: last ? 'none' : line,
    })
    .children([
      point(
        Button('')
          .key(`check-${item.id}`)
          .variant('raw')
          .width(22)
          .height(22)
          .flexShrink('0')
          .padding('0')
          .borderRadius('0')
          .bg(item.done ? pink : 'transparent')
          .border(item.done ? `1px solid ${pink}` : '1px solid rgba(255,255,255,0.35)')
          .hover((state: PseudoStateBuilder) => {
            if (!item.done) state.borderColor(pink)
          })
          .pressEffect('shrink')
          .onPress(() => toggleTodo(item.id)),
      ).children(
        item.done
          ? [
              Box()
                .width(10)
                .height(10)
                .bg('#000000')
                .css({ margin: 'auto' }),
            ]
          : [],
      ),
      Column()
        .flex('1')
        .minWidth(0)
        .gap(2)
        .children([
          Text(item.label)
            .fontSize(14)
            .fontWeight(700)
            .letterSpacing('0.02em')
            .color(item.done ? muted : chalk)
            .css({
              textDecoration: item.done ? 'line-through' : 'none',
            }),
          Text(item.done ? 'Done' : 'Open')
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(item.done ? pink : muted),
        ]),
      point(
        Button('✕')
          .key(`rm-${item.id}`)
          .variant('raw')
          .width(32)
          .height(32)
          .flexShrink('0')
          .padding('0')
          .borderRadius('0')
          .fontSize(12)
          .fontWeight(800)
          .bg('transparent')
          .color(muted)
          .hover((state: PseudoStateBuilder) => {
            state.color(chalk).bg('rgba(255,45,138,0.25)')
          })
          .pressEffect('shrink')
          .onPress(() => removeTodo(item.id)),
      ),
    ])
}
