<script setup>
import { Badge } from '../../src/content/Badge'
import { Box } from '../../src/structure/Box'

const renderVariants = () =>
  Box().display('flex').gap('8px').flexWrap('wrap').children([
    Badge().text('Neutral').variant('neutral'),
    Badge().text('Accent').variant('accent'),
    Badge().text('Glass').variant('glass'),
    Badge().text('Solid').variant('solid'),
    Badge().text('Dot').variant('dot').intent('success')
  ])

const renderIntents = () =>
  Box().display('flex').gap('8px').flexWrap('wrap').children([
    Badge().text('Info').intent('info'),
    Badge().text('Success').intent('success'),
    Badge().text('Warning').intent('warning'),
    Badge().text('Error').intent('error')
  ])

const renderShapes = () =>
  Box().display('flex').gap('8px').alignItems('center').children([
    Badge().text('Rounded').shape('rounded'),
    Badge().text('Pill').shape('pill')
  ])
</script>

# Badge

Small labels for status, categories, or metadata display.

`Badge` provides flexible styling options for displaying tags, status indicators, and categorical information with various visual treatments.

## Live Examples

### Variants

<ReactWrapper :component="renderVariants" />

::: details View Source
```tsx
Box().display('flex').gap('8px').flexWrap('wrap').children([
  Badge().text('Neutral').variant('neutral'),
  Badge().text('Accent').variant('accent'),
  Badge().text('Glass').variant('glass'),
  Badge().text('Solid').variant('solid'),
  Badge().text('Dot').variant('dot').intent('success')
])
```
:::

### Intent Colors

<ReactWrapper :component="renderIntents" />

::: details View Source
```tsx
Box().display('flex').gap('8px').flexWrap('wrap').children([
  Badge().text('Info').intent('info'),
  Badge().text('Success').intent('success'),
  Badge().text('Warning').intent('warning'),
  Badge().text('Error').intent('error')
])
```
:::

### Shapes

<ReactWrapper :component="renderShapes" />

::: details View Source
```tsx
Box().display('flex').gap('8px').alignItems('center').children([
  Badge().text('Rounded').shape('rounded'),
  Badge().text('Pill').shape('pill')
])
```
:::

## Constructor

```tsx
Badge() → BadgeBuilder
```

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Badge text content |
| `.icon(icon)` | `ReactNode` | Optional leading icon |

### Appearance

| Method | Type | Description |
| :--- | :--- | :--- |
| `.variant(variant)` | `'neutral' \| 'accent' \| 'outline' \| 'glass' \| 'solid' \| 'dot'` | Visual style variant |
| `.intent(intent)` | `'none' \| 'success' \| 'warning' \| 'error' \| 'info'` | Semantic color intent |
| `.shape(shape)` | `'pill' \| 'rounded'` | Border radius style |

### Inherited from FiboBuilder

`Badge` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## Usage Examples

### Status Badge

```tsx
Badge()
  .text('Active')
  .variant('solid')
  .intent('success')
  .shape('pill')

```

### With Icon

```tsx
Badge()
  .text('12')
  .icon(<HeartIcon />)
  .variant('glass')

```

## See Also

- [Alert](/components/content-alert) - Alert messages
- [Avatar](/components/content-avatar) - User avatars
- [Text](/components/content-text) - Typography
