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

## See Also

- [Box](/components/structure-box) - Basic layout container
- [Grid](/components/structure-grid) - CSS Grid layout
- [DashboardLayout](/components/layout-dashboard) - Application shell
