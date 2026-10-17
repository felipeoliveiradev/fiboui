# SSR and hydration

FiboUI 2.7.1 is safe to `renderToString` / Next.js App Router / Vite SSR and then `hydrateRoot`. The first client render matches the server HTML. Browser-only values (viewport, `matchMedia`, `location`) apply **after** mount.

## Inject collected CSS

`.hover()`, `.md()`, `.responsive()`, and custom keyframes register rules on `StyleManager`. Class names are a **stable hash of the CSS** (`fibo-ps-*`, `fibo-mq-*`) — same declarations always produce the same class, independent of call order, HMR, or a counter. During SSR, collection is **request-local** so overlapping `renderToString` calls do not mix rules.

During SSR the manager has no `document`. Collect rules by rendering, then emit the tag:

```tsx
import { renderToString } from 'react-dom/server';
import { Box, getStyleTag } from 'fiboui';
import 'fiboui/style.css';

const app = Box().hover((h) => h.scale(1.05)).children('Hi');
const html = renderToString(app);
const styles = getStyleTag(); // call AFTER renderToString

const documentHtml = `<!doctype html>
<html>
  <head>${styles}</head>
  <body>
    <div id="root">${html}</div>
    <script type="module" src="/entry-client.js"></script>
  </body>
</html>`;
```

`getStyleTag()` returns `<style id="fibo-dynamic-styles" data-fibo="1">…</style>`. On the client, `StyleManager` **reuses** that node (no second sheet, no flash).

### React tree: `<FiboStyles />`

Put it as a **later sibling** of the UI so builders run first and the tag includes their rules:

```tsx
import { Column, FiboStyles, Text } from 'fiboui';

export default function Page() {
  return (
    <>
      {Column().children([Text('Hello')])}
      <FiboStyles />
    </>
  );
}
```

Use **either** `getStyleTag()` **or** `<FiboStyles />`, not both (duplicate `#fibo-dynamic-styles`). `getCss()` is the raw CSS string if you inject yourself.

## Next.js App Router (14 / 15)

**Zero JSX + no `'use client'` on the route.** App Router resolves `fiboui` via the `react-server` export (`dist/server.js`) — static builders with hook islands stubbed. Client bundles still ship `.observer()`, signals, Router, etc. under the default export. Host listeners (`Button` ripple / `.onPress()`) stay on the client island; the RSC paint is the same `<button>` without functions so Flight can prerender.

```ts
// app/layout.tsx (Server) — base sheet once
import 'fiboui/style.css';

// app/page.tsx — Server Component (no 'use client')
import { page, Column, Text } from 'fiboui';

export default page(() =>
  Column().gap(12).children([Text('Hello')])
);
```

`page()` appends `FiboStyles` via `createElement` during RSC render. Or `withFiboStyles(Column()…)`.

Next tip: `transpilePackages: ['fiboui']`. Prefer `npm i --install-links file:…` over a raw symlink (Turbopack). Reactive trees still need a Client Component boundary.

`FiboThemeProvider` (and fluent `.theme(...)`) stamp `fibo-theme-*` plus CSS variables as **inline style on the wrapper** so the first paint matches SSR. No `document.documentElement` write — vars inherit like Flutter/SwiftUI environment.

## Vite SSR

Hydrate only `#root`. Leave the style tag **outside** the hydrate root (see `getStyleTag()` above) so React does not reconcile it.

```tsx
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';

hydrateRoot(document.getElementById('root')!, <App />);
```

## `.responsive()` is CSS

`.responsive({ mobile, tablet, desktop })` compiles to `@media` like `.md()` / `.media()`:

| tier | query |
|------|--------|
| mobile | `(max-width: 767px)` |
| tablet | `(min-width: 768px) and (max-width: 1023px)` |
| desktop | `(min-width: 1024px)` |

No `window.innerWidth` during render. The API is unchanged. Prefer `.md()` / `.media()` when you want Tailwind-aligned min-width breakpoints (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280).

`useViewportWidth()` still exists for JS that must read the viewport. It uses `useSyncExternalStore` with **`getServerSnapshot` = 1024**, so the first client render matches SSR; the real width arrives after mount.

## Lists and `.key()`

Builders are React elements. In a `.map()`, call **`.key(id)`** so the FiboElement wrapper (the inner host in the bundle) gets a string key:

```tsx
items.map((item) =>
  Card().key(item.id).hover((h) => h.scale(1.02)).children(item.title)
)
```

`.children([...])` also stamps stable index keys when you omit `.key()`, so `Grid().variant('bento').children([Text('A'), Text('B')])` does not warn. Prefer real ids in dynamic lists.

## Router

`Router` does not read `window.location` during render. Pass the request URL:

```tsx
<Router
  routes={routes}
  initialPath={requestPath}
  initialSearch={requestSearch}
  initialHash={requestHash}
/>
```

The first client render uses those props (default path `/`). After mount it syncs from `window`. `useLocation()` reads the router context, not `window`.

Nested routes work: a parent with `children` is a layout (`exact` defaults to false). Put `<Outlet />` in that layout — it renders the matched child and provides current-route context. `javascript:` / `data:` `Link` hrefs are blocked. Full API: [Routing / Outlet](./routing.md).

## What is hydrate-safe vs after-mount

| API | First render (SSR + hydrate) | After mount |
|-----|------------------------------|-------------|
| `.hover()` / `.press()` / `.focusRing()` / `.active()` | Hashed classes + CSS in `getStyleTag()` / `<FiboStyles />` | same |
| `.responsive()` / `.md()` / `.media()` | CSS `@media` classes | same |
| `.animate()` / `.stagger()` | CSS classes / `--fibo-i` | same |
| `usePrefersReducedMotion()` | `false` (no `matchMedia`) | real `prefers-reduced-motion` |
| `Presence` | `show` (boolean or `signal.value`) | same; reduced-motion snapshot is `false` until mount |
| `.reveal()` / `.onScroll()` | markup without `.fibo-inview` | IntersectionObserver |
| `.scrollProgress()` / `useScrollProgress()` | `--fibo-progress` unset / `0` | scroll listeners |
| `FiboThemeProvider` / `.theme()` | wrapper class + inline `--fibo-*` vars | same (no documentElement) |
| `Router` | `initialPath` or `/` | `window.location` |
| `useViewportWidth()` | `1024` | `innerWidth` |
| `useId()` on inputs | React SSR id | same |

Do not read `localStorage`, `matchMedia`, `document`, or `window` inside a builder’s render path. Event handlers and `useEffect` are fine.

## Client-only helpers

`mount()`, `FiboApp`, `scrollTo()`, gesture builders, and storage helpers need a DOM. Call them from effects or client entry files, not during SSR render.
