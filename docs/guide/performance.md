# Performance notes

These are **implementation facts**, not benchmarks.

## CSS first

`.animate()`, `.hover()`, `.stagger()`, and the scroll family compile to classes and CSS variables. Keyframes are **deduped** (`StyleManager.registerKeyframes`, `FIBO_MOTION_CSS`). Prefer that path over `signal().animate()` / `useSpring()`, which use `requestAnimationFrame` for numeric interpolation.

## Fine-grained text

`Text(() => sig.value)` and `bindText(sig)` write `textContent` on the existing node. They do not remount the element. Use them for ticking labels instead of `.observer()` on a large tree.

## Lists

`List` virtualizes when `items.length` is greater than **100** (internal `VIRTUALIZATION_THRESHOLD`). `VirtualColumn` always windows by `itemHeight` / `estimatedItemHeight` and `overscan` (default 5). Always set `.key()` on mapped builders.

```ts snippet
import { Column, Text } from 'fiboui';

const rows = ['A', 'B', 'C'];

export default function Example() {
  return Column().children(rows.map((row) => Text(row).key(row)));
}
```

## Observers

`.bindSignal` / `.observer()` re-assemble the **host** builder. Keep the observed region small. Independent islands belong in their own `ReactivityRoot` (or a `mount()` call).

## Responsive

`.media()` / `.md()` are CSS — no resize listeners. `.responsive()` attaches `resize` and only updates inline style.

## Images and cards

Specialized cards (`AssetCard`, `ProfileCard`, …) still render full DOM for each instance. There is no built-in virtualization on those factories — place them in `VirtualColumn` / `List` if the list is long.
