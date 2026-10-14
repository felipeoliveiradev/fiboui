# FiboApp

Factory that returns `FiboAppBuilder` for plugin registration and `#id` mounting.

- **Factory:** `FiboApp()`
- **Source:** `src/core/FiboApp.ts`
- **Renders as:** React element (no `.build()`)

## Example

```tsx snippet
import { Column, Text } from 'fiboui';

export default function Example() {
  return Column().children([Text('Root')]);
}
```

## Component methods

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `use` | `use(plugin: FiboPlugin): this` | — | — |
| `plugins` | `plugins(pluginsList: FiboPlugin[]): this` | — | — |
| `root` | `root(component: React.ComponentType): this` | — | — |
| `mount` | `mount(elementId: string): void` | — | — |


