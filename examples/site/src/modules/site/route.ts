import { signal } from 'fiboui'

export type AppRoute = 'home' | 'shop' | 'play'

function pathToRoute(path: string): AppRoute {
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/shop') return 'shop'
  if (clean === '/play') return 'play'
  return 'home'
}

export const route = signal<AppRoute>(pathToRoute(window.location.pathname))

export function navigate(to: AppRoute) {
  const path = to === 'shop' ? '/shop' : to === 'play' ? '/play' : '/'
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
  }
  route.value = to
  window.scrollTo(0, 0)
}

window.addEventListener('popstate', () => {
  route.value = pathToRoute(window.location.pathname)
})
