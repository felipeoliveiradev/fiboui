# Migrating to FiboUI 2.0

2.0 is a breaking release. There is no 1.x installed base; this document is the contract for new apps.

## 1. Install and import CSS yourself

```tsx
import 'fiboui/style.css';
import { Button, Column } from 'fiboui';
```

`import 'fiboui'` no longer injects styles. `fiboui/dist/style.css` was removed from `exports` — use `fiboui/style.css`.

## 2. ESM only

```js
import { Button } from 'fiboui';
```

`require('fiboui')` is unsupported. Set `"type": "module"` or use `import` in the consumer. Next.js App Router pages that call builders still need `'use client'`.

## 3. Do not import `fiboui/src/...`

The pack contains `dist/` only. Use the root or a subpath:

```ts
import { signal } from 'fiboui/core';
import { Column, Row } from 'fiboui/layout';
import { Button } from 'fiboui/interactive';
import { springEase, MotionStyles } from 'fiboui/motion';
```

## 4. Column default is `center`

Children are centered on the cross axis (Flutter / SwiftUI). For the old 1.0.2 start alignment:

```ts
Column().crossAxisAlignment('start');
```

To fill the column width:

```ts
Column().crossAxisAlignment('stretch');
```

Rows still `self-stretch`, so `spaceBetween` works inside a Column.

## 5. Theme hexes are Material 3

`--fibo-primary` is `#6750A4` (was `#1976d2` in `base.css` and `#6200EE` in `materialTheme`). Override tokens on `:root` / `.fibo-theme-material` if you need the old blues.

## 6. Curated exports

Public names are listed in `src/index.ts`. These are **gone** from the package root:

- `StakentButton` and other Stakent demo helpers
- `_styleManager`, `createBuilder`, `FiboBuilder`
- Deep internals (`Tracker`, `StyleManager`, gesture recognizers, …)

The decorator `Store` / `useStore(Class)` stays. The reactive store type is exported as `ReactiveStore`. Use `useReactiveStore(createStore())` for the hook.

## 7. Fine-grained text

`Text(() => sig.value)` patches the text node. You do not need `.observer()` or `.bindSignal()` on that `Text` for the label to update. `bindText(sig)` is the same idea as a standalone node.

## 8. Isolated reactivity roots

Wrap independent islands (or multiple `createRoot` trees) in `<ReactivityRoot>` so `activeEffect` does not leak across them. `FiboApp().mount()` and `mount('#root', App)` do this for you.

## 9. Ergonomic builders (new, preferred)

Custom chrome no longer needs `variant('raw')` plus a long `.style()` object.

```ts
Button('GET STARTED').variant('solid').tone('inverse').shape('rect').size('xs')
Button('ANALYZE').variant('solid').tone('inverse').shape('rect').size('xs').expand()
Row().hug()                          // chip / compact cluster
Text('MONEY TRACKER').nowrap().mono()
Text('SAVING').muted()
Avatar().size(24).icon('user')
Avatar().size(32).initials('AB')
Progress().variant('ring').size(190).strokeWidth(2.4).segments([
  { value: 50, color: '#fff' },
  { value: 25, color: '#888' },
])
ListTile().icon(node).title('Row').chevron().divider()
mount('#root', App)                  // App returns a builder — no .build()
```

## 10. No `.build()` (2.1)

Builders are React elements. Drop trailing `.build()` on returns, JSX children, arrays, and props. `.build()` still assembles the host tree if you have 2.0 call sites.

```tsx
function App() {
  return Column().children([Text('Hi')]);
}
```
