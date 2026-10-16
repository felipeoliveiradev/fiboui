import type { PseudoStateBuilder } from 'fiboui'
import { Column, Row, Box, Text, Button } from 'fiboui'
import { chapter, openFile, setChapter, setOpenFile } from '../state'
import { chalk, lime, line, muted, pink } from '../theme'
import { codeBlock } from './highlight'
import { point } from './ui'
import { BuildersView } from './demos/BuildersView'
import { SignalsView } from './demos/SignalsView'
import { ThemeView } from './demos/ThemeView'
import { MotionView } from './demos/MotionView'
import { MediaView } from './demos/MediaView'
import buildersView from './demos/BuildersView.ts?raw'
import buildersButton from './demos/BuildersButton.ts?raw'
import buildersConstants from './demos/BuildersConstants.ts?raw'
import signalsView from './demos/SignalsView.ts?raw'
import signalsItem from './demos/SignalsItem.ts?raw'
import signalsModel from './demos/SignalsViewModel.ts?raw'
import themeView from './demos/ThemeView.ts?raw'
import themeChip from './demos/ThemeChip.ts?raw'
import themeModel from './demos/ThemeViewModel.ts?raw'
import themeConstants from './demos/ThemeConstants.ts?raw'
import motionView from './demos/MotionView.ts?raw'
import motionTile from './demos/MotionTile.ts?raw'
import motionConstants from './demos/MotionConstants.ts?raw'
import mediaView from './demos/MediaView.ts?raw'
import mediaCell from './demos/MediaCell.ts?raw'
import mediaModel from './demos/MediaViewModel.ts?raw'
import mediaConstants from './demos/MediaConstants.ts?raw'

type ChapterId = 'builders' | 'signals' | 'theme' | 'motion' | 'media'

type SourceFile = { role: string; name: string; code: string }

type Chapter = {
  id: ChapterId
  index: string
  label: string
  title: string
  body: string
  demo: () => ReturnType<typeof BuildersView>
  files: SourceFile[]
}

const chapters: Chapter[] = [
  {
    id: 'builders',
    index: '01',
    label: 'Builders',
    title: 'Hello is a function return.',
    body: 'Eyebrow, title, caption, three button kinds, and a facts strip — one Column. Filled, Outlined, and Text share BuildersButton. Constants hold the words. mount() receives the return. There is no .build().',
    demo: () => BuildersView(),
    files: [
      { role: 'View', name: 'BuildersView.ts', code: buildersView },
      { role: 'Component', name: 'BuildersButton.ts', code: buildersButton },
      { role: 'Constants', name: 'BuildersConstants.ts', code: buildersConstants },
    ],
  },
  {
    id: 'signals',
    index: '02',
    label: 'Signals',
    title: 'A todo list is a signal.',
    body: 'Draft, filter, and the list are three signals. Add, toggle, remove, and clear done write the same array. The header count, the tabs, and the rows all re-render from that — only the bound nodes patch.',
    demo: () => SignalsView(),
    files: [
      { role: 'View', name: 'SignalsView.ts', code: signalsView },
      { role: 'Component', name: 'SignalsItem.ts', code: signalsItem },
      { role: 'View model', name: 'SignalsViewModel.ts', code: signalsModel },
    ],
  },
  {
    id: 'theme',
    index: '03',
    label: 'Theme',
    title: 'Four palettes. One card.',
    body: 'Ink, pink, lime, and paper. The chip writes the signal. The card calls extendTheme() and .theme(). Swatches, type, and both buttons read the same keys — no second style sheet.',
    demo: () => ThemeView(),
    files: [
      { role: 'View', name: 'ThemeView.ts', code: themeView },
      { role: 'Component', name: 'ThemeChip.ts', code: themeChip },
      { role: 'View model', name: 'ThemeViewModel.ts', code: themeModel },
      { role: 'Constants', name: 'ThemeConstants.ts', code: themeConstants },
    ],
  },
  {
    id: 'motion',
    index: '04',
    label: 'Motion',
    title: 'Hover the mark.',
    body: 'Each tile reveals on scroll. The accent square is the actor — fade, rise, pop, blur, or bounce on hover. The shell stays put. Stagger is 90ms between tiles.',
    demo: () => MotionView(),
    files: [
      { role: 'View', name: 'MotionView.ts', code: motionView },
      { role: 'Component', name: 'MotionTile.ts', code: motionTile },
      { role: 'Constants', name: 'MotionConstants.ts', code: motionConstants },
    ],
  },
  {
    id: 'media',
    index: '05',
    label: 'Media',
    title: 'Same tree. Three frames.',
    body: 'Small, Medium, and Large change the frame width. Stacked until Large opens three columns. The cells keep their cue, title, and body — you do not resize the window, and you do not write a second tree.',
    demo: () => MediaView(),
    files: [
      { role: 'View', name: 'MediaView.ts', code: mediaView },
      { role: 'Component', name: 'MediaCell.ts', code: mediaCell },
      { role: 'View model', name: 'MediaViewModel.ts', code: mediaModel },
      { role: 'Constants', name: 'MediaConstants.ts', code: mediaConstants },
    ],
  },
]

