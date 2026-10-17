import type { ReactElement } from 'react'
import { Column, Row, Box, Text, Label, TextField } from 'fiboui'
import { chalk, line, muted, pink } from '../../theme'
import { query } from './state'

/** Search rail — TextField + Label. Hero lives in shopBanner(). */
export function shopBar(): ReactElement {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(8)
    .children([
      Label('Search').htmlFor('shop-search').color(muted),
      Row()
        .width('100%')
        .gap(10)
        .crossAxisAlignment('stretch')
        .children([
          TextField()
            .value(query)
            .props({ id: 'shop-search' })
            .placeholder('Search the store…')
            .variant('outlined')
            .flex('1')
            .minWidth(0)
            .height(48)
            .color(chalk)
            .borderRadius('0'),
          Box()
            .width(64)
            .height(48)
            .flexShrink('0')
            .display('flex')
            .alignItems('center')
            .justifyContent('center')
            .border(line)
            .bg('#080808')
            .children([
              Text('USD')
                .fontSize(11)
                .fontWeight(800)
                .letterSpacing('0.12em')
                .color(pink),
            ]),
        ]),
    ])
}
