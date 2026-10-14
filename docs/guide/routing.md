# Routing and navigation

Root exports: `Router`, `Link`, `NavLink`, `useRouter`, `useNavigate`, `useParams`, `useLocation`, `useQuery`.

These are **React components / hooks**, not fluent builders. The `fiboui/navigation` subpath also exports `Outlet`, guards, `lazyRoute`, and match helpers.

## Router

```ts snippet
import { createElement } from 'react';
import { Column, Text, Router } from 'fiboui';

function Home() {
  return Column().children([Text('Home').variant('h1')]);
}

export default function Example() {
  return createElement(Router, {
    routes: [{ path: '/', component: Home, exact: true }],
    basename: '',
  });
}
```

`Router` props: `routes`, `fallback?`, `loading?`, `basename?` (default `''`), `errorBoundary?`, `onError?`.

```ts
interface Route {
  path: string;
  component: React.ComponentType;
  children?: Route[];
  exact?: boolean;
  meta?: Record<string, unknown>;
  beforeEnter?: RouteGuard;
  beforeLeave?: RouteGuard;
}
```

Guards may return `false` (cancel), a string (redirect), or a promise of either.

On the server, `currentPath` initializes to `'/'` (`typeof window === 'undefined'`).

## Link / NavLink

```ts snippet
import { createElement, Fragment } from 'react';
import { Link, NavLink, Router, Text } from 'fiboui';

function Page() {
  return createElement(Fragment, {
    children: [
      createElement(Link, { to: '/', children: 'Home' }),
      createElement(NavLink, { to: '/about', children: 'About' }),
      Text(' body'),
    ],
  });
}

export default function Example() {
  return createElement(Router, {
    routes: [{ path: '/', component: Page }],
  });
}
```

## Hooks

Call only under `Router`:

- `useRouter()` — `{ currentPath, basename, navigate, goBack, replace, params, query }`
- `useNavigate()` — `navigate(path, { replace?, state? })`
- `useParams()`
- `useQuery()` — `URLSearchParams`
- `useLocation()` — `{ pathname, search, hash }`

## Plugins

`PluginManager` and `FiboPlugin` register routes, sidebar items, stores, and overlays. `FiboApp().use(plugin).root(App).mount('root')` installs plugins before render.

```ts snippet
import { Column, Text, FiboApp } from 'fiboui';
import type { FiboPlugin } from 'fiboui';

const plugin: FiboPlugin = {
  name: 'demo',
  setup(ctx) {
    ctx.registerSidebarItem({ label: 'Home', path: '/' });
  },
};

function Root() {
  return Column().children([Text('Plugged in')]);
}

export default Root;

export function start() {
  FiboApp().use(plugin).root(Root).mount('root');
}
```

`Page` / `registerRoute` decorators collect routes for apps that use that style. `getRegisteredRoutes()` / `clearRoutes()` are the registry helpers.
