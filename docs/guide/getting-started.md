
# Getting Started

FiboUI is a React UI framework inspired by the **Builder Pattern** found in Flutter and SwiftUI. It allows you to construct complex UIs using chainable methods instead of nested JSX props.

## Installation

```bash
npm install fiboui
```

Import the stylesheet once — the JS entry does not load CSS:

```tsx
import 'fiboui/style.css';
```

ESM-only (`import`, no `require`). Next.js App Router: static builders + `page()` work in Server Components (no `'use client'`) via the `react-server` export. Reactive APIs (`.observer()`, signals, Router) still need a Client Component. See [SSR / hydration](./ssr.md). Builders are React elements — **do not call `.build()`**. There is no `Chip()` or `IconButton()` factory (`Badge`, `Button().icon(...)`). `Form` is exported from `fiboui` and `fiboui/interactive`. Nested routes use `<Outlet />`: [Routing](./routing.md). Breakpoints: [Responsive](./responsive.md). Motion: [Animation](./animation.md) / [Scroll](./scroll.md).

## Quick Start

Apply a theme fluently (or wrap with `FiboThemeProvider`). See [Theming](./theming.md).

```tsx
import 'fiboui/style.css';
import { Box, Text, Button } from 'fiboui';

function App() {
  return Box()
    .theme('web')
    .p(4)
    .children([
      Text('Hello World').variant('h1'),
      Button('Click Me').onPress(() => alert('Hi!')),
    ]);
}
```

## Why Builder Pattern?

React's declarative JSX is powerful, but heavily nested structures can become hard to read.
FiboUI offers a fluent API:

**Standard React:**
```tsx
<div className="p-4 bg-gray-100">
    <h1 className="text-xl font-bold">Title</h1>
</div>
```

**FiboUI Builder:**
```tsx
Box().p(4).bg('#f3f4f6').children([
    Text("Title").variant("h1").weight("bold")
])
```
