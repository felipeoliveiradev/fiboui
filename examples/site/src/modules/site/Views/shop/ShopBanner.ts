import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, ZStack, Banner, Box, Text, Button } from 'fiboui'
import { chalk, lime, muted, pink } from '../../theme'
import { point } from '../ui'
import { freeShipFrom, money } from './data'
import { openCatalog, setCategory } from './state'

function chip(label: string, tone: 'pink' | 'lime' | 'ghost') {
  const bg = tone === 'pink' ? pink : tone === 'lime' ? lime : 'transparent'
  const color = tone === 'lime' ? '#000000' : chalk
  return Text(label)
    .fontSize(10)
    .fontWeight(800)
    .letterSpacing('0.14em')
    .textTransform('uppercase')
    .padding('6px 10px')
    .bg(bg)
    .color(color)
    .border(tone === 'ghost' ? '1px solid rgba(255,255,255,0.28)' : 'none')
}

/** Hero + promo strip — kept lean for a real storefront first impression. */
export function shopBanner() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(0)
    .children([
      Banner(`Free shipping from ${money(freeShipFrom)}`)
        .status('success')
        .subtitle('New drop · Worldwide · 30-day returns')
        .width('100%'),
      ZStack()
        .alignment('topLeft')
        .width('100%')
        .minHeight(320)
        .lg({ minHeight: 400 })
        .overflow('hidden')
        .border('1px solid rgba(255,255,255,0.16)')
        .borderTop('none')
        .children([
          Box()
            .width('100%')
            .height('100%')
            .minHeight(320)
            .lg({ minHeight: 400 })
            .css({
              background:
                'radial-gradient(ellipse 80% 70% at 85% 20%, rgba(255,45,138,0.28), transparent 55%), radial-gradient(ellipse 50% 60% at 70% 85%, rgba(200,255,0,0.16), transparent 50%), #050505',
            }),
          Row()
            .width('100%')
            .mainAxisAlignment('end')
            .crossAxisAlignment('end')
            .padding('0 28px 28px 0')
            .gap(0)
            .css({ pointerEvents: 'none' })
            .children([
              Box()
                .width(160)
                .height(200)
                .bg(pink)
                .css({ opacity: 0.92 }),
              Box()
                .width(100)
                .height(100)
                .bg(lime)
                .css({ marginLeft: '-28px', marginBottom: '48px', opacity: 0.95 }),
            ]),
          Column()
            .width('100%')
            .minHeight(320)
            .lg({ minHeight: 400 })
            .padding('32px 24px')
            .mainAxisAlignment('spaceBetween')
            .crossAxisAlignment('start')
            .lg({ padding: '44px 40px' })
            .children([
              Row().gap(8).flexWrap('wrap').children([chip('SS26', 'pink'), chip('In stock', 'ghost')]),
              Column()
                .gap(18)
                .crossAxisAlignment('start')
                .maxWidth(540)
                .children([
                  Text('Wear the return.')
                    .fontSize('clamp(2.6rem, 7vw, 4.6rem)')
                    .fontWeight(800)
                    .lineHeight(0.88)
                    .letterSpacing('-0.055em')
                    .textTransform('uppercase')
                    .color(chalk),
                  Text('Studio merch for builders — tees, desk, and print.')
                    .fontSize(15)
                    .lineHeight(1.5)
                    .color(muted)
                    .maxWidth(380),
                  Row()
                    .gap(10)
                    .flexWrap('wrap')
                    .children([
                      point(
                        Button('Shop all')
                          .variant('raw')
                          .height(50)
                          .padding('0 22px')
                          .borderRadius('0')
                          .fontSize(12)
                          .fontWeight(800)
                          .letterSpacing('0.14em')
                          .textTransform('uppercase')
                          .bg(chalk)
                          .color('#000000')
                          .hover((state: PseudoStateBuilder) => {
                            state.bg(pink).color(chalk)
                          })
                          .pressEffect('shrink')
                          .onPress(() => {
                            setCategory('all')
                            openCatalog()
                          }),
                      ),
                      point(
                        Button('Wear')
                          .variant('raw')
                          .height(50)
                          .padding('0 20px')
                          .borderRadius('0')
                          .fontSize(12)
                          .fontWeight(800)
                          .letterSpacing('0.14em')
                          .textTransform('uppercase')
                          .bg('transparent')
                          .color(chalk)
                          .border('1px solid rgba(255,255,255,0.35)')
                          .hover((state: PseudoStateBuilder) => {
                            state.borderColor(lime).color(lime)
                          })
                          .onPress(() => {
                            setCategory('wear')
                            openCatalog()
                          }),
                      ),
                    ]),
                ]),
            ]),
        ]),
    ])
}
