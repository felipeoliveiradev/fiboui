import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { chalk, lime, line, muted, pink } from '../../theme'
import { point } from '../ui'
import { newsletter, orderId, resetShop } from './state'

export function SuccessView() {
  return Column()
    .width('100%')
    .bindSignal(orderId)
    .bindSignal(newsletter)
    .crossAxisAlignment('stretch')
    .gap(0)
    .children(() => [
      Box()
        .width('100%')
        .padding('48px 28px')
        .border(line)
        .bg('#0a0a0a')
        .reveal('fadeIn')
        .css({
          backgroundImage:
            'linear-gradient(160deg, rgba(200,255,0,0.16) 0%, transparent 45%, rgba(255,45,138,0.14) 100%)',
        })
        .children([
          Column()
            .gap(18)
            .crossAxisAlignment('start')
            .maxWidth(520)
            .children([
              Row()
                .gap(12)
                .crossAxisAlignment('center')
                .children([
                  Box()
                    .width(44)
                    .height(44)
                    .bg(pink)
                    .display('flex')
                    .justifyContent('center')
                    .alignItems('center')
                    .children([
                      Text('FB').fontSize(12).fontWeight(800).color(chalk),
                    ]),
                  Column()
                    .gap(2)
                    .children([
                      Text('Order confirmed')
                        .fontSize(10)
                        .letterSpacing('0.16em')
                        .textTransform('uppercase')
                        .color(lime),
                      Text(orderId.value || '—')
                        .fontSize(13)
                        .fontWeight(800)
                        .letterSpacing('0.08em')
                        .color(pink),
                    ]),
                ]),
              Text('Thanks for shopping.')
                .fontSize('clamp(2.2rem, 5vw, 3.4rem)')
                .fontWeight(800)
                .letterSpacing('-0.05em')
                .lineHeight(0.92)
                .textTransform('uppercase')
                .color(chalk),
              Text(
                newsletter.value
                  ? 'A confirmation would hit your inbox, and you are on the drop list.'
                  : 'A confirmation would hit your inbox. You skipped the drop list.',
              )
                .fontSize(14)
                .lineHeight(1.5)
                .color(muted)
                .maxWidth(420),
              point(
                Button('Keep shopping')
                  .variant('raw')
                  .height(52)
                  .padding('0 22px')
                  .borderRadius('0')
                  .fontSize(12)
                  .fontWeight(800)
                  .letterSpacing('0.14em')
                  .textTransform('uppercase')
                  .bg(pink)
                  .color(chalk)
                  .hover((state: PseudoStateBuilder) => {
                    state.bg('#ffffff').color('#000000')
                  })
                  .pressEffect('shrink')
                  .onPress(() => resetShop()),
              ),
            ]),
        ]),
    ])
}
