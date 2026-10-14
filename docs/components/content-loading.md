<script setup>
import { Progress } from '../../src/content/Progress'
import { Spinner } from '../../src/content/Spinner'
import { Box } from '../../src/structure/Box'

const renderProgress = () =>
  Box().display('flex').flexDirection('column').gap('24px').children([
    Progress().value(65).max(100),
    Progress().value(45).variant('striped'),
    Progress().value(75).variant('segments'),
    Progress().value(50).variant('circular')
  ])

const renderSpinners = () =>
  Box().display('flex').gap('24px').alignItems('center').children([
    Spinner().size('sm'),
    Spinner().size('md'),
    Spinner().size('lg').variant('dots'),
    Spinner().size('lg').variant('pulse')
  ])
</script>

# Progress & Spinner

Loading and progress indicators.

## Progress

Visual progress indicators with multiple variants.

<ReactWrapper :component="renderProgress" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').gap('24px').children([
  Progress().value(65).max(100),
  Progress().value(45).variant('striped'),
  Progress().value(75).variant('segments'),
  Progress().value(50).variant('circular')
])
```
:::

### Constructor

```tsx
Progress() → ProgressBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(current)` | `number` | Current progress value |
| `.max(total)` | `number` | Maximum value (default: 100) |
| `.variant(variant)` | `'default' \| 'striped' \| 'labeled' \| 'circular' \| 'segments' \| 'steps' \| 'timeline' \| 'pagination'` | Visual style |
| `.color(hex)` | `string` | Progress bar color |
| `.height(value)` | `number \| string` | Bar height |
| `.label(text)` | `string` | Optional label text |
| `.items(list)` | `Array<{title, description, date}>` | For timeline variant |

---

## Spinner

Animated loading indicators.

<ReactWrapper :component="renderSpinners" />

::: details View Source
```tsx
Box().display('flex').gap('24px').alignItems('center').children([
  Spinner().size('sm'),
  Spinner().size('md'),
  Spinner().size('lg').variant('dots'),
  Spinner().size('lg').variant('pulse')
])
```
:::

### Constructor

```tsx
Spinner() → SpinnerBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.size(size)` | `'sm' \| 'md' \| 'lg' \| 'xl' \| number` | Spinner size |
| `.variant(variant)` | `'circle' \| 'dots' \| 'pulse' \| 'blocks'` | Animation style |
| `.color(color)` | `string` | Spinner color |

## Usage Examples

### Timeline Progress

```tsx
Progress()
  .value(50)
  .variant('timeline')
  .items([
    { title: 'Order placed', date: 'Done' },
    { title: 'Processing', date: 'In Progress' },
    { title: 'Shipped', date: 'Pending' }
  ])

```

### Loading State

```tsx
Box().display('flex').alignItems('center').gap('12px').children([
  Spinner().size('sm').color('#3B82F6'),
  Text('Loading...').variant('body')
])
```

## See Also

- [Skeleton](/components/content-all) - Content placeholders
- [Alert](/components/content-alert) - Status messages
- [Badge](/components/content-badge) - Status badges
