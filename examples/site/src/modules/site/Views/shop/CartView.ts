import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Alert, Progress, Text, Button } from 'fiboui'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { freeShipFrom, money, productById } from './data'
import {
  cart,
  cartCount,
  cartTotal,
  clearCart,
  openCatalog,
  openCheckout,
  removeLine,
  setLineQty,
  type CartLine,
} from './state'

export function CartView() {
  return Box()
    .width('100%')
    .bindSignal(cart)
    .children(() => {
      const lines = cart.value
      const total = cartTotal()
      const count = cartCount()
      const remaining = Math.max(0, freeShipFrom - total)
      return [
        Column()
          .width('100%')
          .crossAxisAlignment('stretch')
          .gap(22)
          .children([
            Row()
              .width('100%')
              .mainAxisAlignment('spaceBetween')
              .crossAxisAlignment('end')
              .gap(12)
              .flexWrap('wrap')
              .children([
                Column()
                  .gap(6)
                  .children([
                    Text('Your bag')
                      .fontSize('clamp(1.8rem, 3.4vw, 2.6rem)')
                      .fontWeight(800)
                      .letterSpacing('-0.04em')
                      .textTransform('uppercase')
                      .color(chalk),
                    Text(count === 0 ? 'Empty' : `${count} item${count === 1 ? '' : 's'}`)
                      .fontSize(12)
                      .letterSpacing('0.1em')
                      .textTransform('uppercase')
                      .color(muted),
                  ]),
                point(
                  Button('Continue shopping')
                    .variant('raw')
                    .padding('0')
                    .fontSize(11)
                    .fontWeight(800)
                    .letterSpacing('0.12em')
                    .textTransform('uppercase')
                    .bg('transparent')
                    .color(pink)
                    .hover((state: PseudoStateBuilder) => {
                      state.color(chalk)
                    })
                    .onPress(() => openCatalog()),
                ),
              ]),
            lines.length === 0
              ? emptyCart()
              : Box()
                  .display('grid')
                  .width('100%')
                  .gap(24)
                  .lg({ gridTemplateColumns: '1.4fr 0.8fr', gap: '36px', alignItems: 'start' })
                  .children([
                    Column()
                      .width('100%')
                      .crossAxisAlignment('stretch')
                      .gap(0)
                      .border(line)
                      .children(lines.map((item, index) => cartRow(item, index === lines.length - 1))),
                    Column()
                      .width('100%')
                      .gap(16)
                      .padding('22px')
                      .border(line)
                      .bg('#0a0a0a')
                      .children([
                        Text('Order summary')
                          .fontSize(11)
                          .letterSpacing('0.14em')
                          .textTransform('uppercase')
                          .color(lime),
                        remaining === 0
                          ? Alert()
                              .title('Free shipping unlocked')
                              .description('This order ships free.')
                              .intent('success')
                              .width('100%')
                              .borderRadius('0')
                          : Alert()
                              .title(`${money(remaining)} to free shipping`)
                              .description(`Spend ${money(freeShipFrom)} total to unlock free shipping.`)
                              .intent('info')
                              .width('100%')
                              .borderRadius('0'),
                        Progress()
                          .value(Math.min(total, freeShipFrom))
                          .max(freeShipFrom)
                          .color(pink)
                          .height(6)
                          .label('Free shipping progress')
                          .subLabel(`${money(Math.min(total, freeShipFrom))} / ${money(freeShipFrom)}`)
                          .width('100%'),
                        summaryRow('Subtotal', money(total)),
                        summaryRow(
                          'Shipping',
                          remaining === 0 ? 'Free' : `From ${money(8)}`,
                        ),
                        Box().width('100%').height(1).bg('rgba(255,255,255,0.12)'),
                        Row()
                          .width('100%')
                          .mainAxisAlignment('spaceBetween')
                          .children([
                            Text('Total').fontSize(16).fontWeight(800).color(chalk),
                            Text(money(total)).fontSize(22).fontWeight(800).color(chalk),
                          ]),
                        point(
                          Button('Checkout')
                            .variant('raw')
                            .width('100%')
                            .height(52)
                            .padding('0 18px')
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
                            .onPress(() => openCheckout()),
                        ),
                        point(
                          Button('Clear bag')
                            .variant('raw')
                            .width('100%')
                            .height(42)
                            .padding('0 14px')
                            .borderRadius('0')
                            .fontSize(11)
                            .fontWeight(800)
                            .letterSpacing('0.12em')
                            .textTransform('uppercase')
                            .bg('transparent')
                            .color(muted)
                            .border(line)
                            .hover((state: PseudoStateBuilder) => {
                              state.color(chalk)
                            })
                            .onPress(() => clearCart()),
                        ),
                      ]),
                  ]),
          ]),
      ]
    })
}

