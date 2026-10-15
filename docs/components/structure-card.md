<script setup>
import { Card } from '../../src/structure/Card'
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderBasic = () =>
  Card()
    .text('REVENUE')
    .number('$12,345')
    .subtitle('+12% from last month')


const renderColored = () =>
  Box().display('flex').gap('16px').flexWrap('wrap').children([
    Card().text('USERS').number('1,234').color('blue'),
    Card().text('SALES').number('$5,678').color('green'),
    Card().text('ALERTS').number('23').color('red')
  ])

const renderCustom = () =>
  Card()
    .text('CUSTOM CARD')
    .children([
      Text('You can add custom content inside cards.').variant('body').color('#6B7280')
    ])

</script>

# Card

A container component for displaying metrics, statistics, or grouped content with optional colored accent.

`Card` provides a pre-styled container with consistent spacing, elevation, and optional left border accent. It's commonly used for dashboards, metrics, and information displays.

## Live Examples

### Basic Card

<ReactWrapper :component="renderBasic" />

::: details View Source
```tsx
Card()
  .text('REVENUE')
  .number('$12,345')
  .subtitle('+12% from last month')

```
:::

### Colored Accents

<ReactWrapper :component="renderColored" />

::: details View Source
```tsx
Box().display('flex').gap('16px').flexWrap('wrap').children([
  Card().text('USERS').number('1,234').color('blue'),
  Card().text('SALES').number('$5,678').color('green'),
  Card().text('ALERTS').number('23').color('red')
])
```
:::

### Custom Content

<ReactWrapper :component="renderCustom" />

::: details View Source
```tsx
Card()
  .text('CUSTOM CARD')
  .children([
    Text('You can add custom content inside cards.')
      .variant('body')
      .color('#6B7280')

  ])

```
:::

## Constructor

```tsx
Card() → CardBuilder
```

Creates a new `Card` builder instance.

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Sets the card header/title text |
| `.number(number)` | `string` | Sets the large number/metric display |
| `.subtitle(text)` | `string` | Sets the subtitle/description text |
| `.children(children)` | `ReactNode \| ReactNode[]` | Adds custom content to the card |

### Appearance

| Method | Type | Description |
| :--- | :--- | :--- |
| `.color(color)` | `'green' \| 'orange' \| 'red' \| 'blue' \| 'purple'` | Adds a colored left border accent |

### Inherited from FiboBuilder

`Card` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete builder API reference.

## Usage Examples

### Metric Card

```tsx
Card()
  .text('TOTAL REVENUE')
  .number('$45,231')
  .subtitle('+20.1% from last month')
  .color('green')

```

### Status Card

```tsx
Card()
  .text('SYSTEM STATUS')
  .number('99.9%')
  .subtitle('Uptime this month')
  .color('blue')

```

## See Also

- [Box](/components/structure-box) - Basic layout container
- [Grid](/components/structure-grid) - Grid layout
- [Text](/components/content-text) - Typography
