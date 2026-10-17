<script setup>
import { Grid, GridItem } from '../../src/structure/Grid'
import { Box } from '../../src/structure/Box'

const renderBasic = () =>
  Grid()
    .columns(3)
    .gap(4)
    .children([
      Box().bg('#FEE2E2').height(80).flex().alignItems('center').justifyContent('center').children('1'),
      Box().bg('#DCFCE7').height(80).flex().alignItems('center').justifyContent('center').children('2'),
      Box().bg('#DBEAFE').height(80).flex().alignItems('center').justifyContent('center').children('3'),
      Box().bg('#FEF9C3').height(80).flex().alignItems('center').justifyContent('center').children('4'),
      Box().bg('#F3E8FF').height(80).flex().alignItems('center').justifyContent('center').children('5'),
      Box().bg('#FCE7F3').height(80).flex().alignItems('center').justifyContent('center').children('6')
    ])


const renderSpanning = () =>
  Grid()
    .columns(4)
    .gap(4)
    .children([
      GridItem().colSpan(2).children(
        Box().bg('#BFDBFE').height(80).flex().alignItems('center').justifyContent('center').children('Span 2')
      ),
      Box().bg('#DCFCE7').height(80).flex().alignItems('center').justifyContent('center').children('1'),
      Box().bg('#DCFCE7').height(80).flex().alignItems('center').justifyContent('center').children('2'),
      GridItem().colSpan(4).children(
        Box().bg('#E9D5FF').height(80).flex().alignItems('center').justifyContent('center').children('Full Width')
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
    Box().bg('#FEE2E2').height(80).children('1'),
    Box().bg('#DCFCE7').height(80).children('2'),
    Box().bg('#DBEAFE').height(80).children('3'),
    Box().bg('#FEF9C3').height(80).children('4'),
    Box().bg('#F3E8FF').height(80).children('5'),
    Box().bg('#FCE7F3').height(80).children('6')
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
      Box().bg('#BFDBFE').height(80).children('Span 2')
    ),
    Box().bg('#DCFCE7').height(80).children('1'),
    Box().bg('#DCFCE7').height(80).children('2'),
    GridItem().colSpan(4).children(
      Box().bg('#E9D5FF').height(80).children('Full Width')
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
| `.columns(count)` | `number` | `grid-template-columns: repeat(n, minmax(0, 1fr))` |
| `.rows(count)` | `number` | `grid-template-rows: repeat(n, minmax(0, auto))` |
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
| `.templateColumns(template)` | `string` | `style.gridTemplateColumns` — overrides numeric `.columns()` |
| `.templateRows(template)` | `string` | `style.gridTemplateRows` — overrides numeric `.rows()` |
| `.autoFlow(flow)` | `'row' \| 'column' \| 'dense'` | `style.gridAutoFlow` (`dense` → `dense`) |

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
| `.colSpan(span)` | `number` | Inline `gridColumn: span N` |
| `.rowSpan(span)` | `number` | Inline `gridRow: span N` |
| `.colStart(start)` | `number` | `style.gridColumnStart` |
| `.colEnd(end)` | `number` | `style.gridColumnEnd` |
| `.rowStart(start)` | `number` | `style.gridRowStart` |
| `.rowEnd(end)` | `number` | `style.gridRowEnd` |

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
