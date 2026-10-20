<div align="center">

<img src="./docs/brand/logo.svg" width="88" alt="FiboUI logo" />

# FiboUI

**Fluent React UI.** Flutter & SwiftUI energy for the web.  
There is no JSX — the function return **is** the view.

<br />

[![npm](https://img.shields.io/npm/v/fiboui?style=for-the-badge&color=ff2d8a&labelColor=0a0a0a)](https://www.npmjs.com/package/fiboui)
[![downloads](https://img.shields.io/npm/dm/fiboui?style=for-the-badge&color=c8ff00&labelColor=0a0a0a)](https://www.npmjs.com/package/fiboui)
[![license](https://img.shields.io/badge/license-MIT-0a0a0a?style=for-the-badge&labelColor=0a0a0a&color=ffffff)](https://github.com/felipeoliveiradev/fiboui)
[![site](https://img.shields.io/badge/site-fiboui.vercel.app-0a0a0a?style=for-the-badge&labelColor=ff2d8a&color=0a0a0a)](https://fiboui.vercel.app)

<br />

<img src="./docs/brand/banner.png" width="960" alt="FiboUI — Fluent React UI. There is no JSX." />

</div>

---

<div align="center">

### Live product

| Marketing site | Store (in-app `/shop`) |
| :---: | :---: |
| [![FiboUI site](./docs/brand/site-hero.png)](https://fiboui.vercel.app) | [![Fibo Store](./docs/brand/store-hero.png)](https://fiboui.vercel.app/shop) |
| [**fiboui.vercel.app**](https://fiboui.vercel.app) | [**fiboui.vercel.app/shop**](https://fiboui.vercel.app/shop) |

Both ships are built **only** with FiboUI fluent builders — no JSX in the product UI. The store is `/shop` (alias `/store`). The playground is [`/play`](https://fiboui.vercel.app/play) (alias `/playground`). Same Vercel app, not extra deployments.

</div>

---

## Cursor / VS Code extension

Fluent trees get Flutter-style **closing labels** (`// Column`, `// List`, `// Form`), **auto-indent** on Enter, **lineage guides** on `.children([…])`, snippets (`fcol`, `frow`, …), chain autocomplete, and the **FiboUI Noir** colour theme.

After marketplace publish (`ext install felipeoliveiradev.fiboui`). VS Code uses the Visual Studio Marketplace; Cursor uses Open VSX. Same VSIX, both stores — see [`extensions/vscode-fiboui/PUBLISH.md`](./extensions/vscode-fiboui/PUBLISH.md).

Local symlink while developing:

```bash
ln -sfn "$(pwd)/extensions/vscode-fiboui" \
  "$HOME/.cursor/extensions/felipeoliveiradev.fiboui-0.1.0"
```

Reload the window, then pick theme **FiboUI Noir**. Details: [`extensions/vscode-fiboui/README.md`](./extensions/vscode-fiboui/README.md).

## Install

```bash
npm install fiboui
```

```tsx
import 'fiboui/style.css' // required once — JS does not load CSS
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

Tree-shakeable entries (each has its own `types`): `fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure`, `fiboui/navigation`, `fiboui/theme`, `fiboui/server`.

```tsx
import { signal } from 'fiboui/core'
import { Column } from 'fiboui/layout'
import { Button } from 'fiboui/interactive'
import { page } from 'fiboui/server'
```

ESM-only · React **18 / 19** · Next App Router: static builders + `page()` work in Server Components (`fiboui/server` / the `react-server` export); signals / Router still need `'use client'`.

---

## JSX vs FiboUI

```tsx
// ── JSX ──────────────────────────────────
<div className="flex flex-col gap-3 p-6">
  <h1>Hello</h1>
  <button onClick={onShip}>Ship it</button>
</div>

// ── FiboUI ───────────────────────────────
Column()
  .gap(12)
  .padding(24)
  .children([
    Text('Hello').variant('h1'),
    Button('Ship it').onPress(onShip),
  ])
```

Same tree. Method calls instead of tags. Layout, theme, motion, and reactivity stay on the builder.

---

## Runtime flow

<img src="./docs/brand/flow-runtime.png" width="960" alt="Factory → fluent chain → children → React element → mount" />

```mermaid
flowchart LR
  A["Column()"] --> B[".gap().padding()"]
  B --> C[".children([...])"]
  C --> D["React element"]
  D --> E["mount / return"]

  style A fill:#141414,stroke:#fff,color:#fff
  style B fill:#141414,stroke:#ff2d8a,color:#ff2d8a
  style C fill:#141414,stroke:#c8ff00,color:#c8ff00
  style D fill:#141414,stroke:#fff,color:#fff
  style E fill:#c8ff00,stroke:#c8ff00,color:#0a0a0a
```

Builders **are** valid React elements (`isValidElement(Button('Go'))`).  
Return them. Nest them. **Skip `.build()`.**

---

## Who owns a signal

**One rule:** each `.value` read has exactly **one** owner. Prefer the leaf node that displays or styles from it — not the page function, not a parent wrapper.

**Decision tree (short):**

1. **Display** a number or string → `Text(\`${n.value} left\`)`.
2. **Format** decimals / money → `Format.fixed(price)` / `Format.euro(price)` (not `n.value.toFixed(2)`).
3. **CSS lengths from a signal** → `Box().width(Unit.px(width))`.
4. **Count + word** → `Text(Plural.of(n, 'task', 'tasks'))`.
5. **Style** from a raw number → `Box().width(n.value)` (or `n.value + 1` on **that** box).
6. **Branch** that changes **shape** → a small `.observer()` around **that branch only**.
7. **List / table rows** → `listSignal` + `List` / `Table` / `Tags`.

### Print helpers (live)

| Helper | Example | Result |
| --- | --- | --- |
| `Format.fixed` | `Format.fixed(price)` | `12.50` |
| `Format.euro` | `Format.euro(price)` | `€ 12.50` |
| `Format.currency` | `Format.currency(price, 'USD')` | `$12.50` |
| `Format.percent` | `Format.percent(rate)` | `12%` |
| `Format.integer` | `Format.integer(n)` | `13` |
| `Format.compact` | `Format.compact(1200)` | `1.2K` |
| `Unit.px` / `rem` / `%` | `Unit.px(width)` | `100px` |
| `Plural.of` | `Plural.of(n, 'task', 'tasks')` | `3 tasks` |

`Transform` is an alias of `Format`.

In **development**, the console warns once with `[fiboui]` for **page roots** and **unsplit** string templates. Optional: `fiboDevStats()` returns `{ produces, replays, pageRoots, warns }` so you can inspect ownership in the console.

### Good patterns

```tsx
// Count in the label — the Text node owns the read
Text(`${left.value} left`)

// Decimals / money / units / plurals — helpers own the print
Text(Format.euro(price))
Box().width(Unit.px(width))
Text(Plural.of(count, 'task', 'tasks'))

// Switch owns checked; only the Live/Idle label observes shape
Row().children([
  Switch().checked(isOnline),
  Box()
    .observer()
    .children(() => [
      isOnline.value ? Text('Live').color('lime') : Text('Idle').color('muted'),
    ]),
])

// listSignal: each row updates by _id without re-running the page
List().items(todos).renderItem((todo) => TodoRow(todo))
```

### Bad patterns

```tsx
// ❌ Bare read in page() — the signal becomes a page root (dev warns; page re-runs)
page(() => {
  if (online.value) return Column().children([/* … */])
  return Column().children([/* … */])
})

// ❌ One observer for the whole sidebar — everything inside re-runs together
Column()
  .observer()
  .children(() => sidebarChildren(online.value, count.value))

// ❌ bare toFixed — use Format.fixed / Format.euro instead
Text(`€ ${n.value.toFixed(2)}`)
```


Prefer a subpath when you only need a slice (smaller types): `fiboui/core`, `fiboui/layout`, `fiboui/structure`, …

Local pack for a sibling app (Turbopack-friendly tarball in-repo):

```bash
npm run pack:local
# → .pack/fiboui-<version>.tgz  (includes JS + split .d.ts)
# in the app (sibling repo):
#   "fiboui": "file:../fiboui/.pack/fiboui-<version>.tgz"
# or an absolute path to that file
```

---

## Signal flow

<img src="./docs/brand/flow-signals.png" width="960" alt="signal → bindSignal → function children → UI" />

```tsx
import { Box, Button, Text, signal } from 'fiboui'

const count = signal(0)

Box()
  .bindSignal(count)
  .children(() => [
    Text(`Count: ${count.value}`),
    Button('+').onPress(() => {
      count.change((n) => n + 1)
    }),
  ])
```

`.bindSignal` re-assembles. Read `.value` inside a **function child** so updates are live. `.value =`, `.set()`, `.change()`, and `.reset()` all notify the same way. `` Text(`Total ${todos.$length}`) `` stays live without a function child. Forms and validation: [Form](docs/components/interactive-form.md).

```mermaid
sequenceDiagram
  participant UI as Builder tree
  participant S as signal(count)
  participant H as onPress

  UI->>S: .bindSignal(count)
  H->>S: count.change(n => n + 1)
  S-->>UI: notify subscribers
  UI->>UI: re-assemble children()
```

---

## Package architecture

<img src="./docs/brand/flow-architecture.png" width="960" alt="App over layout/content/structure/theme/reactivity over core" />

```mermaid
flowchart TB
  APP["your app — screens · domain · mount"]
  subgraph builders["fluent builders"]
    L["layout / content<br/>Column · Row · Text · Button"]
    S["structure / nav<br/>Box · Grid · Scaffold"]
    T["theme / motion<br/>noir · animate · hover"]
    R["reactivity<br/>signal · computed · store"]
  end
  CORE["core — FiboBuilder · styleManager · bindSignal"]

  APP --> L & S & T & R
  L & S & T & R --> CORE

  style APP fill:#141414,stroke:#c8ff00,color:#c8ff00
  style CORE fill:#c8ff00,stroke:#c8ff00,color:#0a0a0a
  style L fill:#141414,stroke:#ff2d8a,color:#ff2d8a
  style S fill:#141414,stroke:#fff,color:#fff
  style T fill:#141414,stroke:#fff,color:#fff
  style R fill:#141414,stroke:#fff,color:#fff
```

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

### Themes & motion

```tsx
Box()
  .theme('noir')
  .animate('fadeIn')
  .ease('spring')
  .hover((h) => h.effect('sweepToRight'))

Box().padding(8).md({ padding: 16 }).lg({ padding: 24 })
```

### Layout notes

FiboUI **2.x** matches Flutter / SwiftUI: `Column` defaults to `crossAxisAlignment('center')`.  
`Row` uses `align-self: stretch` so `spaceBetween` still fills width.

```tsx
Column().crossAxisAlignment('stretch')
```

`Button` uses **`.onPress`** (not `onClick`).

---

## Brand

<div align="center">

<img src="./docs/brand/logo-lockup.svg" width="280" alt="FiboUI lockup" />

<br /><br />

| Token | Hex | |
| :---: | :---: | :--- |
| **Ink** | `#0a0a0a` | background |
| **Chalk** | `#ffffff` | type |
| **Pink** | `#ff2d8a` | energy |
| **Lime** | `#c8ff00` | mark / CTA |

<img src="./docs/brand/fibonacci.svg" width="220" alt="Fibonacci spiral" />

**Tailored to each request** · **Attention to detail**

</div>

---

## Docs & contributing

| | |
| :--- | :--- |
| Getting started | [`docs/guide/getting-started.md`](./docs/guide/getting-started.md) |
| Migration from 1.x | [MIGRATION.md](./MIGRATION.md) |
| Contributing & release | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Animation guide | [`docs/guide/animation.md`](./docs/guide/animation.md) |
| Brand assets | [`docs/brand/`](./docs/brand/) |

Publishing is automated on **`main`** (GitHub Actions + `NPM_TOKEN`). Prefer not to `npm publish` locally.

---

<div align="center">

<img src="./docs/brand/logo-mark.svg" width="48" alt="" />

<br /><br />

**Wear the return.**

MIT © 2025–2026 FiboUI

[Site](https://fiboui.vercel.app) · [Store](https://fiboui.vercel.app/shop) · [Play](https://fiboui.vercel.app/play) · [npm](https://www.npmjs.com/package/fiboui) · [GitHub](https://github.com/felipeoliveiradev/fiboui)

</div>
