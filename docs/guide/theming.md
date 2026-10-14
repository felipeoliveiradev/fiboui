# Theming

Three token packs ship in `fiboui/style.css`: **Material** (default), **Cupertino**, and **Web**. `FiboThemeProvider` applies `fibo-theme-{name}` on `document.documentElement` and writes a subset of CSS variables.

## Provider

```ts snippet
import { createElement } from 'react';
import { Column, FiboThemeProvider, Text } from 'fiboui';

export default function Example() {
  return createElement(FiboThemeProvider, {
    theme: 'material',
    children: Column().gap(8).children([
      Text('Material').variant('h2'),
      Text('Primary uses --fibo-primary'),
    ]),
  });
}
```

`theme` defaults to `'material'`. `useFiboTheme()` returns `{ theme, themeName, setTheme }` and **throws** outside the provider.

```ts snippet
import { createElement } from 'react';
import { Button, FiboThemeProvider, useFiboTheme } from 'fiboui';

function Toggle() {
  const { themeName, setTheme } = useFiboTheme();
  return Button(themeName).onPress(() =>
    setTheme(themeName === 'material' ? 'web' : 'material')
  );
}

export default function Example() {
  return createElement(FiboThemeProvider, { children: createElement(Toggle) });
}
```

## CSS variables (Material 3 defaults)

Set in `.fibo-theme-material` (and `:root` via the stylesheet). Values from `src/styles/base.css` / `materialTheme`:

| Variable | Material default |
| --- | --- |
| `--fibo-primary` | `#6750A4` |
| `--fibo-on-primary` | `#FFFFFF` |
| `--fibo-primary-container` | `#EADDFF` |
| `--fibo-secondary` | `#625B71` |
| `--fibo-error` | `#B3261E` |
| `--fibo-background` | `#FFFBFE` |
| `--fibo-surface` | `#FFFBFE` |
| `--fibo-on-background` / `--fibo-on-surface` | `#1C1B1F` |
| `--fibo-font-family` | Roboto stack |
| `--fibo-spacing-xs` … `xl` | 4 / 8 / 16 / 24 / 32px |

Cupertino uses `--fibo-primary: #007AFF`. Web uses its own pack in `src/styles/themes/web.css`.

`FiboThemeProvider` currently writes: `--fibo-primary`, `--fibo-secondary`, `--fibo-background`, `--fibo-surface`, `--fibo-error`, `--fibo-font-family`.

Override on `:root` or `.fibo-theme-material` if you need different hexes (2.0 unified tokens away from the old blues).

## JS theme objects

`materialTheme`, `cupertinoTheme`, and `webTheme` implement `FiboTheme` (`name`, `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `fontFamily`). Use them for reading tokens in JS — the painted UI still goes through CSS variables.

## Per-builder override

```ts snippet
import { Box, Text } from 'fiboui';

export default function Example() {
  return Box()
    .theme({ colors: { primary: '#4F378B' } })
    .bg('primary')
    .padding(12)
    .children(Text('Local primary').color('#fff'));
}
```

`.bg('primary')` resolves to `var(--fibo-primary)`.
