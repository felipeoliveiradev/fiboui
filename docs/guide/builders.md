# Builders, children, and styling

Every layout, content, interactive, and structure factory returns a **styleable builder** (internal `FiboBuilder` + a CSS-property proxy). The class itself is not exported.

## Factory

```ts snippet
import { Box, Button, Text } from 'fiboui';

export default function Example() {
  return Box()
    .padding(16)
    .children([
      Text('Label').variant('label'),
      Button('OK').variant('solid').onPress(() => undefined),
    ]);
}
```

`Button` and `Text` take an optional first argument (string or `() => string`). Most layout factories take no arguments.

## Children (`FiboChild`)

```ts
type FiboChild = ReactNode | Buildable;
type FiboChildren = FiboChild | FiboChild[] | (() => FiboChild | FiboChild[]);
```

`Buildable` is `{ build(): ReactElement }` — kept so 2.0 trees still type-check. You do not call `build()`.

```ts snippet
import { Column, Text } from 'fiboui';

export default function Example() {
  return Column()
    .gap(8)
    .children(() => [Text('Lazy A'), Text('Lazy B')]);
}
```

The factory form re-runs when the builder is an `.observer()` / `.bindSignal()` host.

## Styling methods

Common explicit methods (all return `this`):

| Method | Role |
| --- | --- |
| `.className` / `.classNames` | Tailwind or custom classes |
| `.css` / `.style` | Registered CSS vs inline style merge |
| `.bg` / `.text` / `.color` | Color; semantic names map to `var(--fibo-*)` |
| `.p` `.px` `.py` `.m` `.mx` `.my` | Spacing (number → `px`) |
| `.width` `.height` `.gap` `.flex` | Size |
| `.rounded` / `.circle` / `.square` | Shape |
| `.shadow` | Preset or config object |
| `.opacity` | 0–1 |
| `.hug` | Skip default `w-full` / `self-stretch` on Row/Column |
| `.clean` | Strip default form-control chrome |

Any `CSSProperties` camelCase name is also a method: `.backgroundColor('#fff')`, `.maxWidth(960)`, `.flexWrap('wrap')`.

```ts snippet
import { Box, Text } from 'fiboui';

export default function Example() {
  return Box()
    .bg('primary')
    .color('#fff')
    .padding(16)
    .rounded(12)
    .maxWidth(320)
    .children(Text('Token background'));
}
```

## Identity and lists

```ts snippet
import { Box, Text } from 'fiboui';

export default function Example() {
  return Box()
    .id('panel')
    .anchor('panel')
    .key('panel')
    .children(Text('Anchored'));
}
```

`.anchor(id)` sets the DOM `id` and `scroll-margin-top: var(--fibo-sticky-offset)`. Override with `.scrollMargin(80)`.

## Pseudo-state

`.hover()`, `.focus()`, `.active()`, `.focusVisible()` return a `PseudoStateBuilder` **or** take a callback (the callback overload is last so `h` is typed inside `.map()`).

```ts snippet
import { Card, Text } from 'fiboui';

const items = [{ id: '1', title: 'One' }];

export default function Example() {
  return Card()
    .hover((h) => {
      h.scale(1.03).translateY(-2);
    })
    .press()
    .focusRing()
    .children(
      items.map((item) => Text(item.title).key(item.id).hover((h) => h.opacity(0.8)))
    );
}
```

`.press()` defaults to `active` scale `0.97`. `.focusRing()` defaults to `var(--fibo-primary)`.

Full method table: [Shared builder methods](/api/shared-methods).
