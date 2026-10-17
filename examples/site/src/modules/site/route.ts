import { signal } from 'fiboui'
import { closeMenu } from './state'

export type AppRoute = 'home' | 'shop' | 'play'

export function pathToRoute(path: string): AppRoute {
  const clean = (path.split('?')[0] ?? path).replace(/\/+$/, '') || '/'
  if (clean === '/shop' || clean === '/store') return 'shop'
  if (clean === '/play' || clean === '/playground') return 'play'
  return 'home'
}

export const route = signal<AppRoute>(pathToRoute(window.location.pathname))

export function navigate(to: AppRoute) {
  const path = to === 'shop' ? '/shop' : to === 'play' ? '/play' : '/'
  const here = (window.location.pathname.replace(/\/+$/, '') || '/') + window.location.hash
  if (here !== path) {
    window.history.pushState({}, '', path)
  }
  route.value = to
  closeMenu()
  window.scrollTo(0, 0)
}

window.addEventListener('popstate', () => {
  route.value = pathToRoute(window.location.pathname)
  closeMenu()
})
