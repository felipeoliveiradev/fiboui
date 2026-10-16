import type { PseudoStateBuilder, Signal } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Label, Text } from 'fiboui/content'
import { Button, Checkbox, RadioGroup, TextField } from 'fiboui/interactive'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { freeShipFrom, money, productById } from './data'
import {
  cart,
  cartTotal,
  checkoutAddress,
  checkoutEmail,
  checkoutName,
  newsletter,
  openCart,
  orderNote,
  placeOrder,
  setShipMethod,
  shipMethod,
  shippingCost,
} from './state'

export function CheckoutView() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(22)
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Column()
            .gap(6)
            .children([
              Text('Checkout')
                .fontSize('clamp(1.8rem, 3.4vw, 2.6rem)')
                .fontWeight(800)
                .letterSpacing('-0.04em')
                .textTransform('uppercase')
                .color(chalk),
              Text('Shipping + contact')
                .fontSize(12)
                .letterSpacing('0.1em')
                .textTransform('uppercase')
                .color(muted),
            ]),
          point(
            Button('← Bag')
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
              .onPress(() => openCart()),
          ),
        ]),
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .gap(28)
        .lg({ gridTemplateColumns: '1.15fr 0.85fr', gap: '40px', alignItems: 'start' })
        .children([
          Column()
            .width('100%')
            .gap(14)
            .crossAxisAlignment('stretch')
            .children([
              Label('Full name').required().fontSize(10).letterSpacing('0.14em').textTransform('uppercase').color(muted),
              shopField(checkoutName, 'Alex Builder'),
              Label('Email').required().fontSize(10).letterSpacing('0.14em').textTransform('uppercase').color(muted),
              shopField(checkoutEmail, 'alex@studio.dev'),
              Label('Shipping address').required().fontSize(10).letterSpacing('0.14em').textTransform('uppercase').color(muted),
              shopField(checkoutAddress, 'Street, city, country, postal code'),
              Label('Order note').fontSize(10).letterSpacing('0.14em').textTransform('uppercase').color(muted),
              // Textarea is string-controlled (no Signal) — use TextField signal binding so typing does not remount/stick.
              TextField()
                .value(orderNote)
                .placeholder('Gift message, delivery notes…')
                .variant('outlined')
                .width('100%')
                .height(52)
                .bg('#080808')
                .color(chalk)
                .borderRadius('0')
                .css({ border: line, borderRadius: '0' }),
              Column()
                .gap(8)
                .children([
                  Text('Shipping method')
                    .fontSize(10)
                    .letterSpacing('0.14em')
                    .textTransform('uppercase')
                    .color(muted),
                  Box()
                    .bindSignal(shipMethod)
                    .children(() => [
                      RadioGroup()
                        .name('ship-method')
                        .direction('vertical')
                        .value(shipMethod.value)
                        .options([
                          { label: 'Standard (3–6 days)', value: 'standard' },
                          { label: 'Express (1–2 days)', value: 'express' },
                        ])
                        .onChange((value) => setShipMethod(value as 'standard' | 'express')),
                    ]),
                ]),
              Box()
                .bindSignal(newsletter)
                .children(() => [
                  Checkbox()
                    .checked(newsletter.value)
                    .label('Email me drops and restocks')
                    .onChange((checked) => {
                      newsletter.value = checked
                    }),
                ]),
              point(
                Button('Place order')
                  .variant('raw')
                  .width('100%')
                  .height(54)
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
                  .onPress(() => {
                    placeOrder()
                  }),
              ),
              Text('Demo checkout — no card is charged. Fill required fields to place the order.')
                .fontSize(12)
                .lineHeight(1.4)
                .color(muted),
            ]),
          Box()
            .width('100%')
            .bindSignal(cart)
            .bindSignal(shipMethod)
            .children(() => [orderSummary()]),
        ]),
    ])
}

function shopField(value: Signal<string>, placeholder: string) {
  return TextField()
    .value(value)
    .placeholder(placeholder)
    .variant('outlined')
    .width('100%')
    .height(52)
    .bg('#080808')
    .color(chalk)
    .borderRadius('0')
    .css({
      border: line,
      borderRadius: '0',
    })
}

function orderSummary() {
  const lines = cart.value
  const total = cartTotal()
  const shipping = shippingCost()
  const grand = total + shipping
  return Column()
    .width('100%')
    .gap(14)
    .padding('22px')
    .border(line)
    .bg('#0a0a0a')
    .children([
      Text('Your order')
        .fontSize(11)
        .letterSpacing('0.16em')
        .textTransform('uppercase')
        .color(lime),
      ...lines.map((line) => {
        const product = productById(line.productId)
        if (!product) return Box().key(line.key).height(0)
        return Row()
          .key(line.key)
          .width('100%')
          .gap(12)
          .crossAxisAlignment('center')
          .children([
            Box().width(40).height(48).flexShrink('0').bg(product.accent),
            Column()
              .flex('1')
              .minWidth(0)
              .gap(2)
              .children([
                Text(product.name)
                  .fontSize(12)
                  .fontWeight(800)
                  .letterSpacing('0.04em')
                  .textTransform('uppercase')
                  .color(chalk),
                Text(`Size ${line.size} · Qty ${line.qty}`)
                  .fontSize(11)
                  .color(muted),
              ]),
            Text(money(product.price * line.qty))
              .fontSize(12)
              .fontWeight(800)
              .color(chalk),
          ])
      }),
      Box().width('100%').height(1).bg('rgba(255,255,255,0.12)'),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .children([
          Text('Subtotal').fontSize(13).color(muted),
          Text(money(total)).fontSize(13).color(chalk),
        ]),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .children([
          Text(shipMethod.value === 'express' ? 'Express' : 'Standard').fontSize(13).color(muted),
          Text(shipping === 0 ? 'Free' : money(shipping)).fontSize(13).color(chalk),
        ]),
      total < freeShipFrom && shipping > 0
        ? Text(`Free shipping from ${money(freeShipFrom)}`)
            .fontSize(11)
            .color(muted)
        : Box().height(0),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .children([
          Text('Total').fontSize(16).fontWeight(800).color(chalk),
          Text(money(grand)).fontSize(20).fontWeight(800).color(pink),
        ]),
    ])
}