function summaryRow(label: string, value: string) {
  return Row()
    .width('100%')
    .mainAxisAlignment('spaceBetween')
    .children([
      Text(label).fontSize(13).color(muted),
      Text(value).fontSize(13).fontWeight(700).color(chalk),
    ])
}

function emptyCart() {
  return Column()
    .width('100%')
    .gap(16)
    .padding('48px 24px')
    .border(line)
    .bg('#0a0a0a')
    .crossAxisAlignment('start')
    .children([
      Text('Your bag is empty')
        .fontSize('clamp(1.4rem, 3vw, 2rem)')
        .fontWeight(800)
        .letterSpacing('-0.03em')
        .textTransform('uppercase')
        .color(chalk),
      Text('Browse the drop and add something you want to wear or ship.')
        .fontSize(14)
        .lineHeight(1.45)
        .color(muted)
        .maxWidth(360),
      point(
        Button('Browse the store')
          .variant('raw')
          .height(48)
          .padding('0 20px')
          .borderRadius('0')
          .fontSize(12)
          .fontWeight(800)
          .letterSpacing('0.12em')
          .textTransform('uppercase')
          .bg(lime)
          .color('#000000')
          .hover((state: PseudoStateBuilder) => {
            state.bg(pink).color(chalk)
          })
          .onPress(() => openCatalog()),
      ),
    ])
}

function cartRow(item: CartLine, last: boolean) {
  const product = productById(item.productId)
  if (!product) return Box().key(item.key).height(0)
  return Row()
    .key(item.key)
    .width('100%')
    .gap(16)
    .padding('18px')
    .crossAxisAlignment('center')
    .css({
      borderBottom: last ? 'none' : line,
    })
    .children([
      Box()
        .width(72)
        .height(88)
        .flexShrink('0')
        .bg(product.ground)
        .position('relative')
        .overflow('hidden')
        .children([
          Box()
            .position('absolute')
            .top('18%')
            .left('16%')
            .right('16%')
            .bottom('22%')
            .bg(product.accent),
        ]),
      Column()
        .flex('1')
        .minWidth(0)
        .gap(6)
        .children([
          Text(product.name)
            .fontSize(14)
            .fontWeight(800)
            .letterSpacing('0.03em')
            .textTransform('uppercase')
            .color(chalk),
          Text(`Size ${item.size}`)
            .fontSize(11)
            .letterSpacing('0.08em')
            .color(muted),
          Text(money(product.price))
            .fontSize(13)
            .fontWeight(700)
            .color(chalk),
        ]),
      Row()
        .hug()
        .gap(0)
        .border(line)
        .children([
          lineQty(`${item.key}-`, '−', () => setLineQty(item.key, item.qty - 1)),
          Box()
            .width(40)
            .height(36)
            .display('flex')
            .justifyContent('center')
            .alignItems('center')
            .css({ borderLeft: line, borderRight: line })
            .children([
              Text(String(item.qty)).fontSize(12).fontWeight(800).color(chalk),
            ]),
          lineQty(`${item.key}+`, '+', () => setLineQty(item.key, item.qty + 1)),
        ]),
      Text(money(product.price * item.qty))
        .fontSize(14)
        .fontWeight(800)
        .color(chalk)
        .minWidth(48)
        .textAlign('right'),
      point(
        Button('Remove')
          .variant('raw')
          .height(32)
          .padding('0 8px')
          .borderRadius('0')
          .fontSize(10)
          .fontWeight(800)
          .letterSpacing('0.1em')
          .textTransform('uppercase')
          .bg('transparent')
          .color(muted)
          .hover((state: PseudoStateBuilder) => {
            state.color(pink)
          })
          .onPress(() => removeLine(item.key)),
      ),
    ])
}

function lineQty(key: string, label: string, onPress: () => void) {
  return point(
    Button(label)
      .key(key)
      .variant('raw')
      .width(32)
      .height(36)
      .padding('0')
      .borderRadius('0')
      .fontSize(14)
      .fontWeight(800)
      .bg('transparent')
      .color(chalk)
      .hover((state: PseudoStateBuilder) => {
        state.bg(pink)
      })
      .onPress(onPress),
  )
}
