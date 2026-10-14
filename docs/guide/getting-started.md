
# Getting Started

FiboUI is a React UI framework inspired by the **Builder Pattern** found in Flutter and SwiftUI. It allows you to construct complex UIs using chainable methods instead of nested JSX props.

## Installation

```bash
npm install fiboui
```

## Quick Start

Wrap your application in the `FiboThemeProvider` and start building.

```tsx
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
```tsx
Box().p(4).bg("gray-100").children([
    Text("Title").variant("h1").weight("bold").build()
]).build()
```
