import { FiboStyles, MotionStyles } from 'fiboui/core'
import { Box } from 'fiboui/structure'
import { menuOpen } from '../state'
import { face, siteTheme } from '../theme'
import { Home } from './Home'
import { MenuOverlay } from './MenuOverlay'

export function SitePage() {
  return Box()
    .bindSignal(menuOpen)
    .position('relative')
    .width('100%')
    .minHeight('100vh')
    .boxSizing('border-box')
    .overflowX('hidden')
    .bg('background')
    .color('on-background')
    .fontFamily(face)
    .theme(siteTheme)
    .css(
      menuOpen.value
        ? { height: '100dvh', overflow: 'hidden', overscrollBehavior: 'none' }
        : { overflowX: 'hidden' },
    )
    .children([
      Home(),
      MenuOverlay(),
      MotionStyles(),
      FiboStyles(),
    ])
}
