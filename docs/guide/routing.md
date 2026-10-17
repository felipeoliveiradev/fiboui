# Routing

`Router`, `Link`, and `NavLink` are exported from `fiboui`. Nested layouts use `Outlet` from the navigation barrel (`fiboui/navigation`).

A route with `children` is a **layout**. Matching uses a prefix when `exact` is omitted on that parent (`exact` defaults to `!children`). The layout renders; put `<Outlet />` where the child page should appear. `Outlet` wraps the child in the current-route context so nested `useParams` / `useRouteMeta` / another `Outlet` see the leaf.

```tsx
import { Router, Link } from 'fiboui'
import { Outlet } from 'fiboui/navigation'

function AppLayout() {
  return (
    <div>
      <Link to="/app/dash">Dash</Link>
      <Outlet />
    </div>
  )
}

function Dash() {
  return <span>dash</span>
}

<Router
  routes={[
    {
      path: '/app',
      component: AppLayout,
      children: [{ path: '/app/dash', component: Dash }],
    },
  ]}
/>
```

`/app/dash` paints the layout chrome **and** the child. A layout with no matching child leaves `Outlet` empty (add a child `*` for a nested 404).

## Link

In-app paths go through the router. `http(s)`, `//`, `mailto` / `tel` / `sms`, and `#` stay native `<a href>`.

`javascript:`, `data:`, `vbscript:`, and `file:` are blocked: `href` is omitted and the click is cancelled. `target="_blank"` always merges `rel="noopener noreferrer"`.

```tsx
<Link to="/app/dash">Dash</Link>
<Link to="https://example.com">External</Link>
<Link to="javascript:alert(1)">no-op</Link>
```

## Lazy routes

`lazyRoute(loader)` shares a `WeakMap` cache with `preloadRoute(loader)` (one fetch). The default `Suspense` fallback is `<DefaultLoader />` (`role="status"`).

```tsx
import { lazyRoute, preloadRoute } from 'fiboui/navigation'

const Dash = lazyRoute(() => import('./Dash'))
preloadRoute(() => import('./Dash'))
```

## Meta and guards

`useRouteMeta()` reads the **current** route’s `meta` (the leaf inside an `Outlet`). `beforeEnter` / `beforeLeave` run on the full matched chain, including `popstate` and the first client load. Return `false` to block (fallback / 404); return a string to redirect.

SSR: pass `initialPath` / `initialSearch` / `initialHash` so the first render does not read `window`. See [SSR / hydration](./ssr.md).
