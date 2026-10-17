import type { ReactElement } from 'react'
import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Button } from 'fiboui'
import { navigate } from '../route'
import { closeMenu, menuOpen, setChapter } from '../state'
import { chalk, pink } from '../theme'
import { logoMark } from './Logo'
import { go, point } from './ui'

const items = [
  ['Home', 'root'],
  ['Work', 'work'],
  ['Play', 'play'],
  ['Shop', 'shop'],
  ['Why', 'why'],
  ['Start', 'contact'],
] as const

const ITEM_STAGGER = 55
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

let lastFocus: HTMLElement | null = null

function trapTab(event: {
  key: string
  shiftKey: boolean
  preventDefault: () => void
  currentTarget: EventTarget
}) {
  if (event.key !== 'Tab') return
  const root = event.currentTarget as HTMLElement
  const nodes = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute('disabled'),
  )
  if (nodes.length === 0) return
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const now = document.activeElement
  if (event.shiftKey) {
    if (now === first || !root.contains(now)) {
      event.preventDefault()
      last.focus()
    }
  } else if (now === last || !root.contains(now)) {
    event.preventDefault()
    first.focus()
  }
}

function bindPanel(node: HTMLElement | null) {
  if (node) {
    const prev = document.activeElement
    lastFocus = prev instanceof HTMLElement ? prev : null
    const close = node.querySelector<HTMLElement>('[aria-label="Close menu"]')
    ;(close ?? node).focus()
    return
  }
  lastFocus?.focus()
  lastFocus = null
}

/**
 * Opaque fullscreen shell via bindSignal (not Presence fade).
 * Presence fadeIn put opacity on the wrapper, so the page behind stayed visible.
 * Items still stagger in; the pink panel is solid from the first frame.
 */
export function MenuOverlay(): ReactElement {
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
    .props({
      id: 'site-menu',
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Site menu',
      tabIndex: -1,
      ref: bindPanel,
      onKeyDown: trapTab,
    })
    .css({
      height: '100dvh',
      overflowX: 'hidden',
      overflowY: 'auto',
      overscrollBehavior: 'none',
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
              .props({ 'aria-label': 'Close menu' })
              .onPress(closeMenu),
            chalk,
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
      .focus((state: PseudoStateBuilder) => {
        state.color(chalk).translateX(8)
      })
      .onPress(() => {
        closeMenu()
        if (id === 'root') navigate('home')
        else if (id === 'why') go('#switch')
        else if (id === 'contact') go('#contact')
        else if (id === 'work') go('#work')
        else if (id === 'shop') navigate('shop')
        else if (id === 'play') navigate('play')
        else {
          setChapter(id as 'builders')
          go('#work')
        }
      }),
    chalk,
  )
}
