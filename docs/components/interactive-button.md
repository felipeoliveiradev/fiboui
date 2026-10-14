<script setup>
import { Box } from '../../src/structure/Box'
import { Button } from '../../src/interactive/Button'

const renderVariants = () =>
  Box().flex().gap(4).flexWrap('wrap').children([
    Button('Primary').variant('primary'),
    Button('Secondary').variant('secondary'),
    Button('Outline').variant('outline'),
    Button('Ghost').variant('ghost'),
    Button('Soft').variant('soft')
  ])

const renderSizes = () =>
  Box().flex().gap(4).alignItems('center').children([
    Button('Small').size('sm'),
    Button('Medium').size('md'),
    Button('Large').size('lg')
  ])

const renderStates = () =>
  Box().flex().gap(4).flexWrap('wrap').children([
    Button('Default'),
    Button('Disabled').disabled(true),
    Button('Pill').shape('pill')
  ])
</script>

# Button

An interactive button component with multiple variants, sizes, and states.

`Button` is a fundamental interactive element that handles user clicks and actions. It supports various visual styles, loading states, and can be disabled when needed.

## Live Examples

### Variants

<ReactWrapper :component="renderVariants" />

::: details View Source
```tsx
Box().flex().gap(4).flexWrap('wrap').children([
  Button('Primary').variant('primary'),
  Button('Secondary').variant('secondary'),
  Button('Outline').variant('outline'),
  Button('Ghost').variant('ghost'),
  Button('Soft').variant('soft')
])
```
:::

### Sizes

<ReactWrapper :component="renderSizes" />

::: details View Source
```tsx
Box().flex().gap(4).alignItems('center').children([
  Button('Small').size('sm'),
  Button('Medium').size('md'),
  Button('Large').size('lg')
])
```
:::

### States

<ReactWrapper :component="renderStates" />

::: details View Source
```tsx
Box().flex().gap(4).flexWrap('wrap').children([
  Button('Default'),
  Button('Disabled').disabled(true),
  Button('Pill').shape('pill')
])
```
:::

Complete method table (generated from source): [Button API](/api/builders/Button).

## Constructor

`Button(text?: string | (() => string))`

## Methods (source)

| Method | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `.text` | `string \| (() => string)` | `''` | Label; function form marks the button as an observer |
| `.variant` | `'elevated' \| 'filled' \| 'outlined' \| 'text' \| 'ghost' \| 'soft' \| 'outline' \| 'raw' \| 'solid'` | `'elevated'` | Visual style |
| `.clean` | — | — | Sets variant `raw` |
| `.size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `.shape` | `'default' \| 'pill' \| 'square' \| 'rect' \| 'rounded' \| 'sharp'` | `'default'` | Corner treatment |
| `.tone` | `'default' \| 'inverse'` | `'default'` | Inverse chrome |
| `.motion` | `'default' \| 'none'` | `'default'` | Built-in press scale |
| `.shadow` | `'none' \| 'soft'` | `'none'` | Extra shadow |
| `.expand` | `boolean` | `true` when called | Full-width |
| `.icon` | `ReactNode` | — | Leading icon |
| `.disabled` | `boolean` | `true` when called | Disabled |
| `.onPress` | `() => void` | — | Click (preferred) |
| `.onHover` | `() => void` | — | `mouseenter` callback — not CSS hover |
| `.onClick` | inherited | — | Raw DOM click |

There is **no** `.loading()` or `.pill()` — use a `Spinner` child / `.disabled()`, and `.shape('pill')`.

### Hover handler

`.onHover` is a **callback**, not the CSS hover style. Use builder `.hover()` for visual hover.

```tsx
Button('Notify')
  .onHover(() => console.log('entered'))
  .hover((h) => h.scale(1.03))
  .onPress(submit)
```

### Custom styling

```ts snippet
import { Button } from 'fiboui';

export default function Example() {
  return Button('Custom').variant('ghost').p(6).fontSize('18px').fontWeight('bold');
}
```

## See Also

- [TextField](/components/interactive-inputs) - Text input component
- [Select](/components/interactive-all) - Dropdown selector
- [Checkbox](/components/interactive-all) - Checkbox input
