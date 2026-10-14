# Scroll

Scroll helpers live on the same builders as `.md()` / `.animate()`. Import `scrollTo` for programmatic anchors.

## Reveal

```ts snippet
import { Card } from 'fiboui';

export default function Example() {
  return Card()
    .onScroll('fadeIn')
    .reveal({ preset: 'slideUp', once: true, rootMargin: '0px 0px -10% 0px' })
    .children('In view');
}
```

IntersectionObserver toggles `.fibo-inview`. No rAF. `.onScroll(preset)` is an alias of `.reveal()` (default preset `fadeIn` vs `fadeUp`).

## Scroll-driven CSS

```ts snippet
import { Box } from 'fiboui';

export default function Example() {
  return Box().children([
    Box().animate('fadeIn').scrollTimeline('view').children('view timeline'),
    Box().scrollProgress(),
  ]);
}
```

Uses `animation-timeline: view()` / `scroll()` when `supportsViewTimeline()` / `supportsScrollTimeline()` are true. Fallback: reveal IO, or a `scroll` listener that sets `--fibo-progress`.

## Snap, smooth, sticky, anchors

```ts snippet
import { Box, Column, Header, Text, scrollTo } from 'fiboui';

export default function Example() {
  return Column().smoothScroll().scrollSnap('y').children([
    Header().sticky().children(Text('Bar')),
    Box().scrollSnapAlign('start').anchor('one').children('1'),
    Box().scrollSnapAlign('start').anchor('two').scrollMargin(80).children('2'),
  ]);
}

export function jump() {
  scrollTo('#two');
}
```

`.sticky()` / `Header().sticky()` set `--fibo-sticky-offset` on `:root` (default **64px** when top is `0`). `html` uses `scroll-padding-top`, and `.anchor()` applies `scroll-margin-top`.

`scrollTo(target, { behavior?, block? })` accepts a selector or `Element`.
