import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button, TextField } from 'fiboui/interactive'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { todoRow } from './SignalsItem'
import {
  addTodo,
  clearDone,
  doneCount,
  draft,
  filter,
  remaining,
  setFilter,
  todos,
  visibleTodos,
  type Filter,
} from './SignalsViewModel'

const filters: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'active' },
  { label: 'Done', value: 'done' },
]

export function SignalsView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(16)
    .padding('22px')
    .border(line)
    .bg('#0a0a0a')
    .children([
      Box()
        .width('100%')
        .bindSignal(todos)
        .children(() => [stats()]),
      Text('Todo')
        .fontSize('clamp(2rem, 4vw, 2.6rem)')
        .fontWeight(800)
        .letterSpacing('-0.04em')
        .textTransform('uppercase')
        .color(chalk),
      // TextField already owns `draft` — do not bindSignal(draft) up here
      // or the input remounts on every keystroke.
      Row()
        .width('100%')
        .gap(8)
        .crossAxisAlignment('stretch')
        .children([
          TextField()
            .value(draft)
            .placeholder('Add a task')
            .variant('outlined')
            .flex('1')
            .minWidth(0)
            .height(44)
            .bg('transparent')
            .color(chalk)
            .borderRadius('0')
            .css({
              border: line,
              borderRadius: '0',
            }),
          point(
            Button('Add')
              .variant('raw')
              .height(44)
              .padding('0 18px')
              .borderRadius('0')
              .fontSize(11)
              .fontWeight(800)
              .letterSpacing('0.14em')
              .textTransform('uppercase')
              .bg(pink)
              .color(chalk)
              .hover((state: PseudoStateBuilder) => {
                state.bg('#ffffff').color('#000000')
              })
              .pressEffect('shrink')
              .onPress(() => addTodo()),
          ),
        ]),
      Box()
        .width('100%')
        .bindSignal(todos)
        .bindSignal(filter)
        .children(() => [board()]),
    ])
}

function stats() {
  const left = remaining()
  const done = doneCount()
  return Row()
    .width('100%')
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('center')
    .children([
      Text('02 · Signals')
        .fontSize(9)
        .letterSpacing('0.16em')
        .textTransform('uppercase')
        .color(lime),
      Text(`${left} open · ${done} done`)
        .fontSize(9)
        .letterSpacing('0.12em')
        .textTransform('uppercase')
        .color(muted),
    ])
}

function board() {
  const list = visibleTodos()
  const left = remaining()
  const done = doneCount()
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(16)
    .children([
      Row()
        .width('100%')
        .gap(0)
        .border(line)
        .children(filters.map((item) => filterTab(item.label, item.value))),
      Column()
        .width('100%')
        .crossAxisAlignment('stretch')
        .children(
          list.length === 0
            ? [
                Text('Nothing here.')
                  .fontSize(13)
                  .letterSpacing('0.04em')
                  .color(muted)
                  .padding('20px 0'),
              ]
            : list.map((item, index) => todoRow(item, index === list.length - 1)),
        ),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .padding('4px 0 0')
        .children([
          Text(left === 1 ? '1 task left' : `${left} tasks left`)
            .fontSize(11)
            .letterSpacing('0.06em')
            .color(muted),
          point(
            Button('Clear done')
              .variant('raw')
              .height(32)
              .padding('0 8px')
              .borderRadius('0')
              .fontSize(10)
              .fontWeight(800)
              .letterSpacing('0.12em')
              .textTransform('uppercase')
              .bg('transparent')
              .color(done > 0 ? pink : muted)
              .hover((state: PseudoStateBuilder) => {
                if (done > 0) state.color(chalk)
              })
              .onPress(() => {
                if (done > 0) clearDone()
              }),
          ),
        ]),
    ])
}

function filterTab(label: string, value: Filter) {
  const selected = filter.value === value
  return point(
    Button(label)
      .key(value)
      .variant('raw')
      .flex('1')
      .minWidth(0)
      .height(40)
      .padding('0 8px')
      .fontSize(11)
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .borderRadius('0')
      .bg(selected ? 'rgba(255,45,138,0.18)' : 'transparent')
      .color(selected ? chalk : muted)
      .borderBottom(selected ? `2px solid ${pink}` : '2px solid transparent')
      .hover((state: PseudoStateBuilder) => {
        if (!selected) state.color(chalk)
      })
      .onPress(() => setFilter(value)),
  )
}
