import type { PseudoStateBuilder } from 'fiboui/core'
import { Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Button } from 'fiboui/interactive'
import { toggleMenu } from '../state'
import { chalk, pink } from '../theme'
import { focusMark, logoLockup } from './Logo'
import { point } from './ui'

/** Born-style utility strip: logo left, focus center, menu right. */
export function TopBar() {
  return Row()
    .width('100%')
    .height(44)
    .crossAxisAlignment('center')
    .padding('0 14px')
    .flexShrink('0')
    .zIndex(5)
    .lg({ padding: '0 22px', height: 48 })
    .children([
      logoLockup(),
      Box().flex('1'),
      focusMark(16),
      Box().flex('1'),
      point(
        Button('')
          .variant('raw')
          .width(34)
          .height(34)
          .padding('0')
          .bg(pink)
          .justifyContent('center')
          .alignItems('center')
          .overflow('hidden')
          .hoverEffect('grow')
          .pressEffect('shrink')
          .hover((state: PseudoStateBuilder) => {
            state.bg(chalk)
          })
          .onPress(toggleMenu),
      ).children([
        Box()
          .display('grid')
          .gridTemplateColumns('repeat(3, 5px)')
          .gap(3)
          .css({ pointerEvents: 'none' })
          .children(Array.from({ length: 9 }, (_, i) => Box().key(`d${i}`).width(5).height(5).bg(chalk))),
      ]),
    ])
}

export function NavBar() {
  return Box().display('none')
}
