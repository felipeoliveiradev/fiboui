import { FiboStyles, MotionStyles, Box } from 'fiboui'
import { face, siteTheme } from '../theme'
import { Home } from './Home'

export function SitePage() {
  return Box()
    .position('relative')
    .width('100%')
    .minHeight('100vh')
    .boxSizing('border-box')
    .overflowX('hidden')
    .bg('background')
    .color('on-background')
    .fontFamily(face)
    .theme(siteTheme)
    .children([
      Home(),
      MotionStyles(),
      FiboStyles(),
    ])
}
