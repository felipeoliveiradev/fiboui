import { Column, Row, Box, Text } from 'fiboui'
import { chalk, muted } from '../../theme'
import { inkOn, type Product } from './data'

/** Product still — quiet layers, scale on card hover via CSS. */
export function productArt(product: Product, opts?: { tall?: boolean; showMeta?: boolean }) {
  const tall = opts?.tall ?? false
  const ink = inkOn(product.accent)
  return Box()
    .width('100%')
    .position('relative')
    .overflow('hidden')
    .bg(product.ground)
    .css({
      aspectRatio: tall ? '3 / 4' : '3 / 4',
      minHeight: tall ? 400 : 240,
    })
    .children([
      Box()
        .position('absolute')
        .inset(0)
        .css({
          background: `radial-gradient(circle at 70% 25%, ${product.accent}33, transparent 55%)`,
        }),
      Box()
        .position('absolute')
        .top('14%')
        .left('12%')
        .right('12%')
        .bottom('20%')
        .bg(product.accent)
        .className('shop-product-art-panel')
        .children([
          Column()
            .width('100%')
            .height('100%')
            .mainAxisAlignment('spaceBetween')
            .padding(tall ? '20px' : '16px')
            .children([
              Row()
                .width('100%')
                .mainAxisAlignment('spaceBetween')
                .crossAxisAlignment('center')
                .children([
                  Text(product.mark)
                    .fontSize(11)
                    .fontWeight(800)
                    .letterSpacing('0.18em')
                    .color(ink),
                  Box().width(8).height(8).bg(ink),
                ]),
              Text(product.name)
                .fontSize(tall ? 'clamp(1.5rem, 2.6vw, 2.1rem)' : 17)
                .fontWeight(800)
                .letterSpacing('-0.035em')
                .textTransform('uppercase')
                .lineHeight(0.94)
                .color(ink)
                .maxWidth(200),
            ]),
        ]),
      Row()
        .position('absolute')
        .left(0)
        .right(0)
        .bottom(0)
        .height(40)
        .padding('0 14px')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .css({ background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' })
        .children([
          Text(product.category)
            .fontSize(10)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(chalk),
          opts?.showMeta
            ? Text(product.material.split('·')[0]?.trim() ?? '')
                .fontSize(10)
                .letterSpacing('0.08em')
                .textTransform('uppercase')
                .color(muted)
            : Box().width(0).height(0),
        ]),
    ])
}
