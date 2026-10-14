# Architecture

FiboUI is a React library, not a separate runtime. Builders assemble host elements (`div`, `button`, `h1`, …) and optional wrappers (`ReactivityRoot`, `Reveal`, `ScrollProgress`).

## Rendering

1. **Factory** — `Box()` constructs an internal builder and stamps React element fields.
2. **Chain** — methods mutate that instance and return `this` (proxied).
3. **Render** — React sees a valid element. The assemble function (also exposed as deprecated `.build()`) produces the host tree.

```ts snippet
import { Box, Text } from 'fiboui';

export default function Example() {
  return Box().padding(8).children(Text('Host div'));
}
```

## Public surface

Named exports are listed in `src/index.ts` and generated in the [API reference](/api/). These are **not** exported:

- `FiboBuilder`, `createBuilder`, `_styleManager`
- Gesture recognizers and Stakent demo helpers
- Most `fiboui/navigation` extras (they exist on the **subpath**, not always on the root)

Custom `createBuilder` subclasses are an internal pattern. Apps should compose public factories.

## Entry points

| Import | Use |
| --- | --- |
| `fiboui` | Full public API |
| `fiboui/core` `fiboui/layout` `…` | Subpath bundles (same types file) |
| `fiboui/style.css` | Required stylesheet |
| `mount` / `FiboApp` | Client bootstrap |
| `Fibo` / `toElement` | Convert a `FiboChild` if you already have a React parent |

## Related

- [Mental model](./mental-model.md)
- [SSR](./ssr.md)
- [Shared methods](/api/shared-methods)
