# Gestures cookbook

SwiftUI-style gestures on every FiboUI builder (`.gesture`, sugar methods).

## Enums (prefer these)

```ts
import {
  ContentShape,
  ClipShape,
  EdgeSet,
  CoordinateSpace,
  DragAxis,
  GestureMaskEnum,
  ExclusiveGesture,
  SequenceGesture,
  SimultaneousGesture,
  TapGesture,
  LongPressGesture,
  DragGesture,
} from 'fiboui'
```

| Enum / const | Values |
|---|---|
| `ContentShape` | `rectangle`, `circle`, `rounded`, `square` |
| `ClipShape` | `circle`, `rounded`, `square`, `rectangle` |
| `EdgeSet` | `top`, `bottom`, `leading`, `trailing`, `horizontal`, `vertical`, `all` |
| `DragAxis` | `free`, `horizontal`, `vertical` |
| `GestureMaskEnum` | `all`, `gesture`, `subviews`, `none` |
| `CoordinateSpace` | `local`, `global`, `named('foo')` |

## Basics

```ts
Box()
  .frame({ width: 200, height: 120 })
  .contentShape(ContentShape.rectangle)
  .onTapGesture(() => console.log('tap'))

ZStack()
  .onTapGesture(2, () => console.log('double'))
  .onLongPressGesture({ minimumDuration: 400, perform: () => console.log('hold') })
```

## Composition

```ts
// Both fire
.simultaneousGesture(TapGesture().onEnd(a))
.gesture(LongPressGesture().onEnd(b))

// First to recognize wins (arena)
.gesture(ExclusiveGesture(
  LongPressGesture({ duration: 500 }).onEnd(long),
  TapGesture().onEnd(tap),
))

// Second only after first succeeds
.gesture(SequenceGesture(
  TapGesture().onEnd(() => {}),
  DragGesture().onEnd((e) => console.log(e.predictedEndTranslation)),
))
```

## GestureMask

```ts
TapGesture().including(GestureMaskEnum.none)      // skip this gesture
TapGesture().including(GestureMaskEnum.subviews)  // same — only children
TapGesture().including(GestureMaskEnum.gesture)   // this gesture; block children hits
TapGesture().including(GestureMaskEnum.all)       // default
```

## Drag

```ts
DragGesture({ minimumDistance: 10, axis: DragAxis.horizontal })
  .onUpdate((e) => { /* e.translation, e.velocity, e.predictedEndTranslation */ })
```

## Hit film

Containers only hit drawn pixels unless you set `.contentShape`. First `.gesture` / `.onTapGesture` auto-adds `ContentShape.rectangle`. For circles:

```ts
Image(url)
  .frame({ width: 96, height: 96 })
  .clipShape(ClipShape.circle)
  .contentShape(ContentShape.circle) // clip-path hit-test
  .onTapGesture(open)
```
