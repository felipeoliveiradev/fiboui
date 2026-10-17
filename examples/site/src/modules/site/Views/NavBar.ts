import type { ReactElement } from 'react'
import type { PseudoStateBuilder } from 'fiboui'
import { Row, Box, Button } from 'fiboui'
import { menuOpen, toggleMenu } from '../state'
import { chalk, lime, pink } from '../theme'
import { focusMark, logoLockup } from './Logo'
import { point } from './ui'

/** Born-style utility strip: logo left, focus center, menu right. */
export function TopBar(): ReactElement {
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
      Box()
        .bindSignal(menuOpen)
        .children(() => [menuButton()]),
    ])
}

function menuButton() {
  const open = menuOpen.value
  return point(
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
        state.bg(lime)
      })
      .props({
        'aria-label': open ? 'Close menu' : 'Open menu',
        'aria-expanded': open,
        'aria-controls': 'site-menu',
      })
      .onPress(toggleMenu),
  ).children([
    Box()
      .display('grid')
      .gridTemplateColumns('repeat(3, 5px)')
      .gap(3)
      .css({ pointerEvents: 'none' })
      .children(Array.from({ length: 9 }, (_, i) => Box().key(`d${i}`).width(5).height(5).bg(chalk))),
  ])
}

export function NavBar(): ReactElement {
  return Box().display('none')
}
