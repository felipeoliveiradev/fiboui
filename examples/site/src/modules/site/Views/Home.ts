import type { PseudoStateBuilder } from 'fiboui/core'
import { Column, Row } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { Text } from 'fiboui/content'
import { Button } from 'fiboui/interactive'
import { FibonacciSpiral } from '../FibonacciZoom'
import { copyInstall, setChapter } from '../state'
import { chalk, ink, lime, line, muted, paper, pink } from '../theme'
import { navigate } from '../route'
import { Stage } from './Stage'
import { focusMark, logoMark } from './Logo'
import { TopBar } from './NavBar'
import { go, open, point } from './ui'

const mark = ['F', 'I', 'B', 'O', 'U', 'I'] as const

export function Home() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .bg(ink)
    .children([
      homeScreen(),
      manifesto(),
      Stage(),
      shopBand(),
      quoteBand(),
      contactSplit(),
      foot(),
    ])
}

/** Born home: fixed 40/60. FIBOUI 100% width. Fibonacci φ-zoom (no hover resize). */
function homeScreen() {
  return Column()
    .anchor('root')
    .width('100%')
    .css({ height: '100vh', minHeight: 640, backgroundColor: '#000000' })
    .crossAxisAlignment('stretch')
    .overflow('hidden')
    .children([
      Column()
        .width('100%')
        .css({
          height: '40vh',
          minHeight: 200,
          flexShrink: 0,
          backgroundColor: '#000000',
          overflow: 'hidden',
        })
        .crossAxisAlignment('stretch')
        .mainAxisAlignment('spaceBetween')
        .children([
          TopBar(),
          Row()
            .width('100%')
            .padding('0 1.2vw 0.04em')
            .mainAxisAlignment('spaceBetween')
            .crossAxisAlignment('end')
            .children(
              mark.map((letter) =>
                Text(letter).css({
                  fontSize: 'clamp(4.5rem, 20vw, 36vh)',
                  fontWeight: 800,
                  lineHeight: 0.78,
                  letterSpacing: '0',
                  textTransform: 'uppercase',
                  color: chalk,
                  flex: '0 0 auto',
                }),
              ),
            ),
        ]),
      Box()
        .position('relative')
        .width('100%')
        .css({ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', backgroundColor: pink })
        .children([
          FibonacciSpiral(),
          Box()
            .position('absolute')
            .top(18)
            .left(18)
            .pointerEvents('none')
            .zIndex(2)
            .children([
              Text('Tailored to each request')
                .fontSize(9)
                .letterSpacing('0.14em')
                .textTransform('uppercase')
                .color(chalk),
            ]),
          Box()
            .position('absolute')
            .top(18)
            .right(18)
            .pointerEvents('none')
            .zIndex(2)
            .children([
              Text('Attention to detail')
                .fontSize(9)
                .letterSpacing('0.14em')
                .textTransform('uppercase')
                .color(chalk),
            ]),
          Box()
            .position('absolute')
            .bottom(22)
            .left(22)
            .width(34)
            .height(34)
            .borderRadius('999px')
            .border('1px solid rgba(255,255,255,0.85)')
            .justifyContent('center')
            .alignItems('center')
            .display('flex')
            .pointerEvents('none')
            .zIndex(2)
            .children([focusMark(14)]),
        ]),
    ])
}

function manifesto() {
  return Column()
    .anchor('switch')
    .width('100%')
    .minHeight('100vh')
    .css({ height: '100dvh', minHeight: '100vh' })
    .crossAxisAlignment('stretch')
    .mainAxisAlignment('spaceBetween')
    .padding('64px 16px 48px')
    .bg('#000000')
    .boxSizing('border-box')
    .lg({ padding: '88px 28px 64px' })
    .reveal('fadeIn', { once: true })
    .children([
      Column()
        .width('100%')
        .flex('1')
        .mainAxisAlignment('center')
        .crossAxisAlignment('start')
        .gap(22)
        .children([
          Text('There is no JSX. The function returns Column, Text, and Button — that return is the element.')
            .fontSize('clamp(2rem, 5.2vw, 4.2rem)')
            .fontWeight(800)
            .lineHeight(0.95)
            .letterSpacing('-0.04em')
            .textTransform('uppercase')
            .color(chalk)
            .maxWidth(1100),
          Text('Raw builders first. Signals, theme, and motion craft the screen — far from a generic template.')
            .fontSize(14)
            .letterSpacing('0.04em')
            .lineHeight(1.45)
            .color(muted)
            .maxWidth(520),
        ]),
      Row()
        .width('100%')
        .mainAxisAlignment('end')
        .crossAxisAlignment('end')
        .children([Box().width(48).height(48).bg(lime).flexShrink('0')]),
    ])
}

/** Promo for the standalone Fibo Store — sits between demos and social proof. */
function shopBand() {
  return Column()
    .anchor('store')
    .width('100%')
    .crossAxisAlignment('stretch')
    .padding('72px 16px')
    .bg('#000000')
    .borderTop(line)
    .lg({ padding: '96px 28px' })
    .reveal('fadeIn', { once: true })
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .flexWrap('wrap')
        .gap(12)
        .children([
          Text('Fibo Store')
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(muted),
          Text('Live product · fiboui-store.vercel.app')
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(pink),
        ]),
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .margin('36px 0 0')
        .gap(36)
        .lg({ gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'end' })
        .children([
          Column()
            .gap(18)
            .crossAxisAlignment('start')
            .children([
              Text('Wear the return.')
                .fontSize('clamp(2.4rem, 6vw, 4.6rem)')
                .fontWeight(800)
                .lineHeight(0.92)
                .letterSpacing('-0.045em')
                .textTransform('uppercase')
                .color(chalk)
                .maxWidth(720),
              Text(
                'A full store built only with FiboUI builders — catalog, bag, and checkout. Same kit. Separate product.',
              )
                .fontSize(15)
                .lineHeight(1.45)
                .letterSpacing('0.01em')
                .color(muted)
                .maxWidth(480),
              point(
                Button('Open Fibo Store')
                  .variant('raw')
                  .height(48)
                  .padding('0 22px')
                  .margin('8px 0 0')
                  .borderRadius('0')
                  .fontSize(12)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .bg(chalk)
                  .color('#000000')
                  .hover((state: PseudoStateBuilder) => {
                    state.bg(pink).color(chalk)
                  })
                  .onPress(() => open('https://fiboui-store.vercel.app')),
              ),
            ]),
          Column()
            .gap(10)
            .crossAxisAlignment('stretch')
            .children([
              Row()
                .gap(10)
                .children([
                  Box().flex('1').height(120).bg(pink),
                  Box().flex('1').height(120).bg(lime),
                ]),
              Box()
                .width('100%')
                .padding('18px')
                .border(line)
                .bg('#080808')
                .children([
                  Column()
                    .gap(8)
                    .crossAxisAlignment('start')
                    .children([
                      Text('What ships')
                        .fontSize(9)
                        .letterSpacing('0.14em')
                        .textTransform('uppercase')
                        .color(muted),
                      Text('Catalog · filters · bag · checkout · success')
                        .fontSize(13)
                        .fontWeight(700)
                        .letterSpacing('-0.01em')
                        .color(chalk),
                      Text('Domain · application · design · ui')
                        .fontSize(12)
                        .color(muted),
                    ]),
                ]),
            ]),
        ]),
    ])
}

