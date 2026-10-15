# Theming System

FiboUI themes follow a **Flutter Theme / SwiftUI Environment** model: tokens live as CSS custom properties (`--fibo-*`) that inherit down the tree. Text and buttons read those vars — no product `className` for colors.

## Fluent `.theme()` (preferred)

```tsx
import { Column, Text, Button } from 'fiboui';

Column()
  .theme('noir') // or 'web' | 'material' | 'cupertino' | a FiboTheme object
  .children([
    Text('Hello').type('h1'),
    Button('Go').variant('filled'),
  ]);
```

SSR-safe: the node gets `fibo-theme-{name}` **and** inline CSS vars on first paint (no `useEffect` / no FOUC).

### Extend a preset

```tsx
import { Column, extendTheme, noirTheme } from 'fiboui';

Column().theme(
  extendTheme(noirTheme, {
    colors: { primary: '#FFE08A' },
    typography: { body: { fontSize: '15px' } },
  }),
);
```

## Theme Provider

Same tokens, app-wide wrapper (also SSR-safe — class + inline vars, no `documentElement` paint):

```tsx
import { FiboThemeProvider } from 'fiboui';

<FiboThemeProvider theme="noir">
  <App />
</FiboThemeProvider>
```

`theme` accepts a preset name or a full `FiboTheme` / `extendTheme(...)` result. Call `useFiboTheme().setTheme('web')` to switch at runtime.

## Available presets

| Name | Role |
|------|------|
| `web` | Clean light SaaS (default provider) |
| `material` | Material Design tokens |
| `cupertino` | iOS / HIG tokens |
| `noir` | Obsidian editorial dark (dense apps / marketing) |

Import objects: `webTheme`, `materialTheme`, `cupertinoTheme`, `noirTheme`.

## How components consume the theme

| Component | Mechanism |
|-----------|-----------|
| `Text` | `var(--fibo-text-{variant}-size\|weight\|…)` with safe fallbacks |
| `Button` filled / elevated / solid | `var(--fibo-primary)` / `on-primary` / `surface` |
| `Button` ghost / text / outline / soft | `var(--fibo-on-surface)` / `outline` / primary mix |

Ship `import 'fiboui/style.css'` once — preset sheets (including `noir`) live under `@layer fibo.theme`.

## Helpers

```ts
import {
  resolveTheme,
  extendTheme,
  themeToCssVars,
  themeClassName,
} from 'fiboui';
```

See also [SSR / hydration](./ssr.md).
