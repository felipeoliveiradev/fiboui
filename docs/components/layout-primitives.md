<script setup>
import { Row } from '../../src/layout/Row'
import { Column } from '../../src/layout/Column'
import { Container } from '../../src/layout/Container'
import { Spacer } from '../../src/layout/Spacer'
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderRow = () =>
  Row()
    .mainAxisAlignment('spaceBetween')
    .crossAxisAlignment('center')
    .spacing(16)
    .children([
      Box().padding('16px').backgroundColor('#3B82F6').color('#FFF').children('Item 1'),
      Box().padding('16px').backgroundColor('#10B981').color('#FFF').children('Item 2'),
      Box().padding('16px').backgroundColor('#EF4444').color('#FFF').children('Item 3')
    ])


const renderColumn = () =>
  Column()
    .mainAxisAlignment('start')
    .crossAxisAlignment('stretch')
    .spacing(12)
    .children([
      Box().padding('12px').backgroundColor('#3B82F6').color('#FFF').children('Item 1'),
      Box().padding('12px').backgroundColor('#10B981').color('#FFF').children('Item 2'),
      Box().padding('12px').backgroundColor('#EF4444').color('#FFF').children('Item 3')
    ])


const renderContainer = () => {
  return Container()
    .maxWidth('600px')
    .padding('24px')
    .backgroundColor('#F3F4F6')
    .borderRadius('8px')
    .children(
      Text('This content is centered with max-width constraint.').variant('body')
    )

}

const renderSpacer = () => {
  return Box().display('flex').flexDirection('column').children([
    Box().padding('12px').backgroundColor('#3B82F6').color('#FFF').borderRadius('4px').children('Block 1'),
    Spacer().height('32px'),
    Box().padding('12px').backgroundColor('#10B981').color('#FFF').borderRadius('4px').children('Block 2')
  ])
}
</script>

# Layout Components

Fundamental layout primitives for arranging content.

These components provide Flutter-style layout abstractions for organizing UI elements with consistent spacing and alignment.

## Row

Horizontal flex layout with alignment controls.

<ReactWrapper :component="renderRow" />

::: details View Source
```tsx
Row()
  .mainAxisAlignment('spaceBetween')
  .crossAxisAlignment('center')
  .spacing(16)
  .children([
    Box().padding('16px').backgroundColor('#3B82F6').color('#FFF').children('Item 1'),
    Box().padding('16px').backgroundColor('#10B981').color('#FFF').children('Item 2'),
    Box().padding('16px').backgroundColor('#EF4444').color('#FFF').children('Item 3')
  ])

```
:::

### Constructor

```tsx
Row() → RowBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.mainAxisAlignment(align)` | `'start' \| 'center' \| 'end' \| 'spaceBetween' \| 'spaceAround' \| 'spaceEvenly'` | Horizontal alignment |
| `.crossAxisAlignment(align)` | `'start' \| 'center' \| 'end' \| 'stretch'` | Vertical alignment |
| `.spacing(value)` | `string \| number` | Gap between children |
| `.children(children)` | `ReactNode[]` | Child elements |

---

## Column

Vertical flex layout with alignment controls.

<ReactWrapper :component="renderColumn" />

::: details View Source
```tsx
Column()
  .mainAxisAlignment('start')
  .crossAxisAlignment('stretch')
  .spacing(12)
  .children([
    Box().padding('12px').backgroundColor('#3B82F6').color('#FFF').children('Item 1'),
    Box().padding('12px').backgroundColor('#10B981').color('#FFF').children('Item 2'),
    Box().padding('12px').backgroundColor('#EF4444').color('#FFF').children('Item 3')
  ])

```
:::

### Constructor

```tsx
Column() → ColumnBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.mainAxisAlignment(align)` | `'start' \| 'center' \| 'end' \| 'spaceBetween' \| 'spaceAround' \| 'spaceEvenly'` | Vertical alignment |
| `.crossAxisAlignment(align)` | `'start' \| 'center' \| 'end' \| 'stretch'` | Horizontal alignment |
| `.spacing(value)` | `string \| number` | Gap between children |
| `.size(size)` | `'small' \| 'medium' \| 'large'` | Flex sizing preset |
| `.children(children)` | `ReactNode[]` | Child elements |

---

## Container

Centered container with max-width constraint.

<ReactWrapper :component="renderContainer" />

::: details View Source
```tsx
Container()
  .maxWidth('600px')
  .padding('24px')
  .backgroundColor('#F3F4F6')
  .children(
    Text('This content is centered with max-width constraint.').variant('body')
  )

```
:::

### Constructor

```tsx
Container() → ContainerBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.children(children)` | `ReactNode \| ReactNode[]` | Child elements |

**Note**: Use dynamic CSS properties like `.maxWidth()`, `.padding()`, `.margin()` for styling.

---

## Spacer

Empty space for vertical or horizontal spacing.

