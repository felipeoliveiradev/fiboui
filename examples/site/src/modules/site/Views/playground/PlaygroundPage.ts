import { Box, Button, Column, FiboStyles, MotionStyles, Row, Text, type FiboChild } from 'fiboui'
import { face, siteTheme } from '../../theme'
import { TopBar } from '../NavBar'
import { codeField, codeHighlight, codeStatus, showCode } from './editor'
import { codeSuggest } from './suggest'
import { buttonExample, formExample, helloExample } from './examples'
import { output, runPreview } from './state'
import { scheme, typeScale } from './scheme'

const hairline = `1px solid ${scheme.outlineVariant}`

export function PlaygroundPage() {
  return Box()
    .width('100%')
    .height('100vh')
    .bg(scheme.background)
    .color(scheme.onBackground)
    .fontFamily(face)
    .theme(siteTheme)
    .overflow('hidden')
    .children([
      TopBar(),
      Box()
        .className('play-split')
        .display('grid')
        .width('100%')
        .css({
          height: 'calc(100vh - 48px)',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          ['--play-selection' as string]: scheme.selection,
        })
        .children([codePane(), previewPane()]),
      MotionStyles(),
      FiboStyles(),
    ])
}

function codePane(): FiboChild {
  return Column()
    .height('100%')
    .minWidth(0)
    .bg(scheme.surfaceContainerLowest)
    .borderRight(hairline)
    .children([
      samples(),
      Box()
        .className('play-stage')
        .position('relative')
        .width('100%')
        .flex('1')
        .minHeight(0)
        .children([
          codeHighlight(),
          Box()
            .position('absolute')
            .top(0)
            .left(0)
            .right(0)
            .bottom(0)
            .zIndex(1)
            .children([codeField()]),
          codeSuggest(),
        ]),
      codeStatus(),
    ])
}

function samples(): FiboChild {
  return Row()
    .gap(8)
    .height(40)
    .padding('0 12px')
    .alignItems('center')
    .bg(scheme.surfaceContainer)
    .borderBottom(hairline)
    .children([
      Text('Code')
        .color(scheme.onSurfaceVariant)
        .fontSize(typeScale.labelSmall.fontSize)
        .fontWeight(typeScale.labelSmall.fontWeight)
        .letterSpacing(typeScale.labelSmall.letterSpacing)
        .textTransform('uppercase'),
      sample('Hello', helloExample),
      sample('Button', buttonExample),
      sample('Form', formExample),
      Button('Run')
        .marginLeft('auto')
        .height(28)
        .paddingHorizontal(14)
        .bg(scheme.primary)
        .color(scheme.onPrimary)
        .rounded(6)
        .fontSize(typeScale.labelMedium.fontSize)
        .fontWeight(typeScale.labelMedium.fontWeight)
        .letterSpacing('0.08em')
        .textTransform('uppercase')
        .onPress(() => runPreview()),
    ])
}

function sample(label: string, code: string): FiboChild {
  return Button(label)
    .height(28)
    .paddingHorizontal(12)
    .bg(scheme.surfaceContainerHigh)
    .color(scheme.onSurface)
    .border(`1px solid ${scheme.outline}`)
    .rounded(6)
    .fontSize(typeScale.labelMedium.fontSize)
    .fontWeight(typeScale.labelMedium.fontWeight)
    .onPress(() => showCode(code))
}

function previewPane(): FiboChild {
  return Column()
    .height('100%')
    .minWidth(0)
    .bg(scheme.surfaceContainerLow)
    .children([
      Row()
        .height(40)
        .padding('0 12px')
        .alignItems('center')
        .bg(scheme.surfaceContainer)
        .borderBottom(hairline)
        .children([
          Text('Preview')
            .color(scheme.onSurfaceVariant)
            .fontSize(typeScale.labelSmall.fontSize)
            .fontWeight(typeScale.labelSmall.fontWeight)
            .letterSpacing(typeScale.labelSmall.letterSpacing)
            .textTransform('uppercase'),
        ]),
      Box()
        .width('100%')
        .flex('1')
        .minHeight(0)
        .overflow('auto')
        .bindSignal(output)
        .children(() => {
          const node = output.value
          if (node == null) {
            return [
              Text('Run to preview')
                .color(scheme.onSurfaceVariant)
                .fontSize(typeScale.bodySmall.fontSize)
                .padding(28),
            ]
          }
          return [node as FiboChild]
        }),
    ])
}