function quoteBand() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .padding('64px 16px')
    .bg(pink)
    .borderTop(line)
    .lg({ padding: '88px 28px' })
    .reveal('fadeIn', { once: true })
    .children([
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Text('From teams shipping with FiboUI')
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(chalk),
          Text('Proof')
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(chalk),
        ]),
      Text('We didn\'t expect a fluent kit to feel this personal — every screen looked made just for our product.')
        .fontSize('clamp(1.8rem, 4.2vw, 3.4rem)')
        .fontWeight(800)
        .lineHeight(0.98)
        .letterSpacing('-0.035em')
        .textTransform('uppercase')
        .color(chalk)
        .margin('28px 0 0')
        .maxWidth(980),
    ])
}

function contactSplit() {
  return Box()
    .anchor('contact')
    .width('100%')
    .display('grid')
    .minWidth(0)
    .borderTop(line)
    .lg({ gridTemplateColumns: '1fr 1fr' })
    .children([
      Column()
        .width('100%')
        .minHeight(360)
        .padding('32px 16px')
        .bg(paper)
        .crossAxisAlignment('stretch')
        .mainAxisAlignment('spaceBetween')
        .lg({ padding: '40px 28px', minHeight: 480 })
        .children([
          Column()
            .gap(14)
            .crossAxisAlignment('start')
            .children([
              Text('Start')
                .fontSize(9)
                .letterSpacing('0.16em')
                .textTransform('uppercase')
                .color(pink),
              Text('Install the kit. Open the demos. Ship the screen.')
                .fontSize('clamp(1.8rem, 3.4vw, 2.6rem)')
                .fontWeight(800)
                .lineHeight(0.98)
                .letterSpacing('-0.035em')
                .textTransform('uppercase')
                .color(ink)
                .maxWidth(440),
            ]),
        ]),
      Column()
        .width('100%')
        .minHeight(360)
        .padding('32px 16px')
        .bg(lime)
        .crossAxisAlignment('stretch')
        .mainAxisAlignment('spaceBetween')
        .gap(28)
        .lg({ padding: '40px 28px', minHeight: 480 })
        .children([
          Column()
            .gap(10)
            .crossAxisAlignment('start')
            .children([
              Text('CLI')
                .fontSize(9)
                .letterSpacing('0.16em')
                .textTransform('uppercase')
                .color('#000000'),
              Text('npm install fiboui')
                .fontSize('clamp(1.35rem, 2.4vw, 1.9rem)')
                .fontWeight(800)
                .letterSpacing('-0.02em')
                .textTransform('uppercase')
                .color('#000000'),
              Text('100% open source forever. MIT.')
                .fontSize(13)
                .lineHeight(1.4)
                .color('rgba(0,0,0,0.65)')
                .maxWidth(320),
            ]),
          Column()
            .gap(10)
            .crossAxisAlignment('stretch')
            .children([
              point(
                Button('Copy install')
                  .variant('raw')
                  .width('100%')
                  .padding('18px 20px')
                  .bg('#000000')
                  .borderRadius('0')
                  .fontSize(12)
                  .fontWeight(800)
                  .letterSpacing('0.12em')
                  .textTransform('uppercase')
                  .color(chalk)
                  .hover((state: PseudoStateBuilder) => {
                    state.bg(pink)
                  })
                  .onPress(() => {
                    void copyInstall()
                  }),
              ),
              Row()
                .width('100%')
                .gap(10)
                .children([
                  startLink('Demos', () => go('#work')),
                  startLink('GitHub', () => open('https://github.com/felipeoliveiradev/fiboui')),
                  startLink('npm', () => open('https://www.npmjs.com/package/fiboui')),
                ]),
            ]),
        ]),
    ])
}

