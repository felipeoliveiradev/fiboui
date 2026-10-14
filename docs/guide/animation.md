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

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box()
    .animate('fadeIn')
    .duration(300)
    .ease('spring')
    .children('fadeIn');
}
```

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box()
    .animate({ from: { opacity: 0 }, to: { opacity: 1 }, duration: 400 })
    .children('custom');
}
```

Presets: `fadeIn` / `fadeOut` / `fade`, `slideUp` / `slideDown` / `slideLeft` / `slideRight`, `scaleIn` / `scaleOut` / `scale`, `blurIn` / `blurOut` / `blur`, `pop`, `bounce`.

<ReactWrapper :component="renderPresets" />

Keyframes are compiled once (`FIBO_MOTION_CSS` + `import 'fiboui/style.css'`). `MotionStyles` is injected automatically when you call `.animate()` so SSR/HTML still contains the sheet.

## Hover, press, focus

`.hover().scale()` and `.translateY()` **compose** into one `transform`. `.duration()` replaces the previous transition class (no stacking). The callback form infers `PseudoStateBuilder` (exported) even inside `.map()`.

```ts snippet
import { Box, Card } from 'fiboui';

const items = [{ id: '1', title: 'Card' }];

export default function Example() {
  return Box()
    .hover((h) => h.scale(1.04).translateY(-4))
    .press()
    .focusRing()
    .children(
      items.map((item) =>
        Card().key(item.id).hover((h) => h.scale(1.03)).children(item.title)
      )
    );
}
```

<ReactWrapper :component="renderHover" />

`Button.onHover(fn)` fires on `mouseenter` (see [Button](/components/interactive-button)).

## Spring

`.ease('spring')` / `.spring({ stiffness, damping, mass })` become CSS `linear(...)`. stiffness/damping are no longer ignored.

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box()
    .animate('pop')
    .spring({ stiffness: 220, damping: 24 })
    .hover((h) => h.scale(1.06).ease('spring'))
    .children('spring');
}
```

## Reduced motion

On by default: `@media (prefers-reduced-motion: reduce)` drops animation/transition. Opt out per node with `.reducedMotion('never')`.

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box().animate('fadeIn').reducedMotion('never').children('forced');
}
```

## Stagger

```ts snippet
import { Card, Column } from 'fiboui';

export default function Example() {
  return Column().stagger(80).children([
    Card().key('a').animate('fadeIn').children('A'),
    Card().key('b').animate('fadeIn').children('B'),
  ]);
}
```

<ReactWrapper :component="renderStagger" />

`--fibo-i` is set on each child wrapper; delay is `i * stagger + delay`.

## Scroll family

```ts snippet
import { Box, scrollTo } from 'fiboui';

export default function Example() {
  return Box().smoothScroll().children([
    Box().onScroll('fadeIn').children('reveal'),
    Box().reveal('slideUp').children('once'),
    Box().animate('fadeIn').scrollTimeline('view').children('timeline'),
    Box().scrollProgress(),
    Box().scrollSnap('y').scrollSnapAlign('start').children('snap'),
    Box().sticky(0).children('bar'),
    Box().anchor('pricing').children('pricing'),
    Box().children('go'),
  ]);
}

export function go() {
  scrollTo('#pricing');
}
```

`animation-timeline` is used when the browser supports `view()` / `scroll()`. Otherwise reveal uses IntersectionObserver and progress binds `--fibo-progress` on `scroll` (not rAF).

## Enter / exit & view transitions

```ts snippet
import { Box, Presence, Text, signal, startViewTransition } from 'fiboui';

const open = signal(true);
const page = signal('a');

export default function Example() {
  return Box().viewTransition('hero').children([
    Presence(open).enter('fadeIn').exit('fadeOut').duration(200).children(Text('Panel')),
    Presence(true).exit('fadeOut').children(Text('Static')),
  ]);
}

export function nextPage() {
  startViewTransition(() => {
    page.value = 'b';
  });
}
```

`Presence(signal | boolean)` is a builder (React element, no `.build()`). It stays mounted through the exit keyframe (`animationend`). The component form `Presence({ show, children })` still works. `startViewTransition` no-ops when the API is missing.

## Hooks (typed, opt-in rAF)

```ts snippet
import { Text, usePrefersReducedMotion, useScrollProgress, useSpring, useStagger } from 'fiboui';

export default function Example() {
  const x = useSpring(1, { stiffness: 170, damping: 26 });
  const delays = useStagger(3, 50);
  const reduce = usePrefersReducedMotion();
  const progress = useScrollProgress();
  return Text(`${x >= 0}:${delays.length}:${reduce}:${progress >= 0}`);
}
```

Use these for **numbers you interpolate in JS**. UI enter/hover/scroll should stay on the CSS builder methods.

## Before / after

2.1 stacked transition classes, overwrote hover transforms, ignored spring params, and never fired `Button.onHover`. 2.2:

```ts snippet
import { Box, Button } from 'fiboui';

export default function Example() {
  return Box()
    .animate('fadeIn')
    .duration(400)
    .ease('spring')
    .hover((h) => h.scale(1.05).translateY(-2))
    .onScroll('fadeIn')
    .stagger(80)
    .children(Button('Go').onHover(() => undefined));
}
```
