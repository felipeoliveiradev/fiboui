import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Button } from 'fiboui/interactive'
import { navigate } from '../route'
import { closeMenu, menuOpen, setChapter } from '../state'
import { chalk, pink } from '../theme'
import { logoMark } from './Logo'
import { go, point } from './ui'

const items = [
  ['Home', 'root'],
  ['Work', 'work'],
  ['Shop', 'shop'],
  ['Why', 'why'],
  ['Start', 'contact'],
] as const

const ITEM_STAGGER = 55

/**
 * Opaque fullscreen shell via bindSignal (not Presence fade).
 * Presence fadeIn put opacity on the wrapper, so the page behind stayed visible.
 * Items still stagger in; the pink panel is solid from the first frame.
 */
export function MenuOverlay() {
  return Box()
    .bindSignal(menuOpen)
    .children(() => (menuOpen.value ? [panel()] : []))
}

function panel() {
  return Column()
    .position('fixed')
    .top(0)
    .right(0)
    .bottom(0)
    .left(0)
    .zIndex(9999)
    .width('100vw')
    .minHeight('100vh')
    .bg(pink)
    .padding('18px 20px 28px')
    .mainAxisAlignment('start')
    .crossAxisAlignment('stretch')
    .gap(48)
    .overflow('hidden')
    .css({
      height: '100dvh',
      overscrollBehavior: 'none',
      touchAction: 'none',
    })
    .lg({ padding: '22px 36px 36px', gap: 64 })
    .children([
      Row()
        .width('100%')
        .crossAxisAlignment('center')
        .animate('fadeIn', { duration: 280, delay: 40, ease: 'spring' })
        .children([
          logoMark(9),
          Box().flex('1'),
          point(
            Button('✕')
              .variant('raw')
              .width(44)
              .height(44)
              .padding('0')
              .fontSize(22)
              .color(chalk)
              .hoverEffect('grow')
              .pressEffect('shrink')
              .onPress(closeMenu),
          ),
        ]),
      Column()
        .crossAxisAlignment('start')
        .gap(0)
        .stagger(ITEM_STAGGER)
        .children(items.map(([label, id], index) => menuItem(label, id, index))),
    ])
}

function menuItem(label: string, id: string, index: number) {
  return point(
    Button(label)
      .key(label)
      .variant('raw')
      .height('auto')
      .padding('0')
      .justifyContent('flex-start')
      .fontSize('clamp(3.2rem, 11vw, 7.5rem)')
      .fontWeight(800)
      .lineHeight(0.86)
      .letterSpacing('-0.05em')
      .textTransform('uppercase')
      .color('rgba(0,0,0,0.22)')
      .animate('slideUp', {
        duration: 420,
        delay: 80 + index * ITEM_STAGGER,
        ease: 'spring',
      })
      .hover((state: PseudoStateBuilder) => {
        state.color(chalk).translateX(8)
      })
      .onPress(() => {
        closeMenu()
        if (id === 'root') go('#root')
        else if (id === 'why') go('#switch')
        else if (id === 'contact') go('#contact')
        else if (id === 'work') go('#work')
        else if (id === 'shop') navigate('shop')
        else {
          setChapter(id as 'builders')
          go('#work')
        }
      }),
  )
}
