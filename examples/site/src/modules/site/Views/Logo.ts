import type { ReactElement } from 'react'
import { Column, Row, Box, Text, Button } from 'fiboui'
import { chalk, lime } from '../theme'
import { navigate } from '../route'
import { point } from './ui'

export function logoMark(unit = 9, light = chalk): ReactElement {
  const side = unit * 2 + 1
  return Row()
    .hug()
    .height(side)
    .gap(1)
    .flexShrink('0')
    .crossAxisAlignment('stretch')
    .children([
      Column()
        .hug()
        .width(unit)
        .gap(1)
        .children([
          Box().width(unit).height(unit).bg(light),
          Box().width(unit).height(unit).bg(light),
        ]),
      Box().width(side).height(side).bg(lime),
    ])
}

export function logoLockup(): ReactElement {
  return point(
    Button('')
      .variant('raw')
      .height(44)
      .padding('0')
      .flexShrink('0')
      .justifyContent('flex-start')
      .alignItems('center')
      .onPress(() => navigate('home')),
  ).children([
    Row()
      .hug()
      .gap(10)
      .crossAxisAlignment('center')
      .children([
        logoMark(),
        Text('FiboUI')
          .fontSize(12)
          .fontWeight(700)
          .letterSpacing('0.18em')
          .textTransform('uppercase')
          .color(chalk),
      ]),
  ])
}

export function focusMark(size = 18): ReactElement {
  const arm = Math.max(4, Math.floor(size / 4))
  return Box()
    .position('relative')
    .width(size)
    .height(size)
    .flexShrink('0')
    .children([
      Box().position('absolute').top(0).left(0).width(arm).height(1).bg(chalk),
      Box().position('absolute').top(0).left(0).width(1).height(arm).bg(chalk),
      Box().position('absolute').top(0).right(0).width(arm).height(1).bg(chalk),
      Box().position('absolute').top(0).right(0).width(1).height(arm).bg(chalk),
      Box().position('absolute').bottom(0).left(0).width(arm).height(1).bg(chalk),
      Box().position('absolute').bottom(0).left(0).width(1).height(arm).bg(chalk),
      Box().position('absolute').bottom(0).right(0).width(arm).height(1).bg(chalk),
      Box().position('absolute').bottom(0).right(0).width(1).height(arm).bg(chalk),
    ])
}
