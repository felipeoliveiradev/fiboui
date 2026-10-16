import { Box } from 'fiboui/structure'
import { route } from '../modules/site/route'
import { SitePage } from '../modules/site/Views/SitePage'
import { ShopPage } from '../modules/site/Views/shop/ShopPage'

export function App() {
  return Box()
    .width('100%')
    .minHeight('100vh')
    .bindSignal(route)
    .children(() => [route.value === 'shop' ? ShopPage() : SitePage()])
}
