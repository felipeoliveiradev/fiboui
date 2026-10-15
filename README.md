# FiboUI v2.2.1

**A Flutter & SwiftUI-inspired React UI framework featuring a fluent builder API and fine-grained reactivity.**

FiboUI brings chainable builders to React. Compose screens with `Column()`, `Row()`, `Button()`, and `signal()`. Builders **are** React elements — return them from functions and skip `.build()`. Prefer the fluent API (no JSX tags).

---

## Features

- **Assembly pattern** — factories return builders for endless chaining.
- **Zero-build children** — pass builders to `.children()`; they build implicitly. Typed methods (`.onPress`, `.id`, `.spacing`, `.children`) stay assignable as children.
- **Fine-grained reactivity** — `signal()`, `computed()`, `createStore()`, `.bindSignal()`, `.observer()`.
- **Multi-theme** — Material, Cupertino, and Web tokens with CSS variables.
- **Type-safe** — TypeScript builders; `FiboChild` / `FiboChildren` describe child slots.
- **Media queries** — `Box().padding(8).md({ padding: 16 }).lg({ padding: 24 })` compiles to CSS `@media`. `.responsive({ mobile, tablet, desktop })` still works (JS).
- **CSS motion & scroll** — `Box().animate('fadeIn').ease('spring')`, `.onScroll('fadeIn')`, `.stagger(80)`, `.scrollProgress()`, `Presence(open).enter('fadeIn').exit('fadeOut')`. Default path is CSS (no rAF). See `docs/guide/animation.md`.

---

## Installation

```bash
npm install fiboui
```

Import the stylesheet once in your entry file:

```tsx
import 'fiboui/style.css';
```

**Required.** The JS entry does not load CSS. ESM-only (`import`, no `require`). See [MIGRATION.md](./MIGRATION.md) if you used 1.x snapshots.

Peer dependencies: React 18 or 19.

Next.js App Router: files that **call** builders (`Button()`, `Column()`, …) must be Client Components (`'use client'`). FiboUI uses hooks and context; it is not an RSC factory API. Import `'fiboui/style.css'` from a layout or the client entry.

## Releasing

Publishing is automated. The owner must add an **`NPM_TOKEN`** automation secret in the GitHub repo settings. Release branch is **`main`**. See [CONTRIBUTING.md](./CONTRIBUTING.md).

Do not run `npm publish` locally. The `Publish` workflow runs on GitHub Release and on push to `main`: install, typecheck, test, build, then `npm publish --provenance --access public` only if that version is not already on npm. After a successful `main` publish it opens GitHub Release `vX.Y.Z` with the matching CHANGELOG section as notes.

---

## The assembly pattern

### Components as builders

```tsx
import { Card, Text } from 'fiboui';

function Hello() {
  return Card()
    .className('p-8')
    .style({ backgroundColor: '#111' })
    .children([Text('Hello')]);
}
```

### No `.build()`

Builders are valid React elements (`isValidElement(Button('Go'))`). Return them from functions, nest them in `.children()`, or pass them as `React.createElement` arguments. `.build()` still exists and is deprecated.

The event API on `Button` is **`.onPress`** (not `onClick`). `FiboBuilder.onClick` still exists for raw DOM handlers on any builder.

```tsx
import { Button, Column, Text } from 'fiboui';

function App() {
  return Column().children([
    Text('Title').variant('h1'),
    Button('Action').onPress(() => undefined),
  ]);
}
```

---

## Reactivity & state

### Signals

`.bindSignal(sig)` subscribes the builder and **re-assembles** when the signal changes. Read the signal inside a **function child** (or `Text(() => ...)`) so the new value is picked up. Interpolating `sig.value` into a string at construction time is a one-shot snapshot.

```tsx
import { Box, Button, Text, signal } from 'fiboui';

const count = signal(0);

Box()
  .bindSignal(count)
  .children(() => [
    Text(`Count: ${count.value}`),
    Button('+').onPress(() => {
      count.value += 1;
    }),
  ]);
```

`useSignal(count)` and `.observer()` with a function child also work. Signal subscriptions unsubscribe on unmount and are Safe for React 18/19 StrictMode (`useSyncExternalStore`). Signals are in-memory and client-only — do not rely on them during SSR.

`computed(() => ...)` is lazy: the first `.value` read attaches the internal effect. Read it (or `.bindSignal`) so updates notify.

Two store APIs exist: `createStore()` + `useReactiveStore(store)`, and the `@Store()` decorator + `useStore(StoreClass)` (the package-root `useStore`). Builder `.state(key, initial)` is runtime-updatable via `useBuilderState(key)`.

### Global store

```tsx
import { Box, Text, createStore } from 'fiboui';

const store = createStore({ theme: 'dark', user: 'John' });

Box()
  .observer()
  .children(() => Text(store.getState().user));
```

---

## Layout notes

### Column + Row (`spaceBetween`)

Flutter `Column` defaults to `CrossAxisAlignment.center`. SwiftUI `VStack` defaults to `.center`. FiboUI **2.0 matches that: `crossAxisAlignment('center')`.**

**Row uses `align-self: stretch`** so `spaceBetween` still fills the Column width under a centered cross axis.

To stretch every child (Flutter `CrossAxisAlignment.stretch`):

```tsx
Column().crossAxisAlignment('stretch');
```

---

## Scaffold & layout shells

`Scaffold` uses `headerBar`, `footerBar`, `sideBarLeft`, and `sideBarRight`. `DashboardLayout` uses `header` and `sidebar`.

```tsx
import { Header, Scaffold, Sidebar, Text } from 'fiboui';

Scaffold()
  .headerBar(
    Header()
      .height(80)
      .className('px-6 bg-white shadow-sm')
      .children([Text('App Title').variant('h2')])
  )
  .sideBarLeft(
    Sidebar().width(240).children([Text('Home'), Text('Settings')])
  )
  .children([Text('Welcome to the main content area.')]);
```

---

## Example: reactive product grid

```tsx
import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Row,
  Text,
  computed,
  createStore,
} from 'fiboui';

const appStore = createStore({
  cart: [] as { id: string; name: string; price: number; quantity: number }[],
  products: [
    { id: '1', name: 'MacBook Pro', price: 2499 },
    { id: '2', name: 'iPhone 15', price: 999 },
  ],
});

const cartTotal = computed(() => {
  const cart = appStore.getState().cart;
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export function ShopHeader() {
  return Box()
    .observer()
    .children(() => [
      Row().children([
        Text(`Total: $${cartTotal.value.toFixed(2)}`).bindSignal(cartTotal),
        Badge().text(String(appStore.getState().cart.length)),
      ]),
      Grid()
        .columns(2)
        .gap('md')
        .children(
          appStore.getState().products.map((product) =>
            Card().children([
              Text(product.name).weight('bold'),
              Button(`Add $${product.price}`).onPress(() => {
                appStore.setState((s) => ({
                  cart: [...s.cart, { ...product, quantity: 1 }],
                }));
              }),
            ])
          )
        ),
    ]);
}
```

---

## License

MIT © 2025–2026 FiboUI
