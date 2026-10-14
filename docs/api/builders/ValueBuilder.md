# ValueBuilder

Render a signal-driven tree with optional loading and error slots.

- **Factory:** `ValueBuilder<T>(signal: { value: T; subscribe(listener: (val: T) => void): () => void })`
- **Source:** `src/core/builder.ts`
- **Renders as:** React element (no `.build()`)

## Example

```tsx snippet
import { Text, ValueBuilder, signal } from 'fiboui';

export default function Example() {
  const n = signal(0);
  ValueBuilder(n).children((value: number) => Text(String(value)));
  return Text(() => String(n.value));
}
```

## Component methods

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `loading` | `loading(component: ReactNode \| (() => ReactNode)): this` | — | — |
| `error` | `error(component: (error: Error \| unknown) => ReactNode): this` | — | — |
| `builder` | `builder(fn: (value: T) => ReactNode): this` | — | — |
| `children` | `children(fn: (value: T) => ReactNode): this` | — | — |
| `build` | `build(): ReactElement` | — | — |


