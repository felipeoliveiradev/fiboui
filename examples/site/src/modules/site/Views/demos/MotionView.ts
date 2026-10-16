import { Column } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { lime, line } from '../../theme'
import { staggerMs, tiles } from './MotionConstants'
import { motionTile } from './MotionTile'

export function MotionView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(14)
    .children([
      Text('04 · Motion')
        .fontSize(9)
        .letterSpacing('0.16em')
        .textTransform('uppercase')
        .color(lime),
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .gap(0)
        .stagger(staggerMs)
        .border(line)
        .css({ gridTemplateColumns: '1fr 1fr' })
        .children(tiles.map((tile, index) => motionTile(tile, index, tiles.length))),
    ])
}
