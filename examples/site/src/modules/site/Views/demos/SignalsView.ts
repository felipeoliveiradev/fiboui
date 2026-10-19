import type { PseudoStateBuilder } from 'fiboui'
import { Form, interp, minLength, required, Column, Row, Box, List, Text, Button, TextField } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { todoRow } from './SignalsItem'
import {
  clearDone,
  doneCount,
  emptyLabel,
  filter,
  leftLabel,
  openCount,
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
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Text('02 · Signals')
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(lime),
          Text(`${interp(openCount)} open · ${interp(doneCount)} done`)
            .fontSize(9)
            .letterSpacing('0.12em')
            .textTransform('uppercase')
            .color(muted),
        ]),
      Text('Todo')
        .fontSize('clamp(2rem, 4vw, 2.6rem)')
        .fontWeight(800)
        .letterSpacing('-0.04em')
        .textTransform('uppercase')
        .color(chalk),
      Text(`Total ${todos.$length}`)
        .fontSize(11)
        .letterSpacing('0.08em')
        .textTransform('uppercase')
        .color(muted),
      Form()
        .width('100%')
        .gap(8)
        .validation({
          task: [required('Write a task'), minLength(2, 'At least 2 characters')],
        })
        .onSubmit((values) => {
          todos.insert(0, { label: String(values.task), done: false })
        })
        .afterSubmit((_values, form) => {
          form.reset('task')
        })
        .children([
          Row()
            .width('100%')
            .gap(8)
            .crossAxisAlignment('stretch')
            .children([
              TextField()
                .name('task')
                .placeholder('Add a task')
                .props({ 'aria-label': 'Add a task' })
                .variant('outlined')
                .flex('1')
                .minWidth(0)
                .height(44)
                .bg('transparent')
                .color(chalk)
                .borderRadius('0')
                .border(line),
              point(
                Button('Add')
                  .submit()
                  .variant('raw')
                  .height(44)
                  .paddingHorizontal(18)
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
                  .pressEffect('shrink'),
              ),
            ]),
        ]),
      Box()
        .width('100%')
        .bindSignal(filter)
        .children(() => [
          Row()
            .width('100%')
            .gap(0)
            .border(line)
            .children(filters.map((item) => filterTab(item.label, item.value))),
        ]),
      Text(`${interp(emptyLabel)}`)
        .fontSize(13)
        .letterSpacing('0.04em')
        .color(muted)
        .paddingVertical(8),
      List()
        .className('signals-todo')
        .width('100%')
        .reset()
        .items(visibleTodos)
        .itemStyle((row) => {
          row.padding('12px 0').bg('transparent').rounded(0).borderBottom(line)
        })
        .when('hover', (row) => {
          row.bg('transparent')
        })
        .renderItem((item) => todoRow(item)),
      Box()
        .width('100%')
        .bindSignal(todos)
        .children(() => [
          Row()
            .width('100%')
            .mainAxisAlignment('spaceBetween')
            .crossAxisAlignment('center')
            .padding('4px 0 0')
            .children([
              Text(`${interp(leftLabel)}`).fontSize(11).letterSpacing('0.06em').color(muted),
              point(
                Button('Clear done')
                  .variant('raw')
                  .height(32)
                  .paddingHorizontal(8)
                  .borderRadius('0')
                  .fontSize(10)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .bg('transparent')
                  .color(doneCount.value > 0 ? pink : muted)
                  .hover((state: PseudoStateBuilder) => {
                    if (doneCount.value > 0) state.color(chalk)
                  })
                  .onPress(() => {
                    if (doneCount.value > 0) clearDone()
                  }),
              ),
            ]),
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
      .paddingHorizontal(8)
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
      .props({ 'aria-pressed': selected })
      .onPress(() => setFilter(value)),
  )
}
