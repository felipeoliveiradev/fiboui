import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Collapse, Text, Button, RadioGroup } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { money, productById } from './data'
import { productArt } from './ProductArt'
import {
  addToCart,
  bumpQty,
  openCatalog,
  openCart,
  productId,
  selectedQty,
  selectedSize,
  setSize,
} from './state'

export function ProductView() {
  return Box()
    .width('100%')
    .bindSignal(productId)
    .bindSignal(selectedSize)
    .bindSignal(selectedQty)
    .children(() => {
      const product = productId.value ? productById(productId.value) : undefined
      if (!product) {
        return [
          Text('Product not found.')
            .fontSize(14)
            .color(muted)
            .padding('20px 0'),
        ]
      }
      return [
        Column()
          .width('100%')
          .crossAxisAlignment('stretch')
          .gap(22)
          .children([
            point(
              Button('← Continue shopping')
                .variant('raw')
                .hug()
                .padding('0')
                .fontSize(11)
                .fontWeight(800)
                .letterSpacing('0.12em')
                .textTransform('uppercase')
                .bg('transparent')
                .color(muted)
                .hover((state: PseudoStateBuilder) => {
                  state.color(chalk)
                })
                .onPress(() => openCatalog()),
            ),
            Box()
              .display('grid')
              .width('100%')
              .minWidth(0)
              .gap(28)
              .lg({ gridTemplateColumns: '1.15fr 0.85fr', gap: '48px', alignItems: 'start' })
              .children([
                Box()
                  .width('100%')
                  .border(line)
                  .overflow('hidden')
                  .reveal('fadeIn')
                  .children([productArt(product, { tall: true, showMeta: true })]),
                Column()
                  .width('100%')
                  .crossAxisAlignment('stretch')
                  .gap(18)
                  .children([
                    Row()
                      .gap(10)
                      .flexWrap('wrap')
                      .crossAxisAlignment('center')
                      .children([
                        Text(product.category)
                          .fontSize(10)
                          .letterSpacing('0.16em')
                          .textTransform('uppercase')
                          .color(lime),
                        product.badge
                          ? Text(product.badge)
                              .fontSize(10)
                              .fontWeight(800)
                              .letterSpacing('0.12em')
                              .textTransform('uppercase')
                              .padding('5px 8px')
                              .bg(pink)
                              .color(chalk)
                          : Box().width(0).height(0),
                      ]),
                    Text(product.name)
                      .fontSize('clamp(2.2rem, 4.5vw, 3.2rem)')
                      .fontWeight(800)
                      .letterSpacing('-0.045em')
                      .lineHeight(0.92)
                      .textTransform('uppercase')
                      .color(chalk),
                    Row()
                      .gap(12)
                      .crossAxisAlignment('center')
                      .children([
                        Text(money(product.price))
                          .fontSize(28)
                          .fontWeight(800)
                          .color(chalk),
                        product.compareAt
                          ? Text(money(product.compareAt))
                              .fontSize(16)
                              .color(muted)
                              .css({ textDecoration: 'line-through' })
                          : Box().width(0).height(0),
                      ]),
                    Text(product.detail)
                      .fontSize(15)
                      .lineHeight(1.55)
                      .color(muted)
                      .maxWidth(440),
                    Box().width('100%').height(1).bg('rgba(255,255,255,0.12)'),
                    Column()
                      .gap(10)
                      .children([
                        Text('Size')
                          .fontSize(10)
                          .letterSpacing('0.14em')
                          .textTransform('uppercase')
                          .color(muted),
                        RadioGroup()
                          .name(`size-${product.id}`)
                          .direction('horizontal')
                          .value(selectedSize.value)
                          .options(product.sizes.map((size) => ({ label: size, value: size })))
                          .onChange((value) => setSize(value))
                          .gap(8),
                      ]),
                    Column()
                      .gap(10)
                      .children([
                        Text('Quantity')
                          .fontSize(10)
                          .letterSpacing('0.14em')
                          .textTransform('uppercase')
                          .color(muted),
                        Row()
                          .hug()
                          .gap(0)
                          .border(line)
                          .children([
                            qtyBtn('−', -1),
                            Box()
                              .width(56)
                              .height(44)
                              .display('flex')
                              .justifyContent('center')
                              .alignItems('center')
                              .css({ borderLeft: line, borderRight: line })
                              .children([
                                Text(String(selectedQty.value))
                                  .fontSize(15)
                                  .fontWeight(800)
                                  .color(chalk),
                              ]),
                            qtyBtn('+', 1),
                          ]),
                      ]),
                    point(
                      Button('Add to bag')
                        .variant('raw')
                        .width('100%')
                        .height(54)
                        .padding('0 22px')
                        .borderRadius('0')
                        .fontSize(13)
                        .fontWeight(800)
                        .letterSpacing('0.14em')
                        .textTransform('uppercase')
                        .bg(pink)
                        .color(chalk)
                        .hover((state: PseudoStateBuilder) => {
                          state.bg('#ffffff').color('#000000')
                        })
                        .pressEffect('shrink')
                        .onPress(() => addToCart()),
                    ),
                    point(
                      Button('View bag')
                        .variant('raw')
                        .width('100%')
                        .height(48)
                        .padding('0 18px')
                        .borderRadius('0')
                        .fontSize(12)
                        .fontWeight(800)
                        .letterSpacing('0.12em')
                        .textTransform('uppercase')
                        .bg('transparent')
                        .color(chalk)
                        .border(line)
                        .hover((state: PseudoStateBuilder) => {
                          state.bg('#121212')
                        })
                        .onPress(() => openCart()),
                    ),
                    Collapse()
                      .title('Materials & shipping')
                      .defaultOpen(true)
                      .bg('#0a0a0a')
                      .border(line)
                      .borderRadius('0')
                      .color(chalk)
                      .content(
                        Column()
                          .gap(8)
                          .padding('0 4px 8px')
                          .children([
                            Text(product.material).fontSize(13).lineHeight(1.45).color(muted),
                            Text(product.ship).fontSize(13).lineHeight(1.45).color(muted),
                            Text('30-day returns · Secure checkout demo')
                              .fontSize(13)
                              .lineHeight(1.45)
                              .color(muted),
                          ]),
                      ),
                    Collapse()
                      .title('Care')
                      .bg('#0a0a0a')
                      .border(line)
                      .borderRadius('0')
                      .content(
                        Text('Cold wash. Hang dry. Do not iron the print.')
                          .fontSize(13)
                          .lineHeight(1.45)
                          .color(muted)
                          .padding('0 4px 8px'),
                      ),
                  ]),
              ]),
          ]),
      ]
    })
}

function qtyBtn(label: string, delta: number) {
  return point(
    Button(label)
      .key(label)
      .variant('raw')
      .width(44)
      .height(44)
      .padding('0')
      .borderRadius('0')
      .fontSize(16)
      .fontWeight(800)
      .bg('transparent')
      .color(chalk)
      .hover((state: PseudoStateBuilder) => {
        state.bg(pink)
      })
      .pressEffect('shrink')
      .onPress(() => bumpQty(delta)),
  )
}
