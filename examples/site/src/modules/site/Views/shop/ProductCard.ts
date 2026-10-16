import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text, Button } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { money, type Product } from './data'
import { productArt } from './ProductArt'
import { openProduct } from './state'

export function productCard(product: Product) {
  return point(
    Button('')
      .key(product.id)
      .variant('raw')
      .width('100%')
      .padding('0')
      .borderRadius('0')
      .bg('#080808')
      .justifyContent('flex-start')
      .alignItems('stretch')
      .overflow('hidden')
      .border(line)
      .className('shop-product-card')
      .hover((state: PseudoStateBuilder) => {
        state.borderColor('rgba(255,45,138,0.6)')
      })
      .pressEffect('shrink')
      .onPress(() => openProduct(product.id)),
  ).children([
    Column()
      .width('100%')
      .crossAxisAlignment('stretch')
      .gap(0)
      .children([
        Box()
          .width('100%')
          .position('relative')
          .overflow('hidden')
          .children([
            productArt(product),
            product.badge
              ? Text(product.badge)
                  .position('absolute')
                  .top(12)
                  .left(12)
                  .padding('6px 9px')
                  .fontSize(9)
                  .fontWeight(800)
                  .letterSpacing('0.14em')
                  .textTransform('uppercase')
                  .bg(product.badge === 'New' ? lime : pink)
                  .color(product.badge === 'New' ? '#000000' : chalk)
                  .zIndex(2)
              : Box().width(0).height(0),
          ]),
        Column()
          .gap(8)
          .padding('18px 16px 16px')
          .crossAxisAlignment('start')
          .children([
            Text(product.name)
              .fontSize(14)
              .fontWeight(800)
              .letterSpacing('0.04em')
              .textTransform('uppercase')
              .color(chalk)
              .textAlign('left'),
            Text(product.blurb)
              .fontSize(12)
              .lineHeight(1.4)
              .color(muted)
              .textAlign('left'),
            Row()
              .width('100%')
              .mainAxisAlignment('spaceBetween')
              .crossAxisAlignment('center')
              .margin('6px 0 0')
              .children([
                Row()
                  .hug()
                  .gap(8)
                  .crossAxisAlignment('center')
                  .children([
                    Text(money(product.price))
                      .fontSize(15)
                      .fontWeight(800)
                      .color(chalk),
                    product.compareAt
                      ? Text(money(product.compareAt))
                          .fontSize(12)
                          .color(muted)
                          .css({ textDecoration: 'line-through' })
                      : Box().width(0).height(0),
                  ]),
                Text('View')
                  .fontSize(10)
                  .fontWeight(800)
                  .letterSpacing('0.14em')
                  .textTransform('uppercase')
                  .color(pink),
              ]),
          ]),
      ]),
  ])
}
