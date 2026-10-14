
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

ESM-only (`import`, no `require`). Next.js App Router files that call builders need `'use client'`. See [MIGRATION.md](../../MIGRATION.md) for 2.0 changes.

## Quick Start

Wrap your application in the `FiboThemeProvider` and start building.

```tsx
import 'fiboui/style.css';
import { FiboThemeProvider, Box, Text, Button } from 'fiboui';

function App() {
  return (
    <FiboThemeProvider>
      {
        Box().p(4).children([
            Text("Hello World").variant("h1").build(),
            Button("Click Me").onPress(() => alert("Hi!")).build()
        ]).build()
      }
    </FiboThemeProvider>
  );
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
```ts
Section().children([
  Text('Title').h1(),
  Code('npm install fiboui').inline(),
])
```

See [Semantic builders](/components/semantic) for `Nav`, `Main`, `Footer`, `Anchor`, `Code`, and `Svg`.
