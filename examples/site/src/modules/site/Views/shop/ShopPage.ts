import type { PseudoStateBuilder } from 'fiboui/core'
import { FiboStyles, MotionStyles } from 'fiboui/core'
import { Column, Header, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { navigate } from '../../route'
import { chalk, face, ink, line, muted, pink, siteTheme } from '../../theme'
import { logoMark } from '../Logo'
import { point } from '../ui'
import { cart, cartCount, openCart, openCatalog, screen } from './state'
import { Shop } from './Shop'

/** Standalone Fibo Store — Header + full catalog system. */
export function ShopPage() {
  return Box()
    .position('relative')
    .width('100%')
    .minHeight('100vh')
    .boxSizing('border-box')
    .overflowX('hidden')
    .bg(ink)
    .color(chalk)
    .fontFamily(face)
    .theme(siteTheme)
    .className('shop-skin')
    .children([
      Column()
        .width('100%')
        .crossAxisAlignment('stretch')
        .bg(ink)
        .children([storeHeader(), Shop(), storeFoot()]),
      MotionStyles(),
      FiboStyles(),
    ])
}

function storeHeader() {
  return Header()
    .sticky(true)
    .height(60)
    .width('100%')
    .bg('#000000')
    .borderBottom(line)
    .padding('0 16px')
    .lg({ padding: '0 28px' })
    .css({ backdropFilter: 'none', borderColor: 'rgba(255,255,255,0.16)' })
    .children([
      Row()
        .width('100%')
        .height('100%')
        .crossAxisAlignment('center')
        .children([
          point(
            Button('')
              .variant('raw')
              .height(40)
              .padding('0 4px')
              .bg('transparent')
              .justifyContent('flex-start')
              .alignItems('center')
              .hover((state: PseudoStateBuilder) => {
                state.opacity(0.75)
              })
              .onPress(() => navigate('home')),
          ).children([
            Row()
              .hug()
              .gap(10)
              .crossAxisAlignment('center')
              .children([
                logoMark(8),
                Column()
                  .gap(0)
                  .crossAxisAlignment('start')
                  .children([
                    Text('Fibo Store')
                      .fontSize(12)
                      .fontWeight(800)
                      .letterSpacing('0.1em')
                      .textTransform('uppercase')
                      .color(chalk),
                    Text('by FiboUI')
                      .fontSize(8)
                      .letterSpacing('0.12em')
                      .textTransform('uppercase')
                      .color(muted),
                  ]),
              ]),
          ]),
          Box().flex('1'),
          Row()
            .hug()
            .gap(8)
            .crossAxisAlignment('center')
            .children([
              point(
                Button('Shop')
                  .variant('raw')
                  .height(36)
                  .padding('0 14px')
                  .borderRadius('0')
                  .fontSize(10)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .bg('transparent')
                  .color(chalk)
                  .hover((state: PseudoStateBuilder) => {
                    state.color(pink)
                  })
                  .onPress(() => openCatalog()),
              ),
              Box().bindSignal(cart).bindSignal(screen).children(() => [cartChip()]),
            ]),
        ]),
    ])
}

function cartChip() {
  const count = cartCount()
  return point(
    Button(count > 0 ? `Bag · ${count}` : 'Bag')
      .variant('raw')
      .height(36)
      .padding('0 14px')
      .borderRadius('0')
      .fontSize(10)
      .fontWeight(800)
      .letterSpacing('0.12em')
      .textTransform('uppercase')
      .bg(count > 0 ? pink : 'transparent')
      .color(chalk)
      .border(count > 0 ? `1px solid ${pink}` : line)
      .hover((state: PseudoStateBuilder) => {
        state.bg(count > 0 ? '#ffffff' : 'rgba(255,45,138,0.2)').color(count > 0 ? '#000000' : chalk)
      })
      .pressEffect('shrink')
      .onPress(() => openCart()),
  )
}

function storeFoot() {
  const year = new Date().getFullYear()
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .borderTop(line)
    .bg('#000000')
    .children([
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .css({ gridTemplateColumns: '1fr' })
        .md({ gridTemplateColumns: '1fr 1fr 1fr' })
        .children([
          footBlock('Help', 'Shipping · Returns · Size guide'),
          footBlock('Store', 'Wear · Desk · Print'),
          footBlock('FiboUI', 'Fluent builders. No JSX.'),
        ]),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .padding('16px')
        .borderTop(line)
        .flexWrap('wrap')
        .gap(12)
        .lg({ padding: '18px 28px' })
        .children([
          Text(`© ${year} Fibo Store`)
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(muted),
          point(
            Button('← Back to FiboUI')
              .variant('raw')
              .padding('0')
              .bg('transparent')
              .fontSize(9)
              .letterSpacing('0.12em')
              .textTransform('uppercase')
              .color(muted)
              .hover((state: PseudoStateBuilder) => {
                state.color(chalk)
              })
              .onPress(() => navigate('home')),
          ),
        ]),
    ])
}

function footBlock(title: string, body: string) {
  return Column()
    .width('100%')
    .gap(8)
    .padding('22px 16px')
    .css({ borderBottom: line })
    .md({ borderBottom: 'none', borderRight: line, padding: '28px' })
    .children([
      Text(title)
        .fontSize(10)
        .fontWeight(800)
        .letterSpacing('0.14em')
        .textTransform('uppercase')
        .color(chalk),
      Text(body).fontSize(12).lineHeight(1.4).color(muted),
    ])
}
