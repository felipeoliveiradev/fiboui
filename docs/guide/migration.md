# Migration

2.0 was a breaking release. There is no production 1.x installed base; this page is the contract for new apps and for moving 2.0 → 2.1 → 2.2.

## From 1.x

Treat 2.x as a new package.

| 1.x habit | 2.x |
| --- | --- |
| UMD / `require('fiboui')` | ESM `import` only (`"type": "module"`) |
| CSS injected by the JS entry | `import 'fiboui/style.css'` |
| `fiboui/src/...` or `fiboui/dist/style.css` | `fiboui` or a listed subpath; CSS is `fiboui/style.css` |
| `Column()` start-aligned on the cross axis | default **center** — use `.crossAxisAlignment('start'\|'stretch')` |
| `--fibo-primary` blues (`#1976d2` / `#6200EE`) | Material 3 `#6750A4` |
| Demo helpers (`Stakent*`), `_styleManager`, `createBuilder` | not exported |
| `.build()` required | optional in 2.0, **deprecated** in 2.1 |

```ts snippet
import { Column, Text } from 'fiboui';

export default function Example() {
  return Column()
    .crossAxisAlignment('start')
    .children([Text('Start aligned')]);
}
```

## 2.0 → 2.1 (no `.build()`)

Builders became React elements.

```ts snippet
import { Column, Text } from 'fiboui';

export default function Example() {
  return Column().children([Text('Hi')]);
}
```

2.0 call sites that still end in `.build()` assemble the same host tree. Remove the call.

## 2.1 → 2.2 (media + motion)

2.2 adds CSS media helpers and motion/scroll on the **existing** builders. There is no `fiboui/motion` subpath.

```ts snippet
import { Box, Presence, Text } from 'fiboui';

export default function Example() {
  return Box()
    .padding(8)
    .md({ padding: 16 })
    .animate('fadeIn')
    .children([
      Text('In'),
      Presence(true).enter('fadeIn').exit('fadeOut').children(Text('Panel')),
    ]);
}
```

Prefer `.media()` / `.md()` over `.responsive()` (JS `innerWidth`). Prefer `.animate()` / `.hover()` over `signal().animate()` / `useSpring()` unless you are interpolating a number in JS.

## Store hooks

Two different `useStore` names exist:

- **`useReactiveStore(createStore())`** — subscribe to a `createStore` instance. Preferred.
- **Decorator `useStore(SomeClass)`** from `Store` — class stores.
- `useStore` from `fiboui` core hooks is a **deprecated alias** of `useReactiveStore` (name clash).

The reactive store **type** is exported as `ReactiveStore`.

## Fine-grained text

`Text(() => sig.value)` patches `textContent` without remounting. You do not need `.observer()` on that `Text`. `bindText(sig)` is the standalone node.

## Reactivity roots

Wrap independent islands in `ReactivityRoot` so `activeEffect` does not leak. `mount()` and `FiboApp().mount()` already wrap one.
