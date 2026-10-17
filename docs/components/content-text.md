<script setup>
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderVariants = () =>
  Box().flex().flexDirection('column').gap(4).children([
    Text('Heading 1').variant('h1'),
    Text('Heading 2').variant('h2'),
    Text('Heading 3').variant('h3'),
    Text('Body Text').variant('body'),
    Text('Caption Text').variant('caption')
  ])

const renderColors = () =>
  Box().flex().flexDirection('column').gap(2).children([
    Text('Default Color'),
    Text('Primary Color').color('#2563EB'),
    Text('Success Color').color('#16A34A'),
    Text('Error Color').color('#DC2626'),
    Text('Muted Color').color('#6B7280')
  ])

const renderWeights = () =>
  Box().flex().flexDirection('column').gap(2).children([
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
Box().flex().flexDirection('column').gap(4).children([
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
Box().flex().flexDirection('column').gap(2).children([
  Text('Default Color'),
  Text('Primary Color').color('#2563EB'),
  Text('Success Color').color('#16A34A'),
  Text('Error Color').color('#DC2626'),
  Text('Muted Color').color('#6B7280')
])
```
:::

### Font Weights

<ReactWrapper :component="renderWeights" />

::: details View Source
```tsx
Box().flex().flexDirection('column').gap(2).children([
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
- `content` (optional): The text to display

A plain `` `Count: ${count.value}` `` is frozen at construction. `` `Total: ${todos.$length}` `` stays live: `$length` embeds a marker and the host subscribes only to the signals inside that string. The same markers stay live on Label, Alert, ListTile title/subtitle, `Button('…')`, Banner, Card (`.text` / `.subtitle` / `.number` and string children), Combobox / Select / RadioGroup / Progress labels, Table headers, Tags, `List().empty(...)` strings, and field labels / helper / error (`TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`).

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Sets the text content |
| `.variant(variant)` / `.type(variant)` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body' \| 'caption' \| 'label'` | Typography variant / host tag. Same write. |
| `.bindSignal(signal)` | `Signal` | Re-render when that signal changes. Only signals you pass are subscribed. |
| `.bindSignal(signal, format)` | `(value) => string` | Replaces the text with `format(signal.value)` |

### Styling

| Method | Type | Description |
| :--- | :--- | :--- |
| `.color(color)` | `string` | CSS color (`#2563EB`, `rgb(…)`, `currentColor`) or a Fibo semantic token (`primary`, `on-surface`, `error`) |
| `.fontSize(size)` | `string \| number` | Sets font size |
| `.fontWeight(weight)` | `string \| number` | Sets font weight |
| `.textAlign(align)` | `'left' \| 'center' \| 'right' \| 'justify'` | Sets text alignment |
| `.lineHeight(height)` | `string \| number` | Sets line height |
| `.letterSpacing(spacing)` | `string` | Sets letter spacing |

### Text Decoration

| Method | Type | Description |
| :--- | :--- | :--- |
| `.nowrap()` | `-` | `whitespace-nowrap` |
| `.mono()` | `-` | `font-mono` |
| `.muted()` | `-` | Muted color (`#9a9a9a`) |
| `.textDecoration('underline')` | CSS proxy | Underline |
| `.fontStyle('italic')` | CSS proxy | Italic |

### Inherited from FiboBuilder

`Text` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## Typography Scale

The predefined variants map to the following styles:

| Variant | Element | Font Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| `h1` | `<h1>` | `--fibo-text-h1-size` (2.25rem) | 700 | 1.2 |
| `h2` | `<h2>` | `--fibo-text-h2-size` (1.875rem) | 700 | 1.25 |
| `h3` | `<h3>` | `--fibo-text-h3-size` (1.5rem) | 600 | 1.3 |
| `h4` | `<h4>` | `--fibo-text-h4-size` (1.25rem) | 600 | 1.35 |
| `h5` | `<h5>` | `--fibo-text-h5-size` (1.125rem) | 600 | 1.4 |
| `h6` | `<h6>` | `--fibo-text-h6-size` (1rem) | 600 | 1.45 |
| `body` | `<p>` | `--fibo-text-body-size` (1rem) | 400 | 1.5 |
| `caption` | `<span>` | `--fibo-text-caption-size` (0.875rem) | 400 | 1.4 |
| `label` | `<label>` | `--fibo-text-label-size` (0.875rem) | 500 | 1.4 |

Fallbacks live in `TEXT_VARIANT_STYLE`. A mounted `.theme()` overrides the vars.

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
  .color('#374151')
  .fontWeight('500')
  .lineHeight('1.8')

```

### Truncated Text

```tsx
Text('This is a very long text that will be truncated...')
  .nowrap()
  .overflow('hidden')
  .textOverflow('ellipsis')
  .maxWidth('200px')

```

## See Also

- [Box](/components/structure-box) - Layout container
- [Button](/components/interactive-button) - Interactive button
- [Label](/components/content-all) - Form label
