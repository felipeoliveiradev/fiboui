# Responsive / media queries

FiboUI already had **`.responsive()`** (JS viewport). 2.2 adds **`.media()`** — the easy path — which compiles to real CSS `@media`. Prefer `.media()` / `.md()` unless you need JS.

## Easy: `.media()` / `.md()` (CSS)

```tsx
Box()
  .padding(8)
  .media('md', { padding: 16 })
  .lg({ padding: 24, maxWidth: 960 })
  .media('(prefers-color-scheme: dark)', { backgroundColor: '#111', color: '#eee' })
```

Named keys match Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280 (`FIBO_BREAKPOINTS`).

```tsx
import { FIBO_BREAKPOINTS } from 'fiboui';

Box().md({ width: FIBO_BREAKPOINTS.md })
```

## Already there: `.responsive()` (JS)

```tsx
Box().responsive({
  mobile: { padding: '8px' },
  tablet: { padding: '16px' },
  desktop: { padding: '24px' },
})
```

This uses `window.innerWidth` + `resize` (`ResponsiveWrapper`). Tiers: mobile `<768`, tablet `768–1023`, desktop `≥1024`. SSR snapshot is **desktop (1024)**. Only merges **inline `style`** on the host — it cannot swap `className` or children.

## Grid columns

```tsx
// real API (Tailwind classes)
Grid().columns({ sm: 1, md: 2, lg: 3 }).gap('md')

// not valid JS — do not write .md:columns(2)
```

## When to use which

| Need | Use |
|------|-----|
| Padding / color / width by breakpoint | `.md({ padding: 16 })` |
| Dark mode / any CSS query | `.media('(prefers-color-scheme: dark)', { … })` |
| Grid column count | `Grid().columns({ md: 2, lg: 3 })` |
| Tailwind utilities you already know | `.className('md:grid-cols-2')` |
| JS-driven style object (legacy) | `.responsive({ mobile, tablet, desktop })` |
