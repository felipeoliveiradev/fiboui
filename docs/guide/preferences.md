# PreferenceKey

SwiftUI-style child → ancestor value propagation.

```ts
import { PreferenceKey, Column, Box, Text } from 'fiboui'

const MaxWidthKey = PreferenceKey({
  defaultValue: 0,
  reduce: (a, b) => Math.max(a, b),
})

Column()
  .onPreferenceChange(MaxWidthKey, (w) => console.log('max child width', w))
  .children(
    Box().preference(MaxWidthKey, 80).children(Text('a')),
    Box().preference(MaxWidthKey, 140).children(Text('b')),
  )
```

## Rules

1. `.onPreferenceChange(key, fn)` installs the bus and calls `fn` whenever descendants contribute.
2. `.preference(key, value)` contributes to the nearest reader ancestor.
3. `reduce` merges multiple contributions (default: last write wins).
4. Same node can chain both: `Box().preference(K, 1).onPreferenceChange(K, fn)`.

## Related chrome

| API | Role |
|---|---|
| `alignmentGuide(guide, compute)` | Shift so a named guide sits at `compute` (also sets `--fibo-align-{guide}`) |
| `matchedGeometryEffect(id, { namespace, isSource })` | Shared `view-transition-name` + measured rect |
| `containerRelativeFrame({ axis, count, span })` | Size as `span/count` of nearest sized ancestor |
| `GeometryReader` → `proxy.safeAreaInsets` | Probe-resolved `env(safe-area-inset-*)` |
