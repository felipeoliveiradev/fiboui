import { Column, Container } from 'fiboui/layout'
import { Box } from 'fiboui/structure'
import { ink } from '../../theme'
import { CatalogView } from './CatalogView'
import { CartView } from './CartView'
import { CheckoutView } from './CheckoutView'
import { ProductView } from './ProductView'
import { shopBanner } from './ShopBanner'
import { shopBar } from './ShopBar'
import { SuccessView } from './SuccessView'
import { screen } from './state'

export function Shop() {
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .bg(ink)
    .padding('0 0 72px')
    .children([
      Container()
        .width('100%')
        .maxWidth(1180)
        .padding('20px 16px 0')
        .lg({ padding: '28px 28px 0' })
        .css({ margin: '0 auto' })
        .children([
          Box()
            .width('100%')
            .bindSignal(screen)
            .children(() => [shell()]),
        ]),
    ])
}

function shell() {
  const catalog = screen.value === 'catalog'
  return Column()
    .width('100%')
    .crossAxisAlignment('stretch')
    .gap(catalog ? 28 : 20)
    .children([
      ...(catalog ? [shopBanner(), shopBar()] : []),
      stage(),
    ])
}

function stage() {
  switch (screen.value) {
    case 'product':
      return ProductView()
    case 'cart':
      return CartView()
    case 'checkout':
      return CheckoutView()
    case 'success':
      return SuccessView()
    case 'catalog':
    default:
      return CatalogView()
  }
}
