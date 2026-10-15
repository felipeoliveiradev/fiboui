<script setup>
import { Grid, GridItem } from '../../src/structure/Grid'
import { Box } from '../../src/structure/Box'

const renderBasic = () =>
  Grid()
    .columns(3)
    .gap(4)
    .children([
      Box().bg('red-100').h(20).flex().alignItems('center').justifyContent('center').children('1'),
      Box().bg('green-100').h(20).flex().alignItems('center').justifyContent('center').children('2'),
      Box().bg('blue-100').h(20).flex().alignItems('center').justifyContent('center').children('3'),
      Box().bg('yellow-100').h(20).flex().alignItems('center').justifyContent('center').children('4'),
      Box().bg('purple-100').h(20).flex().alignItems('center').justifyContent('center').children('5'),
      Box().bg('pink-100').h(20).flex().alignItems('center').justifyContent('center').children('6')
    ])


const renderSpanning = () =>
  Grid()
    .columns(4)
    .gap(4)
    .children([
      GridItem().colSpan(2).children(
        Box().bg('blue-200').h(20).flex().alignItems('center').justifyContent('center').children('Span 2')
      ),
      Box().bg('green-100').h(20).flex().alignItems('center').justifyContent('center').children('1'),
      Box().bg('green-100').h(20).flex().alignItems('center').justifyContent('center').children('2'),
      GridItem().colSpan(4).children(
        Box().bg('purple-200').h(20).flex().alignItems('center').justifyContent('center').children('Full Width')
      )
    ])

</script>

# Grid

A CSS Grid layout container with builder-based configuration.

`Grid` provides a powerful two-dimensional layout system. It automatically arranges children into columns and supports advanced features like column spanning via `GridItem`.

## Live Examples

### Basic Grid

<ReactWrapper :component="renderBasic" />

::: details View Source
```tsx
Grid()
  .columns(3)
  .gap(4)
  .children([
    Box().bg('red-100').h(20).children('1'),
    Box().bg('green-100').h(20).children('2'),
    Box().bg('blue-100').h(20).children('3'),
    Box().bg('yellow-100').h(20).children('4'),
    Box().bg('purple-100').h(20).children('5'),
    Box().bg('pink-100').h(20).children('6')
  ])

```
:::

### Column Spanning

<ReactWrapper :component="renderSpanning" />

::: details View Source
```tsx
Grid()
  .columns(4)
  .gap(4)
  .children([
    GridItem().colSpan(2).children(
      Box().bg('blue-200').h(20).children('Span 2')
    ),
    Box().bg('green-100').h(20).children('1'),
    Box().bg('green-100').h(20).children('2'),
    GridItem().colSpan(4).children(
      Box().bg('purple-200').h(20).children('Full Width')
    )
  ])

```
:::

## Constructor

```tsx
Grid() → GridBuilder
```

Creates a new `Grid` builder instance.

## Properties

### Layout

| Method | Type | Description |
| :--- | :--- | :--- |
| `.columns(count)` | `number` | Sets number of grid columns |
| `.rows(count)` | `number` | Sets number of grid rows |
| `.gap(value)` | `string \| number` | Sets gap between grid items |
| `.columnGap(value)` | `string \| number` | Sets horizontal gap only |
| `.rowGap(value)` | `string \| number` | Sets vertical gap only |

### Alignment

| Method | Type | Description |
| :--- | :--- | :--- |
| `.alignItems(alignment)` | `'start' \| 'center' \| 'end' \| 'stretch'` | Aligns items vertically |
| `.justifyItems(justify)` | `'start' \| 'center' \| 'end' \| 'stretch'` | Aligns items horizontally |

### Advanced

| Method | Type | Description |
| :--- | :--- | :--- |
| `.templateColumns(template)` | `string` | Custom grid-template-columns |
| `.templateRows(template)` | `string` | Custom grid-template-rows |
| `.autoFlow(flow)` | `'row' \| 'column' \| 'dense'` | Sets grid-auto-flow |

### Inherited from FiboBuilder

`Grid` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## GridItem

`GridItem` is a wrapper component for controlling individual grid cell behavior.

### Constructor

```tsx
GridItem() → GridItemBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.colSpan(span)` | `number` | Number of columns to span |
| `.rowSpan(span)` | `number` | Number of rows to span |
| `.colStart(start)` | `number` | Starting column position |
| `.colEnd(end)` | `number` | Ending column position |
| `.rowStart(start)` | `number` | Starting row position |
| `.rowEnd(end)` | `number` | Ending row position |

## Usage Examples

### Responsive Grid

```tsx
Grid()
  .columns({ sm: 1, md: 2, lg: 3 })
  .gap(4)
  .children(items)
```

### Custom Template

```tsx
Grid()
  .templateColumns('200px 1fr 1fr')
  .gap(4)
  .children([...])

```

## See Also

- [Box](/components/structure-box) - Basic layout container
- [DashboardLayout](/components/layout-dashboard) - Application shell
