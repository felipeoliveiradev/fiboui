import { Box } from 'fiboui'
import { route } from '../modules/site/route'
import { menuOpen } from '../modules/site/state'
import { MenuOverlay } from '../modules/site/Views/MenuOverlay'
import { SitePage } from '../modules/site/Views/SitePage'
import { PlaygroundPage } from '../modules/site/Views/playground/PlaygroundPage'
import { ShopPage } from '../modules/site/Views/shop/ShopPage'

function page() {
  if (route.value === 'shop') return ShopPage()
  if (route.value === 'play') return PlaygroundPage()
  return SitePage()
}

/** Built inside bindSignal children so lock CSS/inert track menuOpen (not a builder snapshot). */
function shell() {
  const lock = menuOpen.value
  const host = Box().width('100%').minHeight('100vh')
  if (lock) {
    host.className('site-menu-open').css({
      height: '100dvh',
      overflow: 'hidden',
      overscrollBehavior: 'none',
    })
  }
  return host.children([
    Box()
      .width('100%')
      .minHeight('100vh')
      .props({
        'data-site-main': 'true',
        ...(lock ? { inert: true, 'aria-hidden': true } : {}),
      })
      .children([page()]),
    MenuOverlay(),
  ])
}

export function App() {
  return Box()
    .width('100%')
    .minHeight('100vh')
    .bindSignal(route)
    .bindSignal(menuOpen)
    .children(() => [shell()])
}
