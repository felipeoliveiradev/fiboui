import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text } from 'fiboui'
import { chalk, line } from '../../theme'
import type { MotionTileSpec } from './MotionConstants'

/**
 * Motion chapter tiles: shell stays put; the accent actor is what moves.
 * Avoid `.ease('spring')` on the shell — it sets `transition: all` and kills hoverEffect.
 */
export function motionTile(tile: MotionTileSpec, index: number, total: number) {
  const last = index === total - 1
  return Column()
    .key(tile.label)
    .width('100%')
    .minHeight(132)
    .padding('16px')
    .gap(14)
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('stretch')
    .bg('#0a0a0a')
    .borderRadius('0')
    .cursor('pointer')
    .overflow('hidden')
    .css({
      borderTop: line,
      borderLeft: `3px solid ${tile.accent}`,
      borderRight: index % 2 === 1 || last ? line : 'none',
      borderBottom: line,
      gridColumn: last ? '1 / -1' : undefined,
    })
    .reveal(tile.preset, { once: true })
    .stagger(index * 70)
    .hover((state: PseudoStateBuilder) => {
      state.bg('#121212')
    })
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Text(tile.cue)
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(tile.accent),
          Text(tile.hint)
            .fontSize(9)
            .letterSpacing('0.12em')
            .textTransform('uppercase')
            .color('rgba(255,255,255,0.4)'),
        ]),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('end')
        .children([
          Text(tile.label)
            .fontSize('clamp(1.15rem, 2.2vw, 1.45rem)')
            .fontWeight(800)
            .letterSpacing('0.06em')
            .textTransform('uppercase')
            .color(chalk),
          actor(tile),
        ]),
    ])
}

/** Small mark that actually performs the named motion on hover/press. */
function actor(tile: MotionTileSpec) {
  const base = Box()
    .width(44)
    .height(44)
    .flexShrink('0')
    .bg(tile.accent)
    .borderRadius('0')

  switch (tile.preset) {
    case 'fadeIn':
      return base
        .hover((state: PseudoStateBuilder) => {
          state.opacity(0.2)
        })
        .pressEffect('shrink')
    case 'slideUp':
      return base
        .hover((state: PseudoStateBuilder) => {
          state.translateY(-14)
        })
        .press((state: PseudoStateBuilder) => {
          state.translateY(-4)
        })
    case 'pop':
      return base
        .hover((state: PseudoStateBuilder) => {
          state.scale(1.22)
        })
        .pressEffect('shrink')
    case 'blurIn':
      return base
        .hover((state: PseudoStateBuilder) => {
          state.css('filter', 'blur(5px)').scale(1.06)
        })
        .transition(['filter', 'transform', 'opacity'], 280, 'ease')
        .pressEffect('shrink')
    case 'bounce':
      return base.hoverEffect('bob').pressEffect('pop')
    default:
      return base
  }
}