function startLink(label: string, onPress: () => void) {
  return point(
    Button(label)
      .key(label)
      .variant('raw')
      .flex('1')
      .padding('16px 10px')
      .bg('transparent')
      .border('2px solid #000000')
      .borderRadius('0')
      .fontSize(11)
      .fontWeight(800)
      .letterSpacing('0.1em')
      .textTransform('uppercase')
      .color('#000000')
      .hover((state: PseudoStateBuilder) => {
        state.bg('#000000').color(chalk)
      })
      .onPress(onPress),
  )
}

/** Site footer — giant wordmark, six pink-hover cells, copyright rail. */
function foot() {
  const year = new Date().getFullYear()
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .bg('#000000')
    .borderTop(line)
    .children([
      Column()
        .width('100%')
        .padding('40px 16px 28px')
        .crossAxisAlignment('stretch')
        .gap(28)
        .lg({ padding: '56px 28px 36px' })
        .children([
          Text('FiboUI')
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(lime),
          Row()
            .width('100%')
            .crossAxisAlignment('center')
            .gap(18)
            .flexWrap('wrap')
            .children([
              logoMark(42),
              Text('FiboUI')
                .fontSize('clamp(3.2rem, 14vw, 9rem)')
                .fontWeight(800)
                .lineHeight(0.82)
                .letterSpacing('-0.06em')
                .textTransform('uppercase')
                .color(chalk),
            ]),
          Text('Fluent UI for React. There is no JSX.')
            .fontSize(14)
            .letterSpacing('0.02em')
            .color(muted)
            .maxWidth(420),
        ]),
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .borderTop(line)
        .css({ gridTemplateColumns: '1fr 1fr' })
        .lg({ gridTemplateColumns: 'repeat(6, 1fr)' })
        .children([
          footCell('Work', () => go('#work'), 0),
          footCell('Shop', () => navigate('shop'), 1),
          footCell('Why', () => go('#switch'), 2),
          footCell('Install', () => {
            void copyInstall()
          }, 3),
          footCell('GitHub', () => open('https://github.com/felipeoliveiradev/fiboui'), 4),
          footCell('npm', () => open('https://www.npmjs.com/package/fiboui'), 5),
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
          Text(`© ${year} FiboUI`)
            .fontSize(9)
            .letterSpacing('0.14em')
            .textTransform('uppercase')
            .color(muted),
          point(
            Button('Builders · Signals · Theme · Motion · Media')
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
              .onPress(() => jump('builders')),
          ),
        ]),
    ])
}

function footCell(label: string, onPress: () => void, index: number) {
  return point(
    Button(label)
      .key(label)
      .variant('raw')
      .width('100%')
      .minHeight(72)
      .padding('0 16px')
      .borderRadius('0')
      .bg('transparent')
      .fontSize(12)
      .fontWeight(800)
      .letterSpacing('0.1em')
      .textTransform('uppercase')
      .color(chalk)
      .justifyContent('flex-start')
      .css({
        borderRight: index % 2 === 0 ? line : 'none',
        borderBottom: line,
      })
      .lg({
        borderRight: index < 5 ? line : 'none',
        borderBottom: 'none',
        minHeight: 88,
      })
      .hover((state: PseudoStateBuilder) => {
        state.bg(pink)
      })
      .onPress(onPress),
  )
}

function jump(id: 'builders' | 'signals' | 'theme' | 'motion' | 'media') {
  setChapter(id)
  go('#work')
}
