# Responsive / media queries

2.2 adds **`.media()`** — CSS `@media` compiled through StyleManager. Prefer `.media()` / `.sm()` / `.md()` / `.lg()` / `.xl()` unless you need JavaScript.

## CSS: `.media()` / `.md()`

```ts snippet
import { Box, Text } from 'fiboui';

export default function Example() {
  return Box()
    .padding(8)
    .media('md', { padding: 16 })
    .lg({ padding: 24, maxWidth: 960 })
    .media('(prefers-color-scheme: dark)', { backgroundColor: '#111', color: '#eee' })
    .children(Text('Resize the viewport'));
}
```

Named keys match Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280 (`FIBO_BREAKPOINTS`).

```ts snippet
import { Box, FIBO_BREAKPOINTS } from 'fiboui';

export default function Example() {
  return Box().md({ width: FIBO_BREAKPOINTS.md }).children('md width token');
}
```

`toMediaQuery('md')` returns `(min-width: 768px)`. Raw queries pass through.

## JS: `.responsive()`

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box()
    .responsive({
      mobile: { padding: '8px' },
      tablet: { padding: '16px' },
      desktop: { padding: '24px' },
    })
    .children('JS viewport');
}
```

Uses `window.innerWidth` + `resize` (`ResponsiveWrapper`). Tiers: mobile `<768`, tablet `768–1023`, desktop `≥1024`. SSR snapshot is **desktop (1024)** via `useViewportWidth`. Only merges **inline `style`** on the host — it cannot swap `className` or children.

## Grid columns

```ts snippet
import { Grid, Box } from 'fiboui';

export default function Example() {
  return Grid()
    .columns({ sm: 1, md: 2, lg: 3 })
    .gap('md')
    .children([
      Box().key('a').children('A'),
      Box().key('b').children('B'),
    ]);
}
```

`.md:columns(2)` is not valid JavaScript. Use `Grid().columns({ md: 2 })` or `.className('md:grid-cols-2')`.

## When to use which

| Need | Use |
| --- | --- |
| Padding / color / width by breakpoint | `.md({ padding: 16 })` |
| Dark mode / any CSS query | `.media('(prefers-color-scheme: dark)', { … })` |
| Grid column count | `Grid().columns({ md: 2, lg: 3 })` |
| Tailwind utilities | `.className('md:grid-cols-2')` |
| JS-driven style object | `.responsive({ mobile, tablet, desktop })` |