function currentChapter() {
  return chapters.find((item) => item.id === chapter.value) ?? chapters[0]
}

export function Stage() {
  return Column()
    .anchor('work')
    .width('100%')
    .crossAxisAlignment('stretch')
    .bg('#000000')
    .padding('0 0 64px')
    .children([
      Box().bindSignal(chapter).children(() => [tabs()]),
      Box()
        .display('grid')
        .width('100%')
        .minWidth(0)
        .padding('40px 16px 0')
        .rowGap(36)
        .lg({
          padding: '48px 28px 0',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          columnGap: '40px',
          alignItems: 'start',
        })
        .children([
          Box().minWidth(0).bindSignal(chapter).children(() => [lesson()]),
          Box().minWidth(0).bindSignal(chapter).bindSignal(openFile).children(() => [editor()]),
        ]),
    ])
}

function tabs() {
  return Box()
    .display('grid')
    .width('100%')
    .minWidth(0)
    .borderBottom(line)
    .css({ gridTemplateColumns: 'repeat(5, 1fr)' })
    .children(chapters.map((item, i) => chapterTab(item, i)))
}

function chapterTab(item: Chapter, index: number) {
  const active = chapter.value === item.id
  return point(
    Button('')
      .key(item.id)
      .variant('raw')
      .width('100%')
      .minHeight(72)
      .padding('12px 10px')
      .justifyContent('flex-start')
      .alignItems('flex-start')
      .borderRadius('0')
      .bg(active ? pink : 'transparent')
      .css({
        borderRight: index < chapters.length - 1 ? line : 'none',
      })
      .hover((state: PseudoStateBuilder) => {
        if (!active) state.bg('rgba(255,45,138,0.35)')
      })
      .onPress(() => setChapter(item.id)),
  ).children([
    Column()
      .gap(4)
      .crossAxisAlignment('start')
      .children([
        Text(item.index)
          .fontSize(9)
          .letterSpacing('0.14em')
          .textTransform('uppercase')
          .color(active ? chalk : lime),
        Text(item.label)
          .fontSize(11)
          .fontWeight(800)
          .letterSpacing('0.1em')
          .textTransform('uppercase')
          .color(chalk),
      ]),
  ])
}

function lesson() {
  const item = currentChapter()
  return Column()
    .key(item.id)
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(18)
    .children([
      Row()
        .gap(10)
        .crossAxisAlignment('center')
        .children([
          Text(item.index)
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(lime),
          Text(item.label)
            .fontSize(9)
            .letterSpacing('0.16em')
            .textTransform('uppercase')
            .color(muted),
        ]),
      Text(item.title)
        .fontSize('clamp(1.6rem, 3.2vw, 2.4rem)')
        .fontWeight(800)
        .lineHeight(0.98)
        .letterSpacing('-0.035em')
        .textTransform('uppercase')
        .color(chalk),
      Text(item.body).fontSize(14).lineHeight(1.5).letterSpacing('0.01em').color(muted).maxWidth(480),
      Box()
        .width('100%')
        .minWidth(0)
        .margin('8px 0 0')
        .padding('20px 0 0')
        .borderTop(line)
        .children([item.demo()]),
    ])
}

function editor() {
  const item = currentChapter()
  const file = item.files[openFile.value] ?? item.files[0]
  return Column()
    .key(`${item.id}-${file.name}`)
    .width('100%')
    .crossAxisAlignment('stretch')
    .border(line)
    .bg('#000000')
    .children([
      Row()
        .width('100%')
        .flexWrap('wrap')
        .crossAxisAlignment('stretch')
        .borderBottom(line)
        .children(item.files.map((entry, index) => fileTab(entry.role, index, item.files.length))),
      Row()
        .width('100%')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .padding('12px 16px')
        .borderBottom(line)
        .children([
          Text(file.name)
            .fontFamily('ui-monospace, SFMono-Regular, Menlo, Consolas, monospace')
            .fontSize(12)
            .letterSpacing('0.02em')
            .color(chalk),
          Text(file.role).fontSize(9).letterSpacing('0.14em').textTransform('uppercase').color(lime),
        ]),
      codeBlock(file.code),
    ])
}

function fileTab(role: string, index: number, total: number) {
  const active = openFile.value === index
  return point(
    Button(role)
      .key(role)
      .variant('raw')
      .minHeight(48)
      .padding('0 16px')
      .fontSize(11)
      .fontWeight(800)
      .letterSpacing('0.1em')
      .textTransform('uppercase')
      .borderRadius('0')
      .bg(active ? pink : 'transparent')
      .color(chalk)
      .css({
        borderRight: index < total - 1 ? line : 'none',
      })
      .hover((state: PseudoStateBuilder) => {
        if (!active) state.bg('rgba(255,45,138,0.35)')
      })
      .onPress(() => setOpenFile(index)),
  )
}
