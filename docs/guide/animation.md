<script setup>
import { Box } from '../../src/structure/Box'
import { Button } from '../../src/interactive/Button'
import { Column } from '../../src/layout/Column'
import { Text } from '../../src/content/Text'

const renderPresets = () =>
  Box().flex().gap(12).flexWrap('wrap').children(
    ['fadeIn', 'slideUp', 'scaleIn', 'blurIn', 'pop'].map((name) =>
      Box()
        .key(name)
        .animate(name)
        .padding('12px 16px')
        .backgroundColor('#EDE7F6')
        .borderRadius('10px')
        .children(name)
    )
  )

const renderHover = () =>
  Box()
    .padding('20px 28px')
    .backgroundColor('#6750A4')
    .color('#fff')
    .borderRadius('14px')
    .hover((h) => {
      h.scale(1.04).translateY(-4)
    })
    .press()
    .children('Hover + press')

const renderStagger = () =>
  Column()
    .stagger(90)
    .gap(8)
    .children(
      ['One', 'Two', 'Three'].map((label) =>
        Box()
          .key(label)
          .animate('slideUp')
          .padding('10px 14px')
          .backgroundColor('#F3EDF7')
          .borderRadius('8px')
          .children(label)
      )
    )
</script>

# Animation & scroll

FiboUI 2.2 extends the **existing builder API**. There is no `fiboui/motion` package. The default path is **CSS** (keyframes, `linear()` springs, `prefers-reduced-motion`). `requestAnimationFrame` is only used if you opt into `signal().animate()` / `useSpring()` for numeric values.

## Presets

```tsx
Box().animate('fadeIn').duration(300).ease('spring')
Box().animate('slideUp', { from: 24, delay: 80 })
Box().animate({ from: { opacity: 0 }, to: { opacity: 1 }, duration: 400 })
```

Presets: `fadeIn` / `fadeOut` / `fade`, `slideUp` / `slideDown` / `slideLeft` / `slideRight`, `scaleIn` / `scaleOut` / `scale`, `blurIn` / `blurOut` / `blur`, `pop`, `bounce`.

<ReactWrapper :component="renderPresets" />

Keyframes are compiled once (`FIBO_MOTION_CSS` + `import 'fiboui/style.css'`). `MotionStyles` is injected automatically when you call `.animate()` so SSR/HTML still contains the sheet.

## Hover, press, focus

`.hover().scale()` and `.translateY()` **compose** into one `transform`. `.duration()` replaces the previous transition class (no stacking).

```tsx
Box()
  .hover((h) => h.scale(1.04).translateY(-4))
  .press()
  .focusRing()
```

<ReactWrapper :component="renderHover" />

`Button.onHover(fn)` fires on `mouseenter` (see [Button](/components/interactive-button)).

## Spring

`.ease('spring')` / `.spring({ stiffness, damping, mass })` become CSS `linear(...)`. stiffness/damping are no longer ignored.

```tsx
Box().animate('pop').spring({ stiffness: 220, damping: 24 })
Box().hover((h) => h.scale(1.06).ease('spring'))
```

## Reduced motion

On by default: `@media (prefers-reduced-motion: reduce)` drops animation/transition. Opt out per node with `.reducedMotion('never')`.

```tsx
Box().animate('fadeIn').reducedMotion('never')
```

## Stagger

```tsx
Column().stagger(80).children([
  Card().animate('fadeIn'),
  Card().animate('fadeIn'),
])
```

<ReactWrapper :component="renderStagger" />

`--fibo-i` is set on each child wrapper; delay is `i * stagger + delay`.

## Scroll family

```tsx
Box().onScroll('fadeIn')          // IntersectionObserver + class
Box().reveal('slideUp')           // same, default once
Box().animate('fadeIn').scrollTimeline('view')  // animation-timeline: view(); IO fallback
Box().scrollProgress()            // scaleX along scroll(); scroll-listener fallback
Box().smoothScroll()
Box().scrollSnap('y').scrollSnapAlign('start')
Box().sticky(0)
Box().anchor('pricing')
scrollTo('#pricing')
```

`animation-timeline` is used when the browser supports `view()` / `scroll()`. Otherwise reveal uses IntersectionObserver and progress binds `--fibo-progress` on `scroll` (not rAF).

## Enter / exit & view transitions

```ts
import { Presence, signal, startViewTransition } from 'fiboui';

const open = signal(true);

Presence(open).enter('fadeIn').exit('fadeOut').duration(200).children(panel)
Presence(true).exit('fadeOut').children(panel)

Box().viewTransition('hero')
startViewTransition(() => { page.value = next })
```

`Presence(signal | boolean)` is a builder (React element, no `.build()`). It stays mounted through the exit keyframe (`animationend`). The component form `Presence({ show, children })` still works. `startViewTransition` no-ops when the API is missing.

## Hooks (typed, opt-in rAF)

```tsx
import { useSpring, useTransition, useStagger, useScrollProgress, usePrefersReducedMotion } from 'fiboui';

const x = useSpring(target, { stiffness: 170, damping: 26 });
const delays = useStagger(items.length, 50);
```

Use these for **numbers you interpolate in JS**. UI enter/hover/scroll should stay on the CSS builder methods.

## Before / after

```tsx
// before (2.1) — fragmented, buggy
Box().duration(200).duration(400)              // stacked two transition classes
Box().hover((h) => h.scale(1.05).translateY(-2)) // second transform won
Box().animation({ curve: 'easeIn' })           // invalid CSS "easeIn"
signal(0).spring(1)                            // damping/stiffness ignored
Button('Go').onHover(fn)                       // never fired
Box().className('animate-pulse')               // Tailwind only

// after (2.2)
Box().animate('fadeIn').duration(400).ease('spring')
Box().hover((h) => h.scale(1.05).translateY(-2))
Box().onScroll('fadeIn').stagger(80)
Button('Go').onHover(fn)
```
