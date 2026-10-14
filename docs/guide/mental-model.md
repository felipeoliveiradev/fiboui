# Mental model

FiboUI builders are **already React elements**. The factory stamps React’s `$$typeof` (`react.element` on React 18, `react.transitional.element` on React 19) so `Column()`, `Button()`, and `Text()` are valid `ReactElement`s.

## What you can do

Return a builder from a component, nest builders in `.children()`, put them in arrays with `.key()`, pass them as `ReactNode`, and hand them to `mount()`.

```ts snippet
import { Button, Column, Text } from 'fiboui';

export default function App() {
  return Column().children([
    Text('Hi'),
    Button('Save').onPress(() => undefined),
  ]);
}
```

`.build()` still exists and assembles the host tree. It is **deprecated**. Do not write it at call sites.

## Children

`.children()` accepts `FiboChildren`:

- one `FiboChild` (a React node **or** a builder)
- an array of those
- a factory `() => FiboChild | FiboChild[]` (used with `.observer()` / `.bindSignal()`)

```ts snippet
import { Column, Text } from 'fiboui';

export default function Example() {
  return Column().children([
    Text('A'),
    'plain string',
    null,
    Column().children(Text('Nested')),
  ]);
}
```

`null`, `undefined`, booleans, and strings are normal React children. You do not wrap strings in `Text` unless you want typography variants.

## Lists

Use `.key()` on each builder in a mapped list. After `.key(id)` is called, React reads the key as a string.

```ts snippet
import { Column, Text } from 'fiboui';

const items = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];

export default function Example() {
  return Column().children(
    items.map((item) => Text(item.label).key(item.id))
  );
}
```

## Theme and CSS

`import 'fiboui/style.css'` loads Tailwind layers plus Material / Cupertino / Web CSS variables (`--fibo-primary`, …). `FiboThemeProvider` writes the `fibo-theme-*` class and a subset of those variables onto `document.documentElement`.

`FiboThemeProvider` is a React component. Compose it with `createElement` if you are staying off JSX:

```ts snippet
import { createElement } from 'react';
import { Column, FiboThemeProvider, Text } from 'fiboui';

export default function Example() {
  return createElement(FiboThemeProvider, {
    theme: 'material',
    children: Column().children([Text('Themed').variant('h2')]),
  });
}
```

## What is not a builder

These are React components or functions, not fluent factories: `Router`, `Link`, `NavLink`, `FiboThemeProvider`, `ReactivityRoot`, `Observer`, `Reveal`, `ScrollProgress`, `MotionStyles`. Use `createElement` or (in your app) JSX for those. Builders stay fluent.

`Presence` is **both**: `Presence(open).enter().exit().children()` is a builder; `Presence({ show, children })` is the component form.

`createBuilder` and `FiboBuilder` are **not** package exports. Custom builders are an internal pattern, not a supported public API.