<ReactWrapper :component="renderSpacer" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').children([
  Box().padding('12px').backgroundColor('#3B82F6').color('#FFF').children('Block 1'),
  Spacer().height(32),
  Box().padding('12px').backgroundColor('#10B981').color('#FFF').children('Block 2')
])
```
:::

### Constructor

```tsx
Spacer() → SpacerBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.height(value)` | `string \| number` | Vertical spacing |
| `.width(value)` | `string \| number` | Horizontal spacing |
| `.flex(grow?)` | `number \| string` | Grow factor inside a Row or Column (does not turn the spacer into a flex container) |

## Usage Examples

### Responsive Layout

```tsx
Row()
  .mainAxisAlignment('spaceBetween')
  .crossAxisAlignment('start')
  .spacing(16)
  .children([
    Column().size('small').children([...]),
    Column().size('large').children([...])
  ])

```

### Centered Content

```tsx
Container()
  .maxWidth('1200px')
  .padding('40px')
  .children([
    Text('Welcome').variant('h1'),
    Spacer().height(24),
    Text('Description text...').variant('body')
  ])

```

## ZStack

Layered stack — **SwiftUI `ZStack` / `.overlay`**, **Flutter `Stack`**.

Only the **first child** sizes the stack. Later children are overlays clipped
to that box (`position: absolute; inset: 0`). A wide title cannot widen a
300×400 poster.

| FiboUI | SwiftUI | Flutter |
|---|---|---|
| child 0 | primary view | non-positioned child |
| child 1…n | `.overlay(alignment:)` | `Positioned.fill` + `Align` |
| `.fit('content')` | ideal size (default) | `StackFit.loose` |
| `.fit('expand')` | expand in parent | `StackFit.expand` |
| `.alignment(...)` | `Alignment` | `Alignment` |

```tsx
ZStack()
  .alignment(StackAlign.bottom)
  .children([
    Image(url).scaledToFill().frame({ width: 300, height: 400 }),
    Text(title).width('100%').padding(12).bg('rgba(0,0,0,0.7)').color('#fff'),
    Text(stars).frame({
      maxWidth: Size.infinity,
      maxHeight: Size.infinity,
      alignment: StackAlign.topTrailing,
    }),
  ])
```

- `.width('100%')` on the overlay child → full stack width (clamped).
- No width → child hugs (badge) and sits on `.alignment(...)`.
- `.frame({ maxWidth: Size.infinity, alignment: StackAlign.topTrailing })` —
  SwiftUI-style expand + corner align (same `StackAlign` / `Size` tokens).
- `.resetStyle()` on Image/Text is safe — placement lives on the layer host.

| Method | Values | Notes |
|---|---|---|
| `.alignment(a)` | `StackAlign.*` (incl. SwiftUI `topTrailing`, `leading`, …) | Overlay slot flex align |
| `.fit(mode)` | `content` (default) \| `expand` | Hug base vs fill parent |
| `.hug()` | — | Same as `.fit('content')` |

### View chrome (any builder)

SwiftUI-style modifiers (prefer these — **not** raw `.css({ overflow })`):

```ts
// SwiftUI: ZStack size comes from children — frame the BASE, not (only) the stack.
ZStack()
  .alignment(StackAlign.bottom)
  .children([
    Image(url).scaledToFill().frame({ width: 300, height: 400 }),
    Text(title).width('100%').padding(12),
  ])
  .clipShape('8px')
  .contentShape('rectangle') // containers need this (or gesture defaults it)
  .onTapGesture(open)
```

**SwiftUI rules (why “sometimes clickable”):**

1. **Frame** — ZStack does not invent a size. Size = children (FiboUI: base child).
   A fixed `.frame` on the base `Image` is promoted onto the ZStack host so
   outer chrome/gestures always wrap a real box. Optional extra `.frame` on the
   ZStack itself clamps/overrides.
2. **Hit-testing** — `.contentShape` installs a **transparent click film**
   (`inset:0`) above the view so the full frame is tappable (empty pixels included).
   Attaching a gesture defaults `contentShape('rectangle')` if omitted.
3. **clipShape** — visual only; does not define the hit region.

| Method | Notes |
|---|---|
| `.frame({ width, height })` on **base** (or stack) | Layout box for the stack |
| `.clipped()` / `.clipShape(…)` | Visual clip only |
| `.contentShape('rectangle' \| 'circle' \| …)` | Hit-testing region (SwiftUI) |
| `.offset(n \| { x, y })` | Visual translate; layout size unchanged |
| `.fixedSize()` / `{ horizontal, vertical }` | Hug content on axes |
| `.layoutPriority(n)` | Flex-grow weight among siblings |
| `.overlay(child, StackAlign.*)` / `.background(…)` | Absolute layer above / below |
| `.onGeometryChange(fn)` | ResizeObserver rect callback |
| `GeometryReader` | Alias of `LayoutBuilder` — size → builder |

Gestures: `.gesture(TapGesture()…)` , `.simultaneousGesture`, `.highPriorityGesture`,
`.onTapGesture(count?, fn)`, `.onLongPressGesture(…)`.

## See Also

- [Box](/components/structure-box) - Basic layout container
- [Grid](/components/structure-grid) - CSS Grid layout
- [DashboardLayout](/components/layout-dashboard) - Application shell
- [Overlay](/components/layout-overlay) - Two-child back + front helper
