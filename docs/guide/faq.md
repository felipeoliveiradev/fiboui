# FAQ

## Do I need `.build()`?

No. Since 2.1, builders are React elements. `.build()` is deprecated and still assembles the host tree.

## Where is the CSS?

```ts snippet
import 'fiboui/style.css';
import { Text } from 'fiboui';

export default function Example() {
  return Text('css imported');
}
```

The JS entry does not inject styles. Use `fiboui/style.css`, not `fiboui/dist/style.css`.

## Can I `require('fiboui')`?

No. The package is ESM-only (`"type": "module"`).

## Why is my Column centered?

2.0 changed the default cross-axis alignment to `center` (Flutter / SwiftUI). Use `.crossAxisAlignment('start')` or `'stretch'`.

## Why is the primary color purple?

Material 3 token `--fibo-primary: #6750A4`. Override the CSS variable if you need another brand color.

## Is there `Text.h1()` / `Section` / `Nav` / `Main` / `Anchor` / `Code` / `Svg`?

**Not on 2.2.0.** Those factories are proposed in unmerged PR #5 (marketing landing). Today: `Text('…').variant('h1')`, `.anchor(id)`, `NavLink`, and `Canvas` / `Path` for SVG.

## JSX or fluent?

Documented examples are fluent (no JSX). `FiboThemeProvider`, `Router`, `Link`, and hooks are React APIs — compose them with `createElement` or, in your app, JSX. Do not use builders as JSX tags (`<Button />` is wrong).

## How do I start without a React file that returns JSX?

```ts snippet
import { Column, Text, mount } from 'fiboui';

function App() {
  return Column().children([Text('No JSX')]);
}

export default App;

export function bootstrap(el: HTMLElement) {
  mount(el, App, { strict: false });
}
```

## Two `useStore`s?

`useReactiveStore(createStore())` is the functional store hook. The decorator `useStore(Class)` is a different API. The core export `useStore` is a deprecated alias of `useReactiveStore`.
