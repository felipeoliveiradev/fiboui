import { signal } from 'fiboui/core'

export type AppRoute = 'home' | 'shop'

function pathToRoute(path: string): AppRoute {
  const clean = path.replace(/\/+$/, '') || '/'
  return clean === '/shop' ? 'shop' : 'home'
}

export const route = signal<AppRoute>(pathToRoute(window.location.pathname))

export function navigate(to: AppRoute) {
  const path = to === 'shop' ? '/shop' : '/'
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
  }
  route.value = to
  window.scrollTo(0, 0)
}

window.addEventListener('popstate', () => {
  route.value = pathToRoute(window.location.pathname)
})
