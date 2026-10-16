import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text, Button } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { cells, columns, widths } from './MediaConstants'
import { mediaCell } from './MediaCell'
import { selectWidth, width, type Width } from './MediaViewModel'
import { point } from '../ui'

export function MediaView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(18)
    .bindSignal(width)
    .children(() => {
      const current = widths.find((item) => item.value === width.value) ?? widths[2]
      const wide = current.value === 'large'
      return [
        Row()
          .width('100%')
          .mainAxisAlignment('spaceBetween')
          .crossAxisAlignment('center')
          .children([
            Text('05 · Media')
              .fontSize(9)
              .letterSpacing('0.16em')
              .textTransform('uppercase')
              .color(lime),
            Text(current.label)
              .fontSize(9)
              .letterSpacing('0.14em')
              .textTransform('uppercase')
              .color(pink),
          ]),
        Row()
          .width('100%')
          .gap(0)
          .crossAxisAlignment('stretch')
          .border(line)
          .children(widths.map((item) => widthTab(item.label, item.value))),
        Box()
          .display('grid')
          .width(current.frame)
          .maxWidth('100%')
          .minWidth(0)
          .gridTemplateColumns(wide ? columns : '1fr')
          .border(line)
          .bg('#0a0a0a')
          .css({
            transition: 'width 280ms ease',
          })
          .children(
            cells.map((cell, index) =>
              mediaCell(cell.cue, cell.title, cell.body, wide, index === cells.length - 1),
            ),
          ),
        Text(
          wide
            ? 'Large · three columns, one tree.'
            : `${current.label} · stacked column, same cells.`,
        )
          .fontSize(11)
          .letterSpacing('0.06em')
          .color(muted),
      ]
    })
}

function widthTab(label: string, value: Width) {
  const selected = width.value === value
  return point(
    Button(label)
      .key(label)
      .variant('raw')
      .flex('1')
      .minWidth(0)
      .height(44)
      .padding('0 8px')
      .fontSize(11)
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .bg(selected ? 'rgba(255,45,138,0.18)' : 'transparent')
      .color(selected ? chalk : muted)
      .borderBottom(selected ? `2px solid ${pink}` : '2px solid transparent')
      .hover((state: PseudoStateBuilder) => {
        if (!selected) state.color(chalk)
      })
      .onPress(() => selectWidth(value)),
  )
}
