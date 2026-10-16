import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { chalk, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { categoryGrid } from './CategoryGrid'
import { productCard } from './ProductCard'
import {
  catalogProducts,
  category,
  gridMode,
  query,
  saleOnly,
  setCategory,
  setGridMode,
  setSaleOnly,
  setSortBy,
  sortBy,
  type SortBy,
} from './state'

const TOOLBAR_H = 40

const sortCycle: { value: SortBy; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'name', label: 'Name' },
]

export function CatalogView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(36)
    .children([
      Box().width('100%').bindSignal(category).children(() => [categoryGrid()]),
      Column()
        .width('100%')
        .gap(18)
        .crossAxisAlignment('stretch')
        .children([
          sectionHead(),
          toolbar(),
          Box()
            .width('100%')
            .bindSignal(category)
            .bindSignal(query)
            .bindSignal(sortBy)
            .bindSignal(saleOnly)
            .bindSignal(gridMode)
            .children(() => [productGrid()]),
        ]),
    ])
}

function sectionHead() {
  return Column()
    .gap(8)
    .crossAxisAlignment('start')
    .children([
      Text('All products')
        .fontSize('clamp(1.5rem, 3vw, 2rem)')
        .fontWeight(800)
        .letterSpacing('-0.04em')
        .textTransform('uppercase')
        .color(chalk),
      Text('Filter, sort, and switch layout — same tree.')
        .fontSize(13)
        .color(muted),
    ])
}

function toolbarChip(
  label: string,
  selected: boolean,
  onPress: () => void,
  opts?: { key?: string; ink?: string; fill?: string },
) {
  const fill = opts?.fill ?? chalk
  const ink = opts?.ink ?? '#000000'
  return point(
    Button(label)
      .key(opts?.key ?? label)
      .variant('raw')
      .height(TOOLBAR_H)
      .padding('0 14px')
      .fontSize(11)
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .whiteSpace('nowrap')
      .borderRadius('0')
      .flexShrink('0')
      .bg(selected ? fill : 'transparent')
      .color(selected ? ink : muted)
      .border(selected ? `1px solid ${fill}` : line)
      .hover((state: PseudoStateBuilder) => {
        if (!selected) state.color(chalk).borderColor('rgba(255,255,255,0.4)')
      })
      .onPress(onPress),
  )
}

function cycleSort() {
  const index = sortCycle.findIndex((item) => item.value === sortBy.value)
  const next = sortCycle[(index + 1) % sortCycle.length]
  setSortBy(next.value)
}

function toolbar() {
  return Row()
    .width('100%')
    .gap(8)
    .padding('12px 16px')
    .border(line)
    .bg('#080808')
    .flexWrap('wrap')
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('center')
    .children([
      Row()
        .width('auto')
        .gap(8)
        .flexWrap('wrap')
        .crossAxisAlignment('center')
        .bindSignal(category)
        .children(() =>
          (
            [
              ['All', 'all'],
              ['Wear', 'wear'],
              ['Desk', 'desk'],
              ['Print', 'print'],
            ] as const
          ).map(([label, value]) =>
            toolbarChip(label, category.value === value, () => setCategory(value), {
              key: value,
            }),
          ),
        ),
      Row()
        .width('auto')
        .gap(8)
        .flexWrap('wrap')
        .crossAxisAlignment('center')
        .children([
          Box()
            .bindSignal(sortBy)
            .children(() => [
              toolbarChip(
                sortCycle.find((item) => item.value === sortBy.value)?.label ?? 'Featured',
                true,
                cycleSort,
                { key: `sort-${sortBy.value}` },
              ),
            ]),
          Box()
            .bindSignal(saleOnly)
            .children(() => [
              toolbarChip('Sale', saleOnly.value, () => setSaleOnly(!saleOnly.value), {
                key: 'sale',
                fill: pink,
                ink: chalk,
              }),
            ]),
          Box()
            .bindSignal(gridMode)
            .children(() => [
              Row()
                .width('auto')
                .gap(8)
                .crossAxisAlignment('center')
                .children([
                  toolbarChip('Grid', gridMode.value === 'standard', () => setGridMode('standard'), {
                    key: 'grid',
                    fill: pink,
                    ink: chalk,
                  }),
                  toolbarChip('Bento', gridMode.value === 'bento', () => setGridMode('bento'), {
                    key: 'bento',
                    fill: pink,
                    ink: chalk,
                  }),
                ]),
            ]),
        ]),
    ])
}

function productGrid() {
  const list = catalogProducts()
  if (list.length === 0) {
    return Column()
      .gap(10)
      .padding('56px 8px')
      .crossAxisAlignment('start')
      .children([
        Text('No matches')
          .fontSize(22)
          .fontWeight(800)
          .letterSpacing('-0.03em')
          .textTransform('uppercase')
          .color(chalk),
        Text('Clear search or turn off Sale.')
          .fontSize(14)
          .color(muted),
      ])
  }

  const bento = gridMode.value === 'bento'

  return Column()
    .width('100%')
    .gap(16)
    .children([
      Text(`${list.length} product${list.length === 1 ? '' : 's'}`)
        .fontSize(11)
        .letterSpacing('0.14em')
        .textTransform('uppercase')
        .color(muted),
      Row()
        .width('100%')
        .gap(14)
        .flexWrap('wrap')
        .crossAxisAlignment('stretch')
        .children(
          list.map((item, index) => {
            const wide = bento && index === 0
            return Box()
              .key(item.id)
              .flexGrow(1)
              .flexShrink(1)
              .flexBasis(wide ? '420px' : '220px')
              .minWidth(wide ? 280 : 200)
              .maxWidth(wide ? '100%' : 280)
              .children([productCard(item)])
          }),
        ),
    ])
}
