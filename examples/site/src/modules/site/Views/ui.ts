import type { FiboChild, PseudoStateBuilder } from 'fiboui/core'
import { scrollTo } from 'fiboui/core'
import { openExternal } from 'fiboui'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { closeMenu } from '../state'
import { ink, muted, red } from '../theme'

export function go(target: string) {
  closeMenu()
  scrollTo(target)
}

export function open(url: string) {
  openExternal(url)
}

export function grid(
  children: FiboChild[],
  columns: { base?: string; md?: string; lg?: string },
  gap = 0
) {
  let node = Box()
    .display('grid')
    .width('100%')
    .minWidth(0)
    .alignItems('stretch')
    .gap(gap)
    .children(children)

  if (columns.base && columns.base !== '1fr') node = node.gridTemplateColumns(columns.base)
  if (columns.md) node = node.md({ gridTemplateColumns: columns.md })
  if (columns.lg) node = node.lg({ gridTemplateColumns: columns.lg })
  return node
}

export function halves(children: FiboChild[]) {
  return Box()
    .display('grid')
    .width('100%')
    .minWidth(0)
    .lg({ gridTemplateColumns: '1fr 1fr' })
    .children(children)
}

export function kicker(label: string, square: 'primary' | 'secondary' = 'primary', color = ink) {
  return Row()
    .gap(8)
    .crossAxisAlignment('center')
    .children([
      Box().width(8).height(8).bg(square),
      Text(label)
        .variant('caption')
        .textTransform('uppercase')
        .letterSpacing('0.14em')
        .fontSize(11)
        .color(color),
    ])
}

export function display(text: string, size = 'clamp(4.8rem, 16vw, 9.2rem)') {
  return Text(text)
    .variant('h1')
    .whiteSpace('nowrap')
    .fontSize(size)
    .fontWeight(500)
    .lineHeight(0.82)
    .letterSpacing('-0.055em')
}

export function prose(text: string) {
  return Text(text)
    .variant('body')
    .fontSize('clamp(1.2rem, 2.4vw, 1.65rem)')
    .lineHeight(1.35)
    .letterSpacing('-0.02em')
    .maxWidth(860)
}

type Pressable = {
  cursor(value: string): Pressable
  focus(fn: (state: PseudoStateBuilder) => void): Pressable
}

export function point<T extends Pressable>(node: T): T {
  return node
    .cursor('pointer')
    .focus((state: PseudoStateBuilder) => {
      state.css('outline', '2px solid #ff2d8a')
      state.css('outline-offset', '2px')
    }) as T
}

export function cta(label: string, onPress: () => void, tone: 'ink' | 'paper' | 'red' = 'red') {
  const color = tone === 'red' ? red : '#ffffff'
  return point(
    Button('')
      .variant('raw')
      .height(48)
      .padding('0 2px')
      .justifyContent('flex-start')
      .alignItems('center')
      .hoverEffect('fade')
      .onPress(onPress),
  ).children([
    Row()
      .hug()
      .gap(10)
      .crossAxisAlignment('center')
      .children([
        Box().width(6).height(6).flexShrink('0').bg(color),
        Text(`[ ${label} ]`)
          .textTransform('uppercase')
          .letterSpacing('0.14em')
          .fontSize(12)
          .color(color),
      ]),
  ])
}

export function pad() {
  return '28px 20px'
}

export const quiet = muted
