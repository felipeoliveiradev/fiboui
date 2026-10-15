<div align="center">

```
 ███████╗██╗██████╗  ██████╗ ██╗   ██╗██╗
 ██╔════╝██║██╔══██╗██╔═══██╗██║   ██║██║
 █████╗  ██║██████╔╝██║   ██║██║   ██║██║
 ██╔══╝  ██║██╔══██╗██║   ██║██║   ██║██║
 ██║     ██║██████╔╝╚██████╔╝╚██████╔╝██║
 ╚═╝     ╚═╝╚═════╝  ╚═════╝  ╚═════╝ ╚═╝
```

# FiboUI

**Fluent React UI.** Flutter & SwiftUI energy — chainable builders, signals, themes.

Builders **are** React elements. Return them from functions. Skip `.build()`. Prefer the fluent API — no JSX tags.

<br />

[![npm](https://img.shields.io/npm/v/fiboui?style=flat-square&color=ff2d8a)](https://www.npmjs.com/package/fiboui)
[![license](https://img.shields.io/npm/l/fiboui?style=flat-square)](./LICENSE)
[![site](https://img.shields.io/badge/site-fiboui.vercel.app-0a0a0a?style=flat-square)](https://fiboui.vercel.app)
[![store](https://img.shields.io/badge/demo-fiboui--store-c8ff00?style=flat-square&labelColor=0a0a0a)](https://fiboui-store.vercel.app)

**Live**
[`fiboui.vercel.app`](https://fiboui.vercel.app)
·
**Store demo**
[`fiboui-store.vercel.app`](https://fiboui-store.vercel.app)
·
**npm**
[`fiboui`](https://www.npmjs.com/package/fiboui)

```bash
npm install fiboui
```

</div>

---

## Why FiboUI

| | |
| :--- | :--- |
| **Assembly pattern** | Factories return builders for endless chaining |
| **Zero-build children** | Pass builders to `.children()` — they finalize implicitly |
| **Signals** | `signal()`, `computed()`, `.bindSignal()`, `.observer()` |
| **Themes** | `.theme("noir")` · `extendTheme` · Material / Cupertino / Web / Noir |
| **Motion** | `.animate('fadeIn')` · `.onScroll` · `.hoverEffect` · CSS-first |
| **Type-safe** | TypeScript builders · `FiboChild` / `FiboChildren` |

---

## Quick start

```tsx
import 'fiboui/style.css'
import { Button, Column, Text, mount } from 'fiboui'

function App() {
  return Column()
    .gap(12)
    .padding(24)
    .children([
      Text('Hello FiboUI').variant('h1'),
      Button('Ship it').onPress(() => undefined),
    ])
}

mount('#root', App)
```

**Required:** import `'fiboui/style.css'` once — the JS entry does not load CSS.  
ESM-only (`import`, no `require`). Peer deps: **React 18 or 19**.

Next.js App Router: files that **call** builders must be Client Components (`'use client'`).

---

## Taste of the API

### Builders (no `.build()`)

```tsx
import { Card, Text } from 'fiboui'

function Hello() {
  return Card()
    .padding(32)
    .bg('#111')
    .children([Text('Hello').variant('h2')])
}
```

`Button` uses **`.onPress`** (not `onClick`).

### Signals

`.bindSignal(sig)` re-assembles when the signal changes. Read values inside a **function child**:

```tsx
import { Box, Button, Text, signal } from 'fiboui'

const count = signal(0)

Box()
  .bindSignal(count)
  .children(() => [
    Text(`Count: ${count.value}`),
    Button('+').onPress(() => {
      count.value += 1
    }),
  ])
```

### Themes & motion

```tsx
Box()
  .theme('noir')
  .animate('fadeIn')
  .ease('spring')
  .hover((h) => h.effect('sweepToRight'))
```

Responsive:

```tsx
Box().padding(8).md({ padding: 16 }).lg({ padding: 24 })
```

---

## Layout notes

FiboUI **2.x** matches Flutter / SwiftUI: `Column` defaults to `crossAxisAlignment('center')`.  
`Row` uses `align-self: stretch` so `spaceBetween` still fills width.

```tsx
Column().crossAxisAlignment('stretch')
```

`Scaffold` uses `headerBar`, `footerBar`, `sideBarLeft`, `sideBarRight`.

---

## Live demos

| | |
| :--- | :--- |
| **[fiboui.vercel.app](https://fiboui.vercel.app)** | Marketing site — builders, signals, theme, motion, media |
| **[fiboui-store.vercel.app](https://fiboui-store.vercel.app)** | Full retail demo — catalog → bag → checkout |

Both are built **only** with FiboUI fluent builders.

---

## Docs & contributing

- Migration from 1.x → [MIGRATION.md](./MIGRATION.md)
- Contributing & release → [CONTRIBUTING.md](./CONTRIBUTING.md)
- Animation guide → `docs/guide/animation.md`

Publishing is automated on **`main`** (GitHub Actions + `NPM_TOKEN`). Prefer not to `npm publish` locally.

---

<div align="center">

**Wear the return.**

MIT © 2025–2026 FiboUI

[Site](https://fiboui.vercel.app) · [Store](https://fiboui-store.vercel.app) · [npm](https://www.npmjs.com/package/fiboui) · [GitHub](https://github.com/felipeoliveiradev/fiboui)

</div>
