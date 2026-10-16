import { Box } from 'fiboui'
import { route } from '../modules/site/route'
import { SitePage } from '../modules/site/Views/SitePage'
import { PlaygroundPage } from '../modules/site/Views/playground/PlaygroundPage'
import { ShopPage } from '../modules/site/Views/shop/ShopPage'

function page() {
  if (route.value === 'shop') return ShopPage()
  if (route.value === 'play') return PlaygroundPage()
  return SitePage()
}

export function App() {
  return Box()
    .width('100%')
    .minHeight('100vh')
    .bindSignal(route)
    .children(() => [page()])
}
