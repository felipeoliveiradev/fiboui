# Motion

FiboUI 2.2 compiles motion to **plain CSS** (`transition`, `@keyframes`, custom properties, `linear()` springs). There is no per-frame JavaScript. The only JS in the default path is an optional `IntersectionObserver` that toggles a class for scroll reveal.

Import helpers from the tree-shakeable subpath, or chain methods on any builder:

```tsx
import { Box, Button, Column, Text } from 'fiboui';
import { MotionStyles, springEase, startViewTransition } from 'fiboui/motion';

function Page() {
  return Column().children([
    MotionStyles(),
    Box()
      .animate('fadeIn')
      .duration(300)
      .ease('spring')
      .hover((s) => s.scale(1.03))
      .press()
      .children([Text('Card')]),
  ]);
}
```

## Before / after

```tsx
// before — Framer Motion (JS driver + rAF)
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', duration: 0.3 }}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
/>

// after — FiboUI (CSS only)
Box()
  .animate('slideUp')
  .duration(300)
  .ease('spring')
  .hover((s) => s.scale(1.03))
  .press()
```

```tsx
// before — raw CSS / Tailwind
<div className="animate-[fadeIn_300ms_ease] hover:scale-[1.03] transition-transform">

// after
Box().animate('fadeIn').duration(300).hover((s) => s.scale(1.03))
```

```tsx
// SwiftUI / Flutter inspiration
// SwiftUI:  view.animation(.spring, value: x).transition(.opacity)
// Flutter:  AnimatedOpacity(duration: 300ms, opacity: 1, child: ...)
Box().animate('fadeIn').duration(300).ease('spring')
Box().transition({ opacity: 200, transform: '0.3s spring' })
```

## Presets

Enter: `fadeIn` (`fade`), `slideUp` / `slideDown` / `slideLeft` / `slideRight`, `scaleIn` (`scale`), `blurIn` (`blur`), `pop`, `bounce`.

Exit: `fadeOut`, `scaleOut`, `blurOut`, or wrap with `Presence`:

```tsx
import { Presence } from 'fiboui/motion';

<Presence show={open} exit="fadeOut">
  {Box().animate('scaleIn').children([Text('Dialog')])}
</Presence>
```

Custom keyframes (hashed and injected once):

```tsx
Box().animate({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'none' },
}).duration(240)
```

## Transition map

```tsx
Box().transition({ opacity: 200, transform: '0.3s spring' })
```

Numbers are milliseconds. Strings accept a trailing ease (`spring` → CSS `linear()`).

## Hover, press, stagger

```tsx
Column()
  .stagger(60)
  .children(
    items.map((item) =>
      Box()
        .key(item.id)
        .animate('fadeIn')
        .hover((s) => s.scale(1.03))
        .press()
        .children([Text(item.title)])
    )
  )
```

`.stagger(ms)` sets `--fibo-stagger` on the parent and `--fibo-i` on each child (`display: contents` wrapper). Child animations pick up `calc(var(--fibo-i) * var(--fibo-stagger))`.

`.press()` is `:active` + `scale(0.97)` and a CSS transform transition.

## Scroll reveal

```tsx
Box().reveal('fadeUp').children([Text('Appears on scroll')])
Box().reveal({ preset: 'blur', once: true, rootMargin: '0px 0px -10% 0px' })
```

`IntersectionObserver` adds `.fibo-inview`. The fade/slide/scale/blur is a CSS transition.

## View Transitions

```tsx
Box().viewTransition('hero')

startViewTransition(() => setPage('detail'))
```

Sets `view-transition-name`. `startViewTransition` uses the browser API when present and otherwise runs the update immediately.

## Reduced motion

By default every generated rule is wrapped in `prefers-reduced-motion: reduce` (animations and transitions disabled). Opt out per node:

```tsx
Box().animate('pop').reducedMotion('never')
```

## SSR / Next.js

`#fibo-motion` is emitted next to any motion-using builder, so `renderToString` includes `@keyframes`. You can also place the sheet once in a layout:

```tsx
import { MotionStyles } from 'fiboui/motion';

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <MotionStyles />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Client hydration injects the same CSS into `document.head` if the tag is missing. Rules are deduplicated by id.

## Tree-shaking

```ts
import { springEase, getMotionCss, Presence } from 'fiboui/motion';
```

`dist/motion.js` does not pull `Button`, `Router`, or the rest of the kit. Builder methods live on `fiboui` because factories already import the compiler (a few KB of CSS strings).

## What this is not

Signal `.animate()` / `useSpring()` in `src/core/animations.ts` still use `requestAnimationFrame` for **value** interpolation. CSS motion does not call those APIs. Do not mix them if you want a CSS-only path.
