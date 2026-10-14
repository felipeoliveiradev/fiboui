# Accessibility

FiboUI maps builders onto native HTML. Prefer the native role that already exists; do not replace a `button` with a styled `div`.

## What the components already expose

These behaviors are implemented in source (and covered by unit tests in this repo):

| Builder | Native / ARIA |
| --- | --- |
| `Button` | `<button type="button">` (override with `.props({ type: 'submit' })`) |
| `TextField` / `Textarea` | native input / textarea + label |
| `Checkbox` / `Switch` | single native control; `indeterminate` written to the DOM input |
| `RadioGroup` | `role="radiogroup"` + named radios (`useId` default name) |
| `Select` / `Combobox` | WAI-ARIA listbox + keyboard |
| `Collapse` | `<button aria-expanded>` |
| `Spinner` / `Skeleton` | `role="status"` |
| `Progress` | `role="progressbar"` |
| `Table` | `<th scope="col">` |
| `Label` | `<label htmlFor>` |

```ts snippet
import { Button, Checkbox, Label, Progress, TextField } from 'fiboui';
import { Column } from 'fiboui';

export default function Example() {
  return Column()
    .gap(8)
    .crossAxisAlignment('start')
    .children([
      Label('Name').htmlFor('name').required(),
      TextField('').placeholder('Name').props({ id: 'name' }),
      Checkbox().label('Subscribe').onChange(() => undefined),
      Progress().value(40).max(100),
      Button('Submit').props({ type: 'submit' }).onPress(() => undefined),
    ]);
}
```

## Focus

`.focusRing()` draws a `:focus-visible` outline (`2px solid var(--fibo-primary)` by default). `.focus()` / `.focusVisible()` style the matching pseudo-class. Do not remove focus outlines without a replacement.

## Motion

`prefers-reduced-motion: reduce` disables CSS animation/transition unless `.reducedMotion('never')`. `Presence` skips enter/exit keyframes in that case and unmounts immediately. `usePrefersReducedMotion()` reads the same media query.

## Icons and images

`Image` requires `.alt(...)`. `Icon` with a string source renders `<img alt="icon">`. Prefer a named accessible label on the parent control (`Button('Save')` already has text).

## Routing

`Link` / `NavLink` render anchors. Keep `to` as a real path so the href works without JavaScript.
