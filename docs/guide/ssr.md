# SSR and client boundaries

Builders are React elements, so `renderToString` can serialize a static tree. Anything that touches `window`, `document`, or `createRoot` is client-only.

## What is client-only

| API | Why |
| --- | --- |
| `mount` / `FiboApp().mount` | `createRoot` + `document.querySelector` / `getElementById` |
| `FiboThemeProvider` | writes `document.documentElement` class and CSS variables |
| `.responsive()` / `useViewportWidth` | `window.innerWidth`; SSR snapshot is **1024** (desktop) |
| `.reveal()` / `.onScroll()` | IntersectionObserver |
| `usePrefersReducedMotion` | `matchMedia`; first server render is `false` unless you seed it |
| `Router` | reads `window.location` on the client; server path is `'/'` |

## Next.js

Add `'use client'` to modules that **construct** builders. Import `fiboui/style.css` in a layout. Do not call `mount()`.

```ts snippet
import { Column, Text } from 'fiboui';

export default function Page() {
  return Column().padding(24).children([Text('SSR-safe static tree')]);
}
```

## Static render

```ts snippet
import { Column, Text, toElement } from 'fiboui';

export default function Example() {
  return toElement(Column().children([Text('Stringify me')]));
}
```

`toElement` / `Fibo` unwrap a `FiboChild`. Useful when a parent already created a React root.

## Motion on the server

`.animate()` injects `MotionStyles` so the HTML can include the keyframe sheet (`FIBO_MOTION_CSS` / `ensureMotionCss()`). You still need `import 'fiboui/style.css'` for the full design tokens.

## Isolated islands

Multiple `createRoot` trees should each sit in `ReactivityRoot` (or use `mount()`, which adds one) so effects do not leak across roots.
