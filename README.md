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

<img src="./docs/brand/banner.svg" width="960" alt="FiboUI — Fluent React UI. There is no JSX." />

</div>

---

<div align="center">

### Live product

| Marketing site | Store demo |
| :---: | :---: |
| [![FiboUI site](./docs/brand/site-hero.png)](https://fiboui.vercel.app) | [![Fibo Store](./docs/brand/store-hero.png)](https://fiboui-store.vercel.app) |
| [**fiboui.vercel.app**](https://fiboui.vercel.app) | [**fiboui-store.vercel.app**](https://fiboui-store.vercel.app) |

Both ships are built **only** with FiboUI fluent builders — no JSX in the product UI.

</div>

---

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

ESM-only · React **18 / 19** · Next App Router → `'use client'` on files that call builders.

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

<img src="./docs/brand/flow-runtime.svg" width="960" alt="Factory → fluent chain → children → React element → mount" />

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

## Signal flow

<img src="./docs/brand/flow-signals.svg" width="960" alt="signal → bindSignal → function children → UI" />

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

`.bindSignal` re-assembles. Read `.value` inside a **function child** so updates are live.

```mermaid
sequenceDiagram
  participant UI as Builder tree
  participant S as signal(count)
  participant H as onPress

  UI->>S: .bindSignal(count)
  H->>S: count.value += 1
  S-->>UI: notify subscribers
  UI->>UI: re-assemble children()
```

---

## Package architecture

<img src="./docs/brand/flow-architecture.svg" width="960" alt="App over layout/content/structure/theme/reactivity over core" />

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

[Site](https://fiboui.vercel.app) · [Store](https://fiboui-store.vercel.app) · [npm](https://www.npmjs.com/package/fiboui) · [GitHub](https://github.com/felipeoliveiradev/fiboui)

</div>
