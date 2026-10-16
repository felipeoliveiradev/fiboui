import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text, Button } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { products } from './data'
import { category, setCategory } from './state'

function countFor(cat: 'wear' | 'desk' | 'print') {
  return products.filter((item) => item.category === cat).length
}

function cell(child: ReturnType<typeof Box> | ReturnType<typeof point>) {
  return Box()
    .flexGrow(1)
    .flexShrink(1)
    .flexBasis('140px')
    .minWidth(0)
    .height('100%')
    .children([child])
}

/** One row: Wear · Desk · Print · Collection · Shipping. */
export function categoryGrid() {
  return Column()
    .width('100%')
    .gap(16)
    .crossAxisAlignment('stretch')
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('end')
        .children([
          Text('Categories')
            .fontSize(11)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(muted),
          Text(`${products.length} pieces`)
            .fontSize(11)
            .letterSpacing('0.1em')
            .textTransform('uppercase')
            .color(muted),
        ]),
      Row()
        .width('100%')
        .gap(10)
        .flexWrap('wrap')
        .crossAxisAlignment('stretch')
        .children([
          cell(catTile('Wear', 'wear', pink, countFor('wear'), true)),
          cell(catTile('Desk', 'desk', lime, countFor('desk'), false)),
          cell(catTile('Print', 'print', chalk, countFor('print'), true)),
          cell(statTile('Collection', String(products.length), 'Full drop', pink)),
          cell(statTile('Shipping', '$75', 'Free from', lime)),
        ]),
    ])
}

function catTile(
  label: string,
  value: 'wear' | 'desk' | 'print',
  accent: string,
  count: number,
  darkText: boolean,
) {
  const selected = category.value === value
  const ink = selected && darkText ? '#000000' : chalk
  const sub = selected && !darkText ? 'rgba(255,255,255,0.65)' : muted
  return point(
    Button('')
      .key(value)
      .variant('raw')
      .width('100%')
      .height('100%')
      .minHeight(132)
      .padding('0')
      .borderRadius('0')
      .className('shop-cat-tile')
      .bg(selected ? accent : '#080808')
      .border(selected ? `1px solid ${accent}` : line)
      .justifyContent('flex-start')
      .alignItems('stretch')
      .hover((state: PseudoStateBuilder) => {
        if (!selected) state.borderColor(accent).bg('#0e0e0e')
      })
      .onPress(() => setCategory(value)),
  ).children([tileBody(label, `${count} products`, accent, ink, sub, selected, darkText)])
}

function statTile(label: string, value: string, hint: string, accent: string) {
  return Box()
    .width('100%')
    .height('100%')
    .minHeight(132)
    .padding('18px')
    .bg('#080808')
    .border(line)
    .className('shop-cat-tile')
    .children([
      Column()
        .width('100%')
        .height('100%')
        .minHeight(96)
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('start')
        .children([
          Box().width(10).height(10).bg(accent),
          Column()
            .gap(4)
            .crossAxisAlignment('start')
            .children([
              Text(label)
                .fontSize(10)
                .letterSpacing('0.14em')
                .textTransform('uppercase')
                .color(muted),
              Text(value)
                .fontSize(22)
                .fontWeight(800)
                .letterSpacing('-0.04em')
                .color(chalk),
              Text(hint)
                .fontSize(10)
                .letterSpacing('0.08em')
                .textTransform('uppercase')
                .color(muted),
            ]),
        ]),
    ])
}

function tileBody(
  label: string,
  meta: string,
  accent: string,
  ink: string,
  sub: string,
  selected: boolean,
  darkText: boolean,
) {
  return Column()
    .width('100%')
    .height('100%')
    .minHeight(132)
    .padding('18px')
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('start')
    .children([
      Box()
        .width(10)
        .height(10)
        .bg(selected ? (darkText ? '#000000' : chalk) : accent),
      Column()
        .gap(6)
        .crossAxisAlignment('start')
        .children([
          Text(label)
            .fontSize(18)
            .fontWeight(800)
            .letterSpacing('-0.03em')
            .textTransform('uppercase')
            .color(ink),
          Text(meta)
            .fontSize(10)
            .letterSpacing('0.1em')
            .textTransform('uppercase')
            .color(sub),
        ]),
    ])
}
