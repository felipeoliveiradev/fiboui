
# Architecture: The Builder Pattern

At the core of FiboUI is the `FiboBuilder` class. Every component in the system is constructed via a builder that extends this base class.

## How it works

1. **Instantiation**: Calling `Box()` creates a new instance of `BoxBuilder`.
2. **Chaining**: Methods like `.padding(4)` or `.color('red')` update the internal state of the builder and return `this`, allowing method chaining.
3. **Rendering**: The builder **is** a React element (it carries React’s `$$typeof`). Return it, nest it, or pass it as a child — **do not call `.build()`**. `.build()` still exists on the class (custom builders implement it) and is deprecated for app code. There is no `Chip()` or `IconButton()` factory — use `Badge()` and `Button().icon(...)`.

## FiboBuilder Base Class

The base class provides common properties shared by all UI elements:

- `className(string)`: append CSS classes.
- `style(object)`: inline styles.
- `key(string)`: React key.
- `onPress(callback)`: click handler.
- `resetStyle()`: clears builder classes, inline `_style` / `_cssStyles`, and box longhands, then adds `fibo-reset`. Helpers chained after it stamp again.

`Circle()` / `Rect()` / `Path()` use a CSS-like proxy on `ShapeBuilder`: unknown methods merge into `_style` via `normalizeCssValue`. SVG `shadow(dx, dy, blur, color)` stays a 4-arg drop-shadow.

## Creating your own Builder

`FiboBuilder` and `createBuilder` are **not** public exports (`fiboui` / `fiboui/core` ship `ValueBuilder`, not the base class). Compose the public factories:

```tsx
import { Box, Text } from 'fiboui';

export function TitleCard(title: string) {
  return Box()
    .padding(16)
    .children([Text(title).type('h2')]);
}
```
