# Scroll

The scroll helpers live on the same builders as `.md()` / `.animate()`. Import `scrollTo` for anchors.

## Reveal

```tsx
Card().onScroll('fadeIn')
Card().reveal({ preset: 'slideUp', once: true, rootMargin: '0px 0px -10% 0px' })
```

IntersectionObserver toggles `.fibo-inview`. No rAF.

## Scroll-driven CSS

```tsx
Box().animate('fadeIn').scrollTimeline('view')
Box().scrollProgress() // page progress bar
```

Uses `animation-timeline: view()` / `scroll()`. Fallback: reveal IO, or a `scroll` listener that sets `--fibo-progress`.

## Snap, smooth, sticky, anchors

```tsx
Column().smoothScroll().scrollSnap('y').children([
  Box().scrollSnapAlign('start').anchor('one').children('1'),
  Box().scrollSnapAlign('start').anchor('two').children('2'),
])

Box().sticky(0)
scrollTo('#two')
```

Pair with [Animation](./animation.md) for enter presets and reduced motion.
