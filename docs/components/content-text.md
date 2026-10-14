<script setup>
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderVariants = () =>
  Box().flex().col().gap(4).children([
    Text('Heading 1').variant('h1'),
    Text('Heading 2').variant('h2'),
    Text('Heading 3').variant('h3'),
    Text('Body Text').variant('body'),
    Text('Caption Text').variant('caption')
  ])

const renderColors = () =>
  Box().flex().col().gap(2).children([
    Text('Default Color'),
    Text('Primary Color').color('blue-600'),
    Text('Success Color').color('green-600'),
    Text('Error Color').color('red-600'),
    Text('Muted Color').color('gray-500')
  ])

const renderWeights = () =>
  Box().flex().col().gap(2).children([
    Text('Light Weight').fontWeight('300'),
    Text('Normal Weight').fontWeight('400'),
    Text('Medium Weight').fontWeight('500'),
    Text('Semibold Weight').fontWeight('600'),
    Text('Bold Weight').fontWeight('700')
  ])
</script>

# Text

A typography component with predefined variants and flexible styling.

`Text` provides a semantic way to render text content with consistent typography across your application. It supports heading variants, body text, and captions with full control over color, weight, and alignment.

## Live Examples

### Typography Variants

<ReactWrapper :component="renderVariants" />

::: details View Source
```tsx
Box().flex().col().gap(4).children([
  Text('Heading 1').variant('h1'),
  Text('Heading 2').variant('h2'),
  Text('Heading 3').variant('h3'),
  Text('Body Text').variant('body'),
  Text('Caption Text').variant('caption')
])
```
:::

### Colors

<ReactWrapper :component="renderColors" />

::: details View Source
```tsx
Box().flex().col().gap(2).children([
  Text('Default Color'),
  Text('Primary Color').color('blue-600'),
  Text('Success Color').color('green-600'),
  Text('Error Color').color('red-600'),
  Text('Muted Color').color('gray-500')
])
```
:::

### Font Weights

<ReactWrapper :component="renderWeights" />

::: details View Source
```tsx
Box().flex().col().gap(2).children([
  Text('Light Weight').fontWeight('300'),
  Text('Normal Weight').fontWeight('400'),
  Text('Medium Weight').fontWeight('500'),
  Text('Semibold Weight').fontWeight('600'),
  Text('Bold Weight').fontWeight('700')
])
```
:::

## Constructor

```tsx
Text(content?: string) → TextBuilder
```

Creates a new `Text` builder instance.

**Parameters:**
- `content` (optional): The text content to display

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.content(text)` | `string` | Sets the text content |
| `.variant(variant)` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'body' \| 'caption'` | Sets typography variant |

### Styling

| Method | Type | Description |
| :--- | :--- | :--- |
| `.color(color)` | `string` | Sets text color (Tailwind or CSS) |
| `.fontSize(size)` | `string \| number` | Sets font size |
| `.fontWeight(weight)` | `string \| number` | Sets font weight |
| `.textAlign(align)` | `'left' \| 'center' \| 'right' \| 'justify'` | Sets text alignment |
| `.lineHeight(height)` | `string \| number` | Sets line height |
| `.letterSpacing(spacing)` | `string` | Sets letter spacing |

### Text Decoration

| Method | Type | Description |
| :--- | :--- | :--- |
| `.underline()` | `-` | Adds underline decoration |
| `.italic()` | `-` | Makes text italic |
| `.truncate()` | `-` | Truncates text with ellipsis |

### Inherited from FiboBuilder

`Text` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## Typography Scale

The predefined variants map to the following styles:

| Variant | Element | Font Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| `h1` | `<h1>` | 2.5rem | 700 | 1.2 |
| `h2` | `<h2>` | 2rem | 600 | 1.3 |
| `h3` | `<h3>` | 1.5rem | 600 | 1.4 |
| `h4` | `<h4>` | 1.25rem | 500 | 1.4 |
| `body` | `<p>` | 1rem | 400 | 1.6 |
| `caption` | `<span>` | 0.875rem | 400 | 1.5 |

## Usage Examples

### Responsive Typography

```tsx
Text('Responsive Heading')
  .variant('h2')
  .fontSize('1.5rem')
  .md({ fontSize: '2rem' })
  .lg({ fontSize: '2.5rem' })
```

### Styled Body Text

```tsx
Text('Important information')
  .variant('body')
  .color('gray-700')
  .fontWeight('500')
  .lineHeight('1.8')

```

### Truncated Text

```tsx
Text('This is a very long text that will be truncated...')
  .truncate()
  .maxW('200px')

```

## See Also

- [Box](/components/structure-box) - Layout container
- [Button](/components/interactive-button) - Interactive button
- [Label](/components/content-all) - Form label
